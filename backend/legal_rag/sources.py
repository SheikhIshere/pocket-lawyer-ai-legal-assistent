"""Fetch official sources with an allowlist, snapshot, and no per-Act branches."""

import time
from urllib.parse import urlparse

import requests

from .sections import decode_html, parse_act_page, parse_section_page

ALLOWED_DOMAINS = {
    "bdlaws.minlaw.gov.bd",
    "bdcode.gov.bd",
    "www.bdcode.gov.bd",
}
MAX_BYTES = 8_000_000
USER_AGENT = "PocketLawyer/1.0 (official legal source resolver)"


def is_allowed(url):
    host = (urlparse(url).hostname or "").lower()
    return host in ALLOWED_DOMAINS


def fetch(url, timeout=30):
    if not is_allowed(url):
        raise ValueError(f"Domain is not allowlisted: {url}")
    response = requests.get(
        url,
        timeout=timeout,
        headers={"User-Agent": USER_AGENT},
    )
    response.raise_for_status()
    if len(response.content) > MAX_BYTES:
        raise ValueError(f"Response too large: {len(response.content)} bytes")
    return response.content


def fetch_text(url, timeout=30):
    return decode_html(fetch(url, timeout=timeout))


def fetch_act_sections(act_url, section_limit=None, pause=0.4):
    """Fetch an Act index and every linked section page."""
    index_html = fetch_text(act_url)
    parsed = parse_act_page(index_html, act_url)
    sections = []
    for ref in parsed["sections"][:section_limit]:
        section_html = fetch_text(ref["url"])
        section = parse_section_page(section_html, ref["url"])
        section["number"] = section["number"] or ref["number"]
        section["title"] = section["title"] or ref["title"]
        sections.append(section)
        time.sleep(pause)
    return {"title": parsed["title"], "sections": sections}
