"""Parse official Act pages into sections without per-Act branches."""

import re
from urllib.parse import urljoin

from bs4 import BeautifulSoup

BANGLA_DIGITS = str.maketrans("০১২৩৪৫৬৭৮৯", "0123456789")
BENGALI = re.compile(r"[\u0980-\u09ff]")
LATIN = re.compile(r"[A-Za-z]")
SECTION_LABEL_RE = re.compile(
    r"^(Section|Article)\s+([0-9০-৯]+[A-Za-z]?)(?:\s*[—–-]\s*(.*))?$"
)
NUMBER_START_RE = re.compile(r"^\s*([0-9০-৯]+[A-Za-z]?)\s*[.।]\s*")


def decode_html(raw):
    """bdlaws serves UTF-16; bdcode serves UTF-8. Detect instead of guessing."""
    if isinstance(raw, str):
        return raw
    if raw.startswith((b"\xff\xfe", b"\xfe\xff")):
        return raw.decode("utf-16")
    try:
        return raw.decode("utf-8")
    except UnicodeDecodeError:
        return raw.decode("latin-1", errors="replace")


def normalize_section_number(value):
    value = (value or "").strip()
    value = value.translate(BANGLA_DIGITS)
    return value if re.fullmatch(r"\d+[A-Za-z]?", value) else value


def split_label(label):
    """``Section 12 — Title`` -> (``12``, ``Title``)."""
    label = " ".join((label or "").split())
    if not label:
        return "", ""
    if label.lower() == "preamble":
        return "", "Preamble"
    match = SECTION_LABEL_RE.match(label)
    if match:
        return normalize_section_number(match.group(2)), (match.group(3) or "").strip()
    return "", label


def detect_language(text):
    bangla = len(BENGALI.findall(text or ""))
    latin = len(LATIN.findall(text or ""))
    return "bn" if bangla > latin else "en"


def parse_act_page(html, base_url):
    """Return the Act title and its unique section links."""
    soup = BeautifulSoup(html, "html.parser")
    title_tag = soup.find("title")
    title = " ".join(title_tag.get_text(" ", strip=True).split()) if title_tag else ""
    title = title.split("|")[0].strip()

    sections = []
    seen = set()
    for anchor in soup.find_all("a", href=True):
        href = anchor["href"]
        if not re.search(r"/section-\d+\.html$", href):
            continue
        url = urljoin(base_url, href)
        if url in seen:
            continue
        seen.add(url)
        text = " ".join(anchor.get_text(" ", strip=True).split())
        match = re.match(r"^([0-9০-৯]+[A-Za-z]?)\.\s*(.*)$", text)
        if match:
            number = normalize_section_number(match.group(1))
            section_title = match.group(2).strip()
        else:
            number = ""
            section_title = text
        sections.append(
            {"number": number, "title": section_title, "url": url}
        )
    return {"title": title, "sections": sections}


def parse_section_page(html, base_url=""):
    """Extract one official section's heading and body."""
    soup = BeautifulSoup(html, "html.parser")
    content = soup.find(id="page-content") or soup.find("main") or soup.body
    if content is None:
        raise ValueError("section page has no content container")

    heading_tag = content.find(class_="txt-head")
    details_tag = content.find(class_="txt-details")
    heading = (
        " ".join(heading_tag.get_text(" ", strip=True).split())
        if heading_tag
        else ""
    )
    text = (
        "\n".join(
            line.strip()
            for line in details_tag.get_text("\n", strip=True).splitlines()
            if line.strip()
        )
        if details_tag
        else "\n".join(
            line.strip()
            for line in content.get_text("\n", strip=True).splitlines()
            if line.strip()
        )
    )
    match = NUMBER_START_RE.match(text)
    number = normalize_section_number(match.group(1)) if match else ""
    if not heading and match:
        heading = text[match.end():].split("\n", 1)[0].strip()[:255]
    if not heading:
        heading = f"Section {number}" if number else "Section"
    return {
        "number": number,
        "title": heading[:255],
        "text": text,
        "url": base_url,
    }
