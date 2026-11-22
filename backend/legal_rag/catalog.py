"""Build a catalog of every Act from the official index, not a manual list."""

import re
from dataclasses import dataclass
from urllib.parse import unquote, urljoin

from bs4 import BeautifulSoup

from .sections import detect_language

STOPWORDS = {
    "the", "act", "of", "and", "or", "a", "an", "no", "regulation",
    "ordinance", "amendment", "repeal", "supplementary", "part", "volume",
}


def _tokens(text):
    tokens = set()
    for token in re.findall(r"[a-z0-9]+", (text or "").lower()):
        if len(token) <= 2 or token in STOPWORDS:
            continue
        if re.fullmatch(r"(1[6-9]\d{2}|20\d{2})", token):
            continue
        tokens.add(token)
    return tokens


def link_status(title, pdf_url):
    """Flag index rows whose PDF filename does not match the title."""
    filename = unquote(pdf_url.rsplit("/", 1)[-1])
    title_tokens = _tokens(title)
    if not title_tokens:
        return "unknown"
    file_tokens = _tokens(filename)
    overlap = len(title_tokens & file_tokens) / len(title_tokens)
    return "active" if overlap >= 0.5 else "link_mismatch"


@dataclass(frozen=True)
class ActRef:
    title: str
    act_no: str
    year: str
    pdf_url: str
    language: str = "en"
    status: str = "unknown"


def _clean(text):
    return " ".join((text or "").split())


def parse_index(html, index_url):
    """Parse the official chronological index into one row per PDF."""
    soup = BeautifulSoup(html, "html.parser")
    refs = {}
    for row in soup.find_all("tr"):
        links = [
            a
            for a in row.find_all("a", href=True)
            if a["href"].lower().endswith(".pdf")
        ]
        if not links:
            continue
        url = urljoin(index_url, links[0]["href"])
        cells = [_clean(td.get_text(" ", strip=True)) for td in row.find_all("td")]
        title = cells[0] if cells else _clean(links[0].get_text(" ", strip=True))
        act_no = cells[1] if len(cells) > 1 else ""
        year = cells[2] if len(cells) > 2 else ""
        if not title or len(title) < 3:
            continue
        if not re.fullmatch(r"(1[6-9]\d{2}|20\d{2})", year or ""):
            found = re.search(r"\b(1[6-9]\d{2}|20\d{2})\b", f"{title} {year}")
            year = found.group(1) if found else ""
        refs.setdefault(
            url,
            ActRef(
                title=title[:512],
                act_no=act_no[:64],
                year=year[:8],
                pdf_url=url,
                language=detect_language(title),
                status=link_status(title, url),
            ),
        )
    return list(refs.values())


def normalize_title(title):
    value = (title or "").lower()
    value = re.sub(r"^the\s+", "", value)
    value = re.sub(r"[^a-z0-9\u0980-\u09ff]+", " ", value)
    return " ".join(value.split())


def reconcile(refs, local_titles):
    """Match catalog rows to existing LegalDocument titles."""
    local = {normalize_title(title): title for title in local_titles if title}
    catalog = {normalize_title(ref.title) for ref in refs}
    matched = [ref for ref in refs if normalize_title(ref.title) in local]
    missing = [ref for ref in refs if normalize_title(ref.title) not in local]
    extra = [title for key, title in local.items() if key not in catalog]
    return matched, missing, extra
