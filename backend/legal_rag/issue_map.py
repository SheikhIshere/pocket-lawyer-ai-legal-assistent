"""Build an on-demand issue map from universal roles and cited sections."""

import hashlib
import json
import re
import unicodedata

from .models import LegalChunk, LegalElement, LegalIssue
from .roles import ELEMENT_ROLES, ROLE_QUESTIONS
from .services import get_section_window, retrieve_legal_chunks
from .text import term_present

MAP_PROMPT = """You are a Bangladesh legal element extractor. Use ONLY the
candidate sections. For every role, decide whether one candidate section
states that element. Return ONLY JSON:
{"roles": {"actors": {"found": true, "quote": "exact sentence copied from a
candidate", "section_number": "number or empty", "confidence": 0.0}, ...}}
If no candidate states a role, use {"found": false, "quote": "",
"section_number": "", "confidence": 0.0}.

Issue: {issue}

Roles:
{roles}

Candidates:
{candidates}
JSON:"""

MAP_GROUPS = (
    ("actors", "conditions", "prohibited_act", "intent"),
    ("exception", "consequence", "procedure", "forum", "time_limit"),
    ("evidence", "remedy", "authority", "backfire"),
)


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


def _norm(text):
    text = unicodedata.normalize("NFKC", text or "").lower()
    text = text.translate(
        str.maketrans({
            "\u2019": "'", "\u2018": "'",
            "\u201c": '"', "\u201d": '"',
            "\u2013": "-", "\u2014": "-",
        })
    )
    return " ".join(re.findall(r"[^\s]+", text))


ISSUE_STOPWORDS = {
    "the", "a", "an", "of", "for", "and", "or", "in", "on", "to", "under",
    "act", "section", "punishment", "law", "legal", "what", "is", "are",
}


def issue_tokens(issue):
    words = re.findall(
        r"[a-z0-9\u0980-\u09ff]+", (issue.get("title") or "").lower()
    )
    return [w for w in words if len(w) >= 3 and w not in ISSUE_STOPWORDS]


def relevant_quote(issue, quote):
    # ponytail: lexical issue-token guard; replace with a relevance model if
    # legitimate elements start failing because they use synonyms.
    tokens = issue_tokens(issue)
    if not tokens:
        return True
    lowered = (quote or "").lower()
    return any(term_present(token, lowered) for token in tokens)


def quote_in(quote, text):
    quote = _norm(quote).strip(" .,;:!?\"'")
    body = _norm(text)
    return bool(quote) and quote in body


def _candidates(issue, k):
    query = " ".join(
        part for part in (issue.get("title"), issue.get("act_title")) if part
    ).strip()
    chunks = retrieve_legal_chunks(query or issue.get("title", ""), k=k)
    act = (issue.get("act_title") or "").lower()
    if act:
        filtered = [
            chunk for chunk in chunks
            if act in (chunk.get("document_title") or "").lower()
        ]
        chunks = filtered or chunks
    hint = str(issue.get("section_hint") or "")
    if act and hint.isdigit():
        window = get_section_window(
            issue.get("act_title"), hint, before=2, after=3
        )
        seen = {chunk.get("id") for chunk in window}
        chunks = window + [
            chunk for chunk in chunks if chunk.get("id") not in seen
        ]
    return chunks


def _candidate_text(chunks):
    return "\n\n".join(
        f"[C{index}] {chunk.get('document_title') or 'Untitled'} — "
        f"{chunk.get('section_label') or ''}\n"
        f"{' '.join((chunk.get('text') or '').split())[:1200]}"
        for index, chunk in enumerate(chunks, start=1)
    )


def _match(chunks, quote, section_number):
    for chunk in chunks:
        if section_number and str(chunk.get("section_number") or "") != str(section_number):
            continue
        if quote_in(quote, chunk.get("text") or ""):
            return chunk
    for chunk in chunks:
        if quote_in(quote, chunk.get("text") or ""):
            return chunk
    return None


def _missing(reason, section=""):
    return {
        "status": "missing", "quote": "", "chunk_id": None,
        "section_number": str(section)[:32], "section_title": "",
        "reason": reason, "confidence": 0.0,
    }


