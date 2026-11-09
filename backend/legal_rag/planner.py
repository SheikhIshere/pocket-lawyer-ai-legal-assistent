"""AI query planner for the legal assistant.

The planner replaces the old hardcoded legal vocabulary. It reads the user's
question, identifies the legal issue, and returns the search phrases and the
one clarifying question (if any) that the rest of the pipeline needs.
"""

import json
import re

PLANNER_PROMPT = """You are the query planner for a Bangladesh legal assistant.
Return ONLY one JSON object, with no prose before or after it.

Keys:
- intent: one of legal_question, vague_legal, chit_chat, gibberish, out_of_scope
- answer_first: true when the question is clear enough to answer now
- search_queries: 2 to 4 short search phrases using the words a Bangladesh
  statute would use. If the question is in Bangla, include Bangla phrases.
- The corpus contains Bangla statutes. For an English question, include at
  least one Bangla phrase for the statutory concept, so the Bangla Act title
  is found. Translate the concept yourself; do not use a fixed word list.
- bangla_query: a natural Bangla translation of the user's question. Translate
  the sentence, not the English Act name. Empty when the question is Bangla.
- lexical_query: one short phrase with the Act name and statutory words,
  used for exact keyword search. When the governing Act is likely Bangla,
  lexical_query must contain the Bangla words from bangla_query.
- slots_missing: facts the Act requires but the user did not provide
- clarifying_question: one question, or null

Rules:
- A complete question is legal_question. Do not ask a question for it.
- answer_first is true unless the question is genuinely ambiguous. Asking
  what the law requires (age, fee, procedure) is not a missing fact; answer
  the rule.
- Mark a slot missing only when the user's own facts are needed to apply the
  law. Do not ask for their age when they asked what the minimum age is.
- Ask at most one clarifying question, only when a required fact is missing.
- Never ask why the user wants something.
- Do not repeat a question already asked in the conversation.
- Gibberish gets intent gibberish; unrelated chat gets out_of_scope.
- Never invent a fee, age, or section. The answer stage will state gaps.

Conversation so far:
{history}

Question: {question}
JSON:"""

VALID_INTENTS = {
    "legal_question",
    "vague_legal",
    "chit_chat",
    "gibberish",
    "out_of_scope",
}


def _fallback(question):
    return {
        "intent": "legal_question" if question else "gibberish",
        "answer_first": True,
        "planner_ok": False,
        "search_queries": [question] if question else [],
        "lexical_query": question,
        "bangla_query": "",
        "slots_missing": [],
        "clarifying_question": None,
    }


def _parse_json(raw):
    text = (raw or "").strip()
    start = text.find("{")
    end = text.rfind("}")
    if start < 0 or end <= start:
        return None
    try:
        return json.loads(text[start:end + 1])
    except (TypeError, ValueError):
        return None


def plan_question(question, history, complete):
    """Return a validated plan; fail open to the original question."""
    question = (question or "").strip()
    if not question:
        return _fallback("")

    prompt = PLANNER_PROMPT.format(
        history=(history or "")[-2000:],
        question=question,
    )
    try:
        raw = complete(prompt, timeout=12, max_models=2)
        data = _parse_json(raw)
    except Exception as exc:
        print(f"Legal RAG planner failed: {exc}")
        return _fallback(question)

    if not isinstance(data, dict):
        return _fallback(question)

    intent = str(data.get("intent") or "legal_question").lower()
    if intent not in VALID_INTENTS:
        intent = "legal_question"

    queries = []
    for item in data.get("search_queries") or []:
        if isinstance(item, str):
            item = " ".join(item.split())
            if item and item.lower() != question.lower():
                queries.append(item)

    bangla = data.get("bangla_query")
    if not isinstance(bangla, str) or not bangla.strip():
        bangla = ""
    else:
        bangla = " ".join(bangla.split())

    if intent in {"legal_question", "vague_legal"}:
        queries = ([question, bangla] if bangla else [question]) + queries
    queries = list(dict.fromkeys(queries))[:4]
    if intent in {"legal_question", "vague_legal"} and not queries:
        queries = [question]

    clarifying = data.get("clarifying_question")
    if not isinstance(clarifying, str) or not clarifying.strip():
        clarifying = None
    else:
        clarifying = " ".join(clarifying.split())

    lexical = data.get("lexical_query")
    if not isinstance(lexical, str) or not lexical.strip():
        lexical = queries[-1] if queries else question
    else:
        lexical = " ".join(lexical.split())
    if bangla:
        lexical = f"{lexical} {bangla}"

    return {
        "intent": intent,
        "answer_first": bool(data.get("answer_first", True)),
        "planner_ok": True,
        "search_queries": queries,
        "lexical_query": lexical,
        "bangla_query": bangla,
        "slots_missing": [
            slot
            for slot in (data.get("slots_missing") or [])
            if isinstance(slot, str)
        ],
        "clarifying_question": clarifying,
    }
