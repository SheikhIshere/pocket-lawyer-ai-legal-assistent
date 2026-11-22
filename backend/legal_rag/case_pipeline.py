"""The 23-step case loop as a plain, testable state machine.

No framework, no LLM call for the loop itself. The caller supplies
``retrieve`` and ``complete`` so Django, tests, and a future worker can
use the same logic.

Every branch appends a ``trace`` record to ``case_state`` so the UI can
show which diagram step ran and what it decided (never raw chain of thought).
"""

from __future__ import annotations

import contextvars
import copy
import re
import time

from django.conf import settings

from .issue_map import build_map
from .issue_spotter import spot
from .roles import ELEMENT_ROLES, ROLE_QUESTIONS
from .services import get_section_window

MAX_QUESTIONS = 3
MAX_ROUNDS = 2

# ponytail: 0.4 tuned on 3 real spot() runs (bail 0.98, tenancy 0.93,
# police 0.31); recalibrate on a 50-question gold set once available.
MIN_ISSUE_CONFIDENCE = 0.4
MAX_CORRECTIONS = 20

# One callback per turn; set/reset by run_case_turn so the worker never leaks
# a handler between requests.
_on_step = contextvars.ContextVar("case_step", default=None)

EMERGENCY_MESSAGE = (
    "This sounds urgent. Contact emergency services or a lawyer now. "
    "I can explain the law, but I cannot handle an emergency."
)
DEFER_MESSAGE = "I could not find this in the provided legal sources."


def _load(case_state):
    state = copy.deepcopy(case_state or {})
    state.setdefault("facts", {})
    state.setdefault("issues", [])
    state.setdefault("coverage", {})
    state.setdefault("asked", 0)
    state.setdefault("rounds", 0)
    state.setdefault("pending_question", "")
    state.setdefault("stage", "load")
    state.setdefault("trace", [])
    state.setdefault("corrections", [])
    return state


def _trace(state, step, name, status, detail):
    """Append one diagram-step record to the turn trace."""
    records = state.setdefault("trace", [])
    if records and records[-1].get("step") == step and records[-1].get("status") == status:
        return  # same step, same status: keep the first record
    records.append({
        "step": step, "name": name, "status": status, "detail": detail[:200],
        "at": round(time.time(), 3),
    })
    callback = _on_step.get()
    if callback:
        try:
            callback(dict(records[-1]))
        except Exception as exc:
            print(f"Step callback skipped: {exc}")


def _gate(issues, verdict):
    """Diagram steps 9/18: decide answer/defer from signals that are reliable.

    Only the retrieval verdict and issue confidence feed the branch. Role
    coverage feeds the prompt and trace instead — strict role gating waits
    for the peer corpus repair.
    """
    if not issues:
        reason = "no_issues" if verdict != "not_covered" else "retrieval_not_covered"
        return "defer", reason
    if verdict == "not_covered":
        return "defer", "retrieval_not_covered"
    best = max(issue.get("confidence") or 0.0 for issue in issues)
    if best < MIN_ISSUE_CONFIDENCE:
        return "defer", "low_confidence"
    return "answer", None


def _merge_sources(primary, extra):
    seen = {
        (chunk.get("id"), chunk.get("chunk_id")) for chunk in primary
    }
    merged = list(primary)
    for chunk in extra or []:
        key = (chunk.get("id"), chunk.get("chunk_id"))
        if key not in seen:
            seen.add(key)
            merged.append(chunk)
    return merged


def _result(action, state, **extra):
    payload = {"action": action, "case_state": state,
               "trace": state.get("trace") or []}
    payload.update(extra)
    return payload


def _gaps(coverage):
    return [
        role for role in ELEMENT_ROLES
        if coverage.get(role) != "found"
    ]


