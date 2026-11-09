"""Embedding, retrieval and prompt-context helpers for the legal RAG index."""

import re
import time

import requests
from django.conf import settings
from django.db.models import Q
from google import genai
from google.genai import types
from pgvector.django import CosineDistance

from .models import LegalChunk, LegalDocument
from .text import normalize_digits, term_present

EMBEDDING_BATCH_SIZE = 64
EMBEDDING_MAX_RETRIES = 5
EMBEDDING_RETRY_SECONDS = 60
REFUSAL = (
    "I could not find this in the provided legal sources. "
    "Please try to connect with a real lawyer licensed in Bangladesh. "
    "If you can tell me the Act or section, I can look it up."
)

# ponytail: the planner supplies the search terms, so this only checks how
# much of that generated query a cited chunk actually covers. Raise it for
# stricter grounding; lower it only with an eval showing false refusals.
MIN_GROUNDING_COVERAGE = 0.5


def _client():
    api_key = getattr(settings, "GEMINI_API_KEY", None)
    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is not configured; legal embeddings cannot be created."
        )
    return genai.Client(api_key=api_key)


def _ollama_embeddings(texts):
    url = f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/embed"
    cleaned = [re.sub(r"\s+", " ", text).strip() for text in texts]
    response = requests.post(
        url,
        json={
            "model": settings.LEGAL_RAG_EMBEDDING_MODEL,
            "input": cleaned,
        },
        timeout=180,
    )
    response.raise_for_status()
    return response.json().get("embeddings") or []


def embed_texts(texts):
    """Return one embedding vector for each input text from the configured provider."""
    if not texts:
        return []

    expected_dim = settings.LEGAL_RAG_EMBEDDING_DIM
    provider = getattr(settings, "LEGAL_RAG_EMBEDDING_PROVIDER", "gemini")
    client = _client() if provider == "gemini" else None
    vectors = []

    for start in range(0, len(texts), EMBEDDING_BATCH_SIZE):
        batch = texts[start:start + EMBEDDING_BATCH_SIZE]
        batch_vectors = []
        for attempt in range(EMBEDDING_MAX_RETRIES):
            try:
                if provider == "ollama":
                    batch_vectors = _ollama_embeddings(batch)
                else:
                    result = client.models.embed_content(
                        model=settings.LEGAL_RAG_EMBEDDING_MODEL,
                        contents=batch,
                        config=types.EmbedContentConfig(
                            output_dimensionality=expected_dim,
                        ),
                    )
                    batch_vectors = [
                        embedding.values for embedding in result.embeddings or []
                    ]
                break
            except Exception as exc:
                is_transient = (
                    "RESOURCE_EXHAUSTED" in str(exc)
                    or "429" in str(exc)
                    or "quota" in str(exc).lower()
                    or "Connection" in str(exc)
                    or "timed out" in str(exc).lower()
                    or "500 Server Error" in str(exc)
                    or "502 Server Error" in str(exc)
                    or "503 Server Error" in str(exc)
                )
                if not is_transient or attempt == EMBEDDING_MAX_RETRIES - 1:
                    raise
                time.sleep(EMBEDDING_RETRY_SECONDS if provider == "gemini" else 2)
        if len(batch_vectors) != len(batch):
            raise RuntimeError(
                f"Embedding count mismatch: expected {len(batch)}, "
                f"got {len(batch_vectors)}."
            )
        for vector in batch_vectors:
            if len(vector) != expected_dim:
                raise RuntimeError(
                    f"Embedding dimension mismatch: expected {expected_dim}, "
                    f"got {len(vector)}."
                )
        vectors.extend(batch_vectors)

    return vectors