def _role_lines(roles):
    return "\n".join(
        f"- {role}: {ROLE_QUESTIONS[role]}" for role in roles
    )


def _parse_rows(data, chunks, issue):
    if isinstance(data, dict) and isinstance(data.get("roles"), dict):
        data = data["roles"]
    if not isinstance(data, dict):
        return None
    if not any(isinstance(data.get(role), dict) for role in ELEMENT_ROLES):
        return None
    result = {}
    for role in ELEMENT_ROLES:
        item = data.get(role)
        if not isinstance(item, dict):
            result[role] = _missing("extractor_missing")
            continue
        found = bool(item.get("found"))
        quote = str(item.get("quote") or "")
        section = str(item.get("section_number") or "")
        chunk = _match(chunks, quote, section) if found else None
        if not found:
            result[role] = _missing("not_found", section)
            continue
        if chunk is None:
            result[role] = _missing("quote_not_found", section)
            continue
        if not relevant_quote(issue, quote):
            result[role] = _missing("not_relevant_to_issue", section)
            continue
        result[role] = {
            "status": "found",
            "quote": quote[:2000],
            "chunk_id": chunk.get("id"),
            "section_number": str(
                chunk.get("section_number") or section
            )[:32],
            "section_title": (chunk.get("section_title") or "")[:255],
            "reason": "",
            "confidence": float(item.get("confidence") or 0.0),
        }
    return result


def _build_group(issue, roles, chunks, complete):
    prompt = (
        MAP_PROMPT.replace("{issue}", issue.get("title", ""))
        .replace("{roles}", _role_lines(roles))
        .replace("{candidates}", _candidate_text(chunks))
    )
    try:
        data = _parse(complete(prompt, timeout=20, max_models=2))
    except Exception as exc:
        return {
            role: _missing(f"extractor_failed: {exc}") for role in roles
        }
    rows = _parse_rows(data, chunks, issue)
    if rows is None:
        return {role: _missing("invalid_json") for role in roles}
    return {role: rows[role] for role in roles}


def build_map(issue, k=10, complete=None, chunks=None):
    complete = complete or _platform_complete
    if chunks is None:
        chunks = _candidates(issue, k)
    if not chunks:
        return {
            role: _missing("no_candidates") for role in ELEMENT_ROLES
        }

    prompt = (
        MAP_PROMPT.replace("{issue}", issue.get("title", ""))
        .replace("{roles}", _role_lines(ELEMENT_ROLES))
        .replace("{candidates}", _candidate_text(chunks))
    )
    try:
        data = _parse(complete(prompt, timeout=20, max_models=2))
    except Exception as exc:
        print(f"Issue map batch failed: {exc}")
        data = None

    rows = _parse_rows(data, chunks, issue)
    if rows is not None:
        found = sum(
            1 for row in rows.values() if row["status"] == "found"
        )
        # ponytail: one batch call is cheap but conservative; when fewer than
        # two roles land, retry in three smaller groups. Drop the retry if the
        # batch prompt starts matching the grouped recall.
        if found >= 2:
            return rows

    result = {}
    for roles in MAP_GROUPS:
        result.update(_build_group(issue, roles, chunks, complete))
    return result


def save_map(issue, elements):
    slug_base = f"{issue.get('title', '')}|{issue.get('act_title', '')}|{issue.get('section_hint', '')}"
    slug = hashlib.sha256(slug_base.encode("utf-8")).hexdigest()[:24]
    legal_issue, _ = LegalIssue.objects.update_or_create(
        slug=slug,
        defaults={
            "title": issue.get("title", "")[:512],
            "act_title": issue.get("act_title", "")[:512],
            "section_hint": issue.get("section_hint", "")[:64],
            "domain_label": issue.get("domain_label", "")[:64],
        },
    )
    for role, row in elements.items():
        chunk = (
            LegalChunk.objects.filter(pk=row["chunk_id"]).first()
            if row.get("chunk_id")
            else None
        )
        LegalElement.objects.update_or_create(
            issue=legal_issue,
            role=role,
            defaults={
                "chunk": chunk,
                "quote": row.get("quote", "")[:4000],
                "status": row.get("status", "missing"),
                "confidence": row.get("confidence", 0.0),
                "verified": row.get("status") == "found",
            },
        )
    return legal_issue