def _apply_correction(state, correction):
    """Diagram step 23: store the corrected fact and invalidate what it fed.

    Only the affected branch is cleared: issues whose title shares a token
    with the corrected fact key lose their coverage, so the same turn
    re-researches them (bounded by MAX_ROUNDS). Nothing else is touched.
    """
    state.setdefault("facts", {})
    state.setdefault("corrections", [])
    state.setdefault("coverage", {})
    match = re.match(r"^\s*([^:]{1,64})\s*:\s*(.{1,300})$", correction or "")
    if not match:
        # natural phrasing: "Correction: the bail was anticipatory"
        match = re.match(
            r"^\s*([a-z0-9_ -]{1,64})\s+(?:is|are|was|were)\s+(.{1,300})$",
            correction or "",
            flags=re.IGNORECASE,
        )
    if not match:
        return
    key, value = match.group(1).strip(), match.group(2).strip()
    state["facts"][key] = value
    state["corrections"].append(f"{key}: {value}")
    state["corrections"] = state["corrections"][-MAX_CORRECTIONS:]
    key_tokens = set(re.findall(r"[a-z0-9\u0980-\u09ff]{3,}", key.lower()))
    if key_tokens and state.get("issues"):
        cleared = []
        for issue in state["issues"]:
            title_tokens = set(
                re.findall(
                    r"[a-z0-9\u0980-\u09ff]{3,}",
                    (issue.get("title") or "").lower(),
                )
            )
            if key_tokens & title_tokens:
                continue  # affected: drop it, it will be re-spotted
            cleared.append(issue)
        if len(cleared) != len(state["issues"]):
            state["issues"] = cleared
            state["coverage"] = {}
    _trace(state, 23, "learn", "done", f"correction stored: {key}")


def run_case_turn(message, case_state, plan, retrieve, complete=None,
                  correction=None, on_step=None):
    """Run one chat turn and return the next action.

    Returns ``{"action": "ask"|"answer"|"defer", "case_state": ... }``.
    ``case_state["trace"]`` carries the per-step record for the UI.
    ``on_step`` receives each record as it happens (live feed).
    """
    token = _on_step.set(on_step)
    try:
        return _run_case_turn(
            message, case_state, plan, retrieve, complete, correction,
        )
    finally:
        _on_step.reset(token)