def retrieve_legal_chunks(question, k=None, min_score=None):
    """Return the closest legal chunks for ``question``, nearest first."""
    question = (question or "").strip()
    if not question:
        return []

    limit = (
        getattr(settings, "LEGAL_RAG_CANDIDATE_K", 50)
        if k is None
        else int(k)
    )
    limit = max(1, limit)
    threshold = (
        settings.LEGAL_RAG_MIN_SCORE if min_score is None else float(min_score)
    )

    query_vector = embed_texts([question])[0]

    rows = (
        LegalChunk.objects.select_related("document")
        .annotate(distance=CosineDistance("embedding", query_vector))
        .order_by("distance")[:limit]
    )

    chunks = []
    for row in rows:
        score = 1.0 - float(row.distance)
        if threshold > 0 and score < threshold:
            continue
        chunks.append(
            {
                "id": row.id,
                "text": row.text,
                "section_label": row.section_label,
                "page_start": row.page_start,
                "page_end": row.page_end,
                "source_url": row.document.source_url,
                "document_title": row.document.title,
                "score": score,
            }
        )
    return chunks


def _query_terms(query):
    """Tokenize a planner query; no legal dictionary, no alias expansion."""
    terms = re.findall(r"[a-z0-9\u0980-\u09ff]+", (query or "").lower())
    terms = [normalize_digits(term) for term in terms]
    cleaned = []
    for term in terms:
        if re.search(r"[\u0980-\u09ff]", term):
            if len(term) >= 2:
                cleaned.append(term)
        elif len(term) >= 3 or term.isdigit():
            cleaned.append(term)
    return list(dict.fromkeys(cleaned))[:12]


def grounding_score(question, chunk, search_terms):
    """Best coverage of any one planner query, not a union of all queries."""
    haystack = (
        f"{chunk.get('document_title', '')} "
        f"{chunk.get('section_label', '')} "
        f"{chunk.get('text', '')}"
    ).lower()
    best = 0.0
    for query in search_terms or [question]:
        terms = _query_terms(query)
        if not terms:
            continue
        matched = sum(1 for term in terms if term_present(term, haystack))
        best = max(best, matched / len(terms))
    return best


def chunk_grounded(question, chunk, search_terms):
    """True when any one planner query is covered by the cited chunk."""
    heading = (
        f"{chunk.get('document_title', '')} "
        f"{chunk.get('section_label', '')}"
    ).lower()
    for query in search_terms or [question]:
        terms = _query_terms(query)
        if not terms:
            continue
        score = grounding_score(question, chunk, [query])
        if score < MIN_GROUNDING_COVERAGE:
            continue
        if len(terms) == 1 and not term_present(terms[0], heading):
            continue
        return True
    return False


