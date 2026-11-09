"""Convert legacy Bijoy/SutonnyMJ Bangla text to Unicode.

Many bdcode PDFs were typeset with the Bijoy font, so their extracted text is
ASCII-mangled (``AvBb`` instead of ``আইন``). The ``unicodeconverter`` package
handles the glyph map and reordering; this module only decides which lines are
actually Bijoy so English lines and already-Unicode text are left alone.
"""

import re

from unicodeconverter import convert_bijoy_to_unicode

# Characters that do not occur in ordinary English legal text but are common
# in Bijoy's ASCII encoding (pre-kars, reph, danda, conjunct marks). Copyright
# symbols, underscores, and backticks are deliberately excluded: they appear
# in English footers and would otherwise mangle English lines.
BIJOY_SIGNAL = re.compile(
    r"[©¤Ö‡†~^¶¨µ·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕ×ØÙÚÛÜÝÞß"
    r"àáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ]"
    r"|\b(?:AvBb|mswev|Aby‡”Q|Kwgkb|aviv|KZ©|AvB|Dc|Bs|nvB|Kiv|nB‡e|"
    r"Rb¨|Ges|Bnv|nj|_vK|hvB|K‡i|†K|‡m|Zvi|Avgv|Avgiv|Zzgb|Avcwb|"
    r"cÖ|gš¿|msÁv|weavb|AvBb)\b"
)

# Text that is already Unicode Bangla must not be fed back through the Bijoy
# map; only legacy lines need conversion.
BENGALI = re.compile(r"[\u0980-\u09ff]")

# Unicode-mangled PDF text (not classic Bijoy) needs OCR, not this converter.
BROKEN_UNICODE = re.compile(r"[ǯҶʨӃϲʙȟʕʖʗʘʠʣʤʥʦʧʬʭʮʯ]")

ENGLISH_LINE = re.compile(r"^[\sA-Za-z0-9.,;:'’\"()\[\]&/\\-]+$")

# A line with two or more common English words is English prose, not Bijoy,
# even if it contains a Windows-1252 dash or a stray Bijoy-like glyph.
ENGLISH_WORDS = re.compile(
    r"\b(?:the|of|and|to|in|for|shall|any|notwithstanding|government|act|"
    r"order|section|provided|person|under|with|by|or|be|is|are|this|that|"
    r"such|may|made|from|on|as|if|not|has|have|been|which|who|a|an)\b",
    re.IGNORECASE,
)

LABEL_PREFIX = re.compile(r"^(Section|Article|Page)\s+([^\s—]+)(\s*—\s*)?(.*)$")


def convert_line(line):
    """Convert one legacy line, or return it unchanged."""
    if not line.strip():
        return line
    if BROKEN_UNICODE.search(line):
        return line
    if len(ENGLISH_WORDS.findall(line)) >= 2:
        return line
    if not BIJOY_SIGNAL.search(line):
        return line
    if ENGLISH_LINE.match(line) and not BIJOY_SIGNAL.search(line):
        return line
    try:
        return convert_bijoy_to_unicode(line)
    except Exception:
        return line


def convert_text(text):
    """Convert every legacy line in ``text`` while preserving line breaks."""
    text = text or ""
    # The converter leaves a standalone "¤" (ম্) unmapped in a few conjuncts.
    if "¤" in text:
        text = text.replace("¤", "ম্")
    bengali = len(BENGALI.findall(text))
    latin = len(re.findall(r"[A-Za-z]", text))
    # Already-Unicode Bangla must not be fed through the Bijoy map; the 2026
    # captures use "|" as a separator and would otherwise be corrupted.
    if bengali and bengali > latin:
        return text
    english_words = len(ENGLISH_WORDS.findall(text))
    bijoy_signals = len(BIJOY_SIGNAL.findall(text))
    # English prose and finance tables can contain a stray Bijoy-like glyph;
    # do not convert a chunk that is mostly English.
    if english_words >= 3 and english_words > bijoy_signals:
        return text
    return "\n".join(convert_line(line) for line in text.split("\n"))


def convert_label(label):
    """Convert a section label without mangling its citation prefix."""
    label = label or ""
    match = LABEL_PREFIX.match(label)
    if match:
        prefix, number, dash, rest = match.groups()
        if not rest:
            return label
        if BENGALI.search(rest) and not BIJOY_SIGNAL.search(rest):
            converted = rest
        elif re.search(r"[০-৯]", number):
            # A Bangla section number means the title is Bangla even when the
            # line has no Bijoy-only glyph.
            converted = convert_bijoy_to_unicode(rest)
        else:
            converted = convert_line(rest)
        return f"{prefix} {number}{dash or ''}{converted}"
    return convert_line(label)