def _run_case_turn(message, case_state, plan, retrieve, complete=None,
                   correction=None):
    """Internal body of run_case_turn (callback set via _on_step)."""
    state = _load(case_state)
    state["trace"] = []  # per-turn trace; the UI shows one turn, not history
    _trace(state, 1, "load", "done", "case state loaded")
    risk = str(plan.get("risk") or "normal").lower()

    if risk == "emergency":
        state["stage"] = "safety"
        _trace(state, 2, "safety", "done", "emergency detected")
        return _result(
            "defer", state, reason="emergency", message=EMERGENCY_MESSAGE
        )

    if risk == "off_topic":
        state["stage"] = "safety"
        _trace(state, 2, "safety", "done", "off-topic request")
        return _result(
            "defer", state, reason="off_topic", message=DEFER_MESSAGE
        )

    if plan.get("intent") in {"chit_chat", "gibberish", "out_of_scope"}:
        state["stage"] = "classify"
        _trace(state, 3, "classify", "done", f"intent: {plan.get('intent')}")
        return _result(
            "defer", state, reason="intent", message=DEFER_MESSAGE
        )

    if correction:
        _apply_correction(state, correction)

    facts = plan.get("known_facts")
    if isinstance(facts, dict):
        for key, value in facts.items():
            state["facts"][str(key)[:64]] = str(value)[:300]
    _trace(state, 6, "know", "done", f"{len(state['facts'])} fact(s) on record")

    slots = [
        slot for slot in (plan.get("slots_missing") or [])
        if isinstance(slot, str) and slot.strip()
    ]
    question = plan.get("clarifying_question")
    if (
        slots
        and isinstance(question, str)
        and question.strip()
        and state["asked"] < MAX_QUESTIONS
    ):
        state["asked"] += 1
        state["pending_question"] = question.strip()
        state["stage"] = "ask"
        _trace(state, 8, "ask", "done", f"missing: {', '.join(slots[:3])}")
        return _result(
            "ask", state, question=state["pending_question"]
        )

    sources = retrieve(
        message,
        plan.get("search_queries") or [message],
        plan.get("lexical_query") or message,
    )
    _trace(state, 11, "search", "done", f"{len(sources)} source(s)")
    if not sources:
        state["stage"] = "research"
        _trace(state, 9, "gate", "failed", "no sources retrieved")
        return _result(
            "defer", state, reason="no_sources", message=DEFER_MESSAGE
        )

    answer_plan = {
        "risk": risk,
        "coverage": {},
        "gaps": [],
        "defence": "",
        "backfire": "",
        "issues": [],
        "section_window": "",
    }

    spot_data = None
    if getattr(settings, "LEGAL_RAG_CASE_MAP", False) and complete:
        try:
            spot_data = spot(message, chunks=sources, complete=complete)
            issues = spot_data.get("issues") or []
            _trace(state, 4, "map", "done", f"{len(issues)} issue(s) spotted")
            if issues:
                issue = issues[0]
                rounds = 0
                elements = {}
                while True:
                    elements = build_map(issue, complete=complete)
                    coverage = {
                        role: row.get("status", "missing")
                        for role, row in elements.items()
                    }
                    missing = [
                        role for role in ELEMENT_ROLES
                        if coverage.get(role) != "found"
                    ]
                    if not missing or rounds >= MAX_ROUNDS - 1:
                        break
                    query = f"{message} {ROLE_QUESTIONS[missing[0]]}"
                    try:
                        extra = retrieve(query, [query], query)
                    except Exception as exc:
                        print(f"Case round skipped: {exc}")
                        break
                    merged = _merge_sources(sources, extra)
                    if len(merged) == len(sources):
                        break
                    sources = merged
                    rounds += 1

                hint = str(issue.get("section_hint") or "")
                act = str(issue.get("act_title") or "")
                if act and hint.isdigit():
                    try:
                        window = get_section_window(act, hint)
                    except Exception as exc:
                        print(f"Section drill skipped: {exc}")
                        window = None
                    if window:
                        answer_plan["section_window"] = " ".join(
                            chunk.get("text") or "" for chunk in window
                        )[:3000]
                        sources = _merge_sources(window, sources)
                        _trace(state, 12, "drill", "done", f"{act} s.{hint}")
                    else:
                        _trace(state, 12, "drill", "skipped", "no window found")

                state["issues"] = issues[:2]
                state["coverage"] = coverage
                state["rounds"] = rounds
                answer_plan["coverage"] = coverage
                answer_plan["gaps"] = _gaps(coverage)
                answer_plan["defence"] = (
                    (elements.get("exception") or {}).get("quote") or ""
                )
                answer_plan["backfire"] = (
                    (elements.get("backfire") or {}).get("quote") or ""
                )
                answer_plan["issues"] = issues[:2]
                found = sum(
                    1 for status in coverage.values() if status == "found"
                )
                _trace(state, 13, "coverage", "done", f"{found}/13 roles found")
            else:
                state["issues"] = []
                state["coverage"] = {}
                _trace(state, 13, "coverage", "done", "no issue to map")
        except Exception as exc:
            print(f"Case map skipped: {exc}")
            _trace(state, 4, "map", "failed", type(exc).__name__)

    if getattr(settings, "LEGAL_RAG_CASE_MAP", False):
        # Use the fresh spot result; only fall back to stored issues when the
        # map could not run at all. Stale issues must not gate a new turn.
        gate_issues = (spot_data or {}).get("issues")
        if gate_issues is None:
            gate_issues = state.get("issues") or []
        gate_verdict = (spot_data or {}).get("verdict") or "covered"
        action, reason = _gate(gate_issues, gate_verdict)
        state["gate_reason"] = reason
        _trace(state, 9, "gate", "done" if action == "answer" else "failed",
               f"verdict={gate_verdict} reason={reason}")
        if action == "defer":
            state["stage"] = "answer"
            return _result(
                "defer", state, reason=reason, message=DEFER_MESSAGE
            )

    state["asked"] = 0
    state["pending_question"] = ""
    state["stage"] = "answer"
    _trace(state, 18, "plan", "done", "answer planned")
    return _result(
        "answer", state, sources=sources, answer_plan=answer_plan
    )