def retrieve_legal_chunks_keyword(query, k=None):
    """Route by Act title and section heading; the vector arm reads body text."""
    terms = _query_terms(query)
    if not terms:
        return []
    limit = (
        getattr(settings, "LEGAL_RAG_CANDIDATE_K", 50)
        if k is None
        else int(k)
    )

    label_query = Q()
    for term in terms:
        if re.search(r"[\u0980-\u09ff]", term):
            label_query |= (
                Q(section_label__icontains=term)
                | Q(document__title__icontains=term)
            )
        else:
            pattern = rf"(^|[^a-z]){re.escape(term)}s?([^a-z]|$)"
            label_query |= (
                Q(section_label__iregex=pattern)
                | Q(document__title__iregex=pattern)
            )

    # Titles and section headings are small, so this stays fast. Body-text
    # matching is the vector arm's job.
    rows = list(
        LegalChunk.objects.select_related("document").filter(label_query)
    )

    numbers = [term for term in terms if term.isdigit()]
    amendment = re.compile(
        r"\b(substitut|insert|omit|amend|repeal)", re.IGNORECASE
    )
    word = re.compile(r"[a-z0-9\u0980-\u09ff]+")
    bangla = re.compile(r"[\u0980-\u09ff]")

    def hit(term, tokens, haystack):
        if bangla.search(term):
            return term in haystack
        if term in tokens or term + "s" in tokens:
            return True
        if term.endswith("s") and term[:-1] in tokens:
            return True
        if term.endswith("ment") and len(term) > 6 and term[:-4] in tokens:
            return True
        return False

    ranked = []
    for row in rows:
        heading = normalize_digits(
            f"{row.document.title}\n{row.section_label or ''}"
        ).lower()
        tokens = set(word.findall(heading))
        matched = [term for term in terms if hit(term, tokens, heading)]
        if not matched:
            continue
        coverage = len(matched) / len(terms)
        label_hits = len(matched)
        title_lower = normalize_digits(row.document.title).lower()
        title_tokens = set(word.findall(title_lower))
        title_hits = sum(
            1 for term in matched if hit(term, title_tokens, title_lower)
        )
        score = 0.6 * coverage + 0.2 * label_hits + 0.2 * title_hits
        if numbers and any(
            re.search(rf"(?<!\d){number}(?!\d)", heading) for number in numbers
        ):
            score += 0.2
        if numbers and amendment.search(heading):
            score -= 0.3
        row.coverage_score = coverage
        ranked.append((score, label_hits, title_hits, row))
    ranked.sort(key=lambda item: (item[0], item[1], item[2]), reverse=True)

    return [
        {
            "id": row.id,
            "text": row.text,
            "section_label": row.section_label,
            "page_start": row.page_start,
            "page_end": row.page_end,
            "source_url": row.document.source_url,
            "document_title": row.document.title,
            "score": score,
            "label_hits": label_hits,
            "title_hits": title_hits,
            "coverage": getattr(row, "coverage_score", 0.0),
        }
        for score, label_hits, title_hits, row in ranked[: max(1, limit)]
    ]


def rrf_fuse(weighted_lists, limit):
    """Fuse ranked lists with weighted Reciprocal Rank Fusion."""
    scores = {}
    chunks = {}
    for weight, items in weighted_lists:
        for rank, chunk in enumerate(items, start=1):
            key = chunk.get("id")
            if key is None:
                continue
            scores[key] = scores.get(key, 0.0) + weight / (60 + rank)
            entry = chunks.setdefault(key, dict(chunk))
            for field in (
                "label_hits",
                "title_hits",
                "coverage",
                "exact_gloss",
            ):
                if field in chunk:
                    entry.setdefault(field, chunk[field])
    ordered = sorted(scores, key=scores.get, reverse=True)
    return [chunks[key] for key in ordered[:limit]]


def _gloss_phrases(queries):
    """Short English phrases worth checking against the corpus text."""
    words = re.findall(r"[a-z0-9]+", " ".join(queries or []).lower())
    phrases = []
    for size in (2, 3):
        for start in range(len(words) - size + 1):
            phrase = " ".join(words[start:start + size])
            if len(phrase) >= 5:
                phrases.append(phrase)
    phrases.extend(word for word in words if len(word) >= 4)
    return list(dict.fromkeys(phrases))[:24]


def retrieve_legal_chunks_gloss(queries, max_df=5, k=30):
    """Match a rare English gloss that a Bangla statute carries in its text."""
    rows = []
    seen = set()
    checked = 0
    rare = 0
    for phrase in _gloss_phrases(queries):
        checked += 1
        if checked > 14:
            break
        matches = list(
            LegalChunk.objects.select_related("document")
            .filter(text__icontains=phrase)[: max_df + 1]
        )
        if not matches or len(matches) > max_df:
            continue
        for row in matches:
            if row.id in seen:
                continue
            seen.add(row.id)
            rows.append(row)
        rare += 1
        if rare >= 4 or len(rows) >= k:
            break
    return [
        {
            "id": row.id,
            "text": row.text,
            "section_label": row.section_label,
            "page_start": row.page_start,
            "page_end": row.page_end,
            "source_url": row.document.source_url,
            "document_title": row.document.title,
            "score": 0.5,
            "exact_gloss": True,
        }
        for row in rows[:k]
    ]


