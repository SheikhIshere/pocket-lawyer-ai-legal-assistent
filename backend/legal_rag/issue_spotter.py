"""Spot legal issues from facts against the whole corpus; no domain list."""

import json
import re

from .coverage import coverage_score, verdict
from .services import retrieve_legal_chunks

SPOT_PROMPT = """You are a Bangladesh legal issue spotter. Read the facts and list
every legal issue they raise under Bangladesh law. The numbered candidate
sections are context, not a limit; when a candidate supports an issue, prefer
its Act name and section number. Return ONLY a JSON object:
{"issues": [{"title": "short issue name", "act_title": "Act name",
"section_hint": "section number or empty", "confidence": 0.0}]}
If the facts raise no legal issue, return {"issues": []}.

Facts: {question}

Candidates:
{candidates}
JSON:"""


def _parse(raw):
    text = (raw or "").strip()
    start, end = text.find("{"), text.rfind("}")
    if start < 0 or end <= start:
        return None
    try:
        return json.loads(text[start:end + 1])
    except (TypeError, ValueError):
        return None


def _platform_complete(prompt, **kwargs):
    from chat_bot.models import platform_completion

    return platform_completion(prompt, **kwargs)


def _candidate_text(chunks):
    blocks = []
    for index, chunk in enumerate(chunks, start=1):
        title = chunk.get("document_title") or "Untitled"
        section = chunk.get("section_label") or ""
        blocks.append(
            f"[C{index}] {title} — {section}\n"
            f"{' '.join((chunk.get('text') or '').split())[:900]}"
        )
    return "\n\n".join(blocks)


def spot(question, k=20, complete=None, chunks=None):
    question = (question or "").strip()
    if not question:
        return {"issues": [], "coverage": 0.0, "verdict": "not_covered",
                "reason": "empty_question"}
    if chunks is None:
        chunks = retrieve_legal_chunks(question, k=k)
    score = coverage_score(question, chunks)
    state = verdict(score)
    if state == "not_covered":
        return {"issues": [], "coverage": score, "verdict": state,
                "reason": "retrieval_not_covered"}
    complete = complete or _platform_complete
    prompt = (
        SPOT_PROMPT.replace("{question}", question)
        .replace("{candidates}", _candidate_text(chunks))
    )
    try:
        raw = complete(prompt, timeout=20, max_models=2)
    except Exception as exc:
        return {"issues": [], "coverage": score, "verdict": state,
                "reason": f"spotter_failed: {exc}"}
    data = _parse(raw)
    if not isinstance(data, dict):
        return {"issues": [], "coverage": score, "verdict": state,
                "reason": "invalid_json"}
    issues = []
    for item in data.get("issues") or []:
        if not isinstance(item, dict):
            continue
        title = " ".join(str(item.get("title") or "").split())
        if not title:
            continue
        issues.append(
            {
                "title": title[:512],
                "act_title": " ".join(str(item.get("act_title") or "").split())[:512],
                "section_hint": " ".join(
                    str(item.get("section_hint") or "").split()
                )[:64],
                "confidence": float(item.get("confidence") or 0.0),
            }
        )
    return {"issues": issues[:8], "coverage": score, "verdict": state}
