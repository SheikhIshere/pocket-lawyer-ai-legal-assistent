"""Coverage verdict for a retrieved set, ported from the books fleet."""

import math
import re

from .text import term_present

COVERED = 0.60
PARTIAL = 0.35


def _terms(text):
    words = re.findall(r"[a-z0-9\u0980-\u09ff]+", (text or "").lower())
    return list(dict.fromkeys(word for word in words if len(word) >= 3))


def coverage_score(query, hits, term_df=None):
    """Share of query terms present in the retrieved text, IDF-weighted."""
    terms = _terms(query)
    if not terms:
        return 1.0
    total = sum(term_df.values()) if term_df else 1
    weights = {
        term: (
            math.log((total + 1) / (term_df.get(term, 0) + 1)) + 1.0
            if term_df
            else 1.0
        )
        for term in terms
    }
    haystack = " ".join(
        f"{hit.get('section_title', '')} {hit.get('section_label', '')} "
        f"{hit.get('text', '')}"
        for hit in hits
    ).lower()
    present = sum(
        weight for term, weight in weights.items() if term_present(term, haystack)
    )
    return present / sum(weights.values()) if weights else 1.0


def verdict(score):
    if score >= COVERED:
        return "covered"
    if score >= PARTIAL:
        return "partial"
    return "not_covered"