def promote_title_matches(chunks, lexical_query, queries=None):
    """Move Acts whose title contains rare planner terms to the front."""
    terms = _query_terms(
        " ".join(([lexical_query] if lexical_query else []) + (queries or []))
    )
    if not terms or not chunks:
        return chunks
    try:
        titles = [
            title.lower()
            for title in LegalDocument.objects.values_list("title", flat=True)
        ]
    except Exception as exc:
        print(f"Legal RAG title vote failed: {exc}")
        return chunks
    # A term in more than 50 of 1,447 titles is generic ("act", "procedure"),
    # not a routing signal. Terms in five or fewer titles are strong enough
    # to trust when the title model is unavailable. Measured, not listed.
    dfs = {
        term: sum(1 for title in titles if term_present(term, title))
        for term in terms
    }
    distinctive = [
        term for term, df in dfs.items() if 0 < df <= 50
    ]
    core = [term for term, df in dfs.items() if 0 < df <= 5]
    if not distinctive:
        return chunks
    for chunk in chunks:
        title = (chunk.get("document_title") or "").lower()
        chunk["planner_title_hits"] = sum(
            1 for term in distinctive if term_present(term, title)
        )
        chunk["planner_core_hits"] = sum(
            1 for term in core if term_present(term, title)
        )
    return sorted(
        chunks,
        key=lambda chunk: chunk.get("planner_title_hits", 0),
        reverse=True,
    )


def retrieve_multi_query(queries, limit=None, lexical_query=None):
    """Vector search every planner query; lexical search one exact phrase."""
    queries = [
        " ".join(query.split())
        for query in (queries or [])
        if isinstance(query, str) and query.strip()
    ]
    queries = list(dict.fromkeys(queries))[:4]
    if not queries:
        return []

    fused_limit = limit or max(1, getattr(settings, "LEGAL_RAG_TOP_K", 20)) * 8
    weighted = []
    for index, query in enumerate(queries):
        weight = 2.0 if index == 0 else 1.0
        try:
            weighted.append((weight, retrieve_legal_chunks(query)))
        except Exception as exc:
            print(f"Legal RAG vector retrieval failed for {query!r}: {exc}")

    try:
        gloss = retrieve_legal_chunks_gloss(
            ([lexical_query] if lexical_query else []) + queries
        )
        if gloss:
            # A rare exact gloss is stronger than any ranked list position.
            weighted.append((5.0, gloss))
    except Exception as exc:
        print(f"Legal RAG gloss retrieval failed: {exc}")

    # One lexical scan only: it is the expensive arm. The planner supplies
    # the phrase with the Act name and statutory words.
    exact = lexical_query or queries[-1]
    try:
        weighted.append((1.5, retrieve_legal_chunks_keyword(exact)))
    except Exception as exc:
        print(f"Legal RAG keyword retrieval failed for {exact!r}: {exc}")
    fused = rrf_fuse(weighted, limit=fused_limit)
    return promote_title_matches(
        fused, lexical_query or queries[-1], queries
    )


def build_context(chunks):
    """Render retrieved chunks as numbered source blocks for the prompt."""
    blocks = []
    total = 0
    max_chars = getattr(settings, "LEGAL_RAG_MAX_CONTEXT_CHARS", 30000)
    for index, chunk in enumerate(chunks, start=1):
        heading = f"[S{index}] {chunk.get('document_title') or 'Untitled document'}"

        section = chunk.get("section_label")
        if section:
            heading += f" — {section}"

        page_start = chunk.get("page_start")
        if page_start:
            page_end = chunk.get("page_end") or page_start
            heading += f" — pages {page_start}-{page_end}"

        block = f"{heading}\n{chunk.get('text', '')}"
        if blocks and total + len(block) > max_chars:
            break
        blocks.append(block)
        total += len(block)

    return "\n\n".join(blocks)


def refusal_message():
    return REFUSAL
