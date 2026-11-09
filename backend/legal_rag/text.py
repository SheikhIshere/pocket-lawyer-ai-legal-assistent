"""Generic text helpers shared by retrieval and grounding checks.

No legal vocabulary lives here. The query planner supplies the legal terms;
these helpers only normalize digits and match words.
"""

import re

_ASCII_TO_BANGLA = str.maketrans("0123456789", "০১২৩৪৫৬৭৮৯")
_BANGLA_TO_ASCII = str.maketrans("০১২৩৪৫৬৭৮৯", "0123456789")


def normalize_digits(text):
    return (text or "").translate(_BANGLA_TO_ASCII)


def term_present(term, haystack):
    """True when ``term`` appears as a word (numbers must match exactly)."""
    term = normalize_digits(term)
    haystack = normalize_digits(haystack)
    if not term:
        return False
    if term.isdigit():
        return re.search(rf"(?<!\d){re.escape(term)}(?!\d)", haystack) is not None
    if re.search(r"[\u0980-\u09ff]", term):
        # Bangla suffixes attach to the word; substring is the safe check.
        return term in haystack
    lowered = haystack.lower()
    probes = [term]
    if term.endswith("s") and len(term) > 3:
        probes.append(term[:-1])
    if term.endswith("ment") and len(term) > 6:
        probes.append(term[:-4])
    return any(
        re.search(rf"(?<![a-z]){re.escape(probe)}s?(?![a-z])", lowered)
        for probe in probes
    )
