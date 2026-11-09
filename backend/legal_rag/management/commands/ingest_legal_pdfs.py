"""Ingest the legal PDF/TXT files under BASE/law into pgvector."""

import hashlib
import re
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from legal_rag.models import LegalChunk, LegalDocument
from legal_rag.services import EMBEDDING_BATCH_SIZE, embed_texts

LAW_DIR = Path(settings.BASE_DIR) / "BASE" / "law"

MIN_CHUNK_CHARS = 80
MAX_CHUNK_CHARS = 4000  # ~1000 tokens at four characters per token
OVERLAP_CHARS = 200

# Titles are the citation label shown to users; filenames are not reliable.
TITLE_OVERRIDES = {
    "THE-EVIDENCE-ACT-v-1898.pdf": "The Evidence Act, 1872",
    "the-code-of-civil-procedure-v-1908.pdf": (
        "The Code of Civil Procedure, 1908 (sections; Orders omitted)"
    ),
    "The_Code_of_Criminal_Procedure-Sayed-2.pdf": (
        "The Code of Criminal Procedure, 1898 (partial: ss. 1-205D)"
    ),
    "ThePenalCode1860.txt": "The Penal Code, 1860 (partial: ss. 1-171E)",
    "vol-01-2023-11-30-13-16-59-18.-Penal-code.pdf": "The Penal Code, 1860",
    "vol-01-2023-11-30-13-35-57-19.-Police-Act.pdf": "The Police Act, 1861",
    "vol-08-2023-12-11-15-12-23-233.-PREVENTION-OF-CORRUPTION-ACT-1947.pdf": (
        "The Prevention of Corruption Act, 1947"
    ),
    "vol-29-2024-01-22-13-30-39-200.-Act-No.-5-of-2004.pdf": (
        "The Anti-Corruption Commission Act, 2004"
    ),
    "vol-04-2021-11-23-13-51-15-41_1_The_Code_of_Criminal_Procedure-sayed-1.pdf": (
        "The Code of Criminal Procedure, 1898 (Part 1)"
    ),
    "vol-04-2021-11-23-13-52-22-41_2_The_Code_of_Criminal_Procedure-Sayed-2.pdf": (
        "The Code of Criminal Procedure, 1898 (Part 2)"
    ),
    "vol-04-2021-11-23-13-52-49-41_3_The_Code_of_Criminal_Procedure-Sayed-3.pdf": (
        "The Code of Criminal Procedure, 1898 (Part 3)"
    ),
    "vol-04-2021-11-23-13-53-25-41_4_The_Code_of_Criminal_Procedure-Sayed-4.pdf": (
        "The Code of Criminal Procedure, 1898 (Part 4)"
    ),
}

# These are empty, metadata-only, commentary, or policy documents, not current law.
DEFAULT_EXCLUDES = {
    "TheCodeOfCriminalProcedure_1898.txt",
    "law_urls.txt",
    "Bangladesh_Constitutional_History_and_Six_Points.pdf",
    "juie-charter.txt",
    "law-addition-2025.txt",
    # Incomplete statutes: a missing section must become a lawyer referral,
    # not a plausible answer from model memory.
    "The_Code_of_Criminal_Procedure-Sayed-2.pdf",
    "ThePenalCode1860.txt",
}

HEADING_RE = re.compile(
    r"^(?:"
    r"Section\s+\d+[A-Za-z]?"
    r"|SECTION\s+\d+[A-Za-z]?"
    r"|CHAPTER\s+[IVXLCDM\d]+"
    r"|PART\s+[IVXLCDM\d]+"
    r"|Part\s+[IVXLCDM\d]+"
    r"|ধারা[\s:.\-]*[\d০-৯]+"
    # Scraped statutes (e.g. bdlaws) mark sections as "12. ..." or "1.(1)".
    # Bangla print pages use "১২।" instead of "12." — Python's \d matches
    # the Bangla digits too, so only the separator differs.
    r"|\d{1,4}\.[ \t]*"
    r"|\d{1,4}।[ \t]*"
    r")"
)

# CPC marginal headings look like "Definitions 2. In this Act...".
EMBEDDED_HEADING_RE = re.compile(
    r"^(?P<prefix>[A-Z][A-Za-z ,.'()\-]{0,60}?)\s+"
    r"(?P<num>\d{1,4})\.\s+(?P<rest>\S.*)$"
)


BANGLA_DIGITS = str.maketrans("০১২৩৪৫৬৭৮৯", "0123456789")


def normalize_label(line):
    """Turn ``18. Admission`` into a citation-friendly section label."""
    match = re.match(r"^\s*(\d{1,4})[.।]\s*(.*)", line)
    if match:
        rest = match.group(2).strip()
        label = f"Section {match.group(1).translate(BANGLA_DIGITS)}"
        if rest and not rest.startswith("("):
            label += f" — {rest[:200]}"
        return label[:255]
    return line.strip()[:255]


def clean_page_text(text):
    """Drop repeated print headers/watermarks that pollute every chunk."""
    text = normalize_text(text)
    # bdlaws print pages arrive as one dense line. Put each Bangla section
    # ("১২।") on its own line so headings can be detected and cited.
    text = re.sub(
        r"(?<=\s)([০-৯]{1,3})।\s+(?=[(\u0980-\u09ff])",
        r"\n\1। ",
        text,
    )
    lines = []
    for line in text.split("\n"):
        stripped = line.strip()
        if re.match(
            r"^bdlaws\.minlaw\.gov\.bd/act-print-\d+\.html\s+\d+/\d+$",
            stripped,
        ):
            continue
        if re.match(
            r"^\d{2}/\d{2}/\d{4}\s+The Code of (Civil|Criminal) Procedure",
            stripped,
        ):
            continue
        if re.match(r"^Evidence Act, 1872\s+\d+$", stripped):
            continue
        if stripped.lower().startswith("unofficial translation commissioned"):
            continue
        if stripped.lower().startswith("internet edition"):
            continue
        lines.append(line)
    return normalize_text("\n".join(lines))


def drop_leading_toc(pages):
    """Blank out a leading table of contents so it cannot be indexed twice."""
    if not pages or "CONTENTS" not in (pages[0] or "").upper():
        return pages

    for index, page in enumerate(pages[1:], start=1):
        upper = (page or "").upper()
        if "ACT NO." in upper or "PREAMBLE" in upper:
            return [""] * index + pages[index:]
    return pages


def normalize_text(text):
    """Normalize line endings and whitespace without losing paragraph breaks."""
    text = (text or "").replace("\x00", "").replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _has_content(lines):
    return any(line.strip() for _, line in lines)


def _section_lines(pages):
    """Split pages into sections that start at a detected heading line."""
    sections = []
    current = {"label": "", "lines": []}

    for page_number, page_text in enumerate(pages, start=1):
        for line in normalize_text(page_text).split("\n"):
            stripped = line.strip()
            heading = HEADING_RE.match(stripped) if stripped else None
            embedded = (
                EMBEDDED_HEADING_RE.match(stripped)
                if stripped and not heading
                else None
            )

            if heading or embedded:
                if _has_content(current["lines"]):
                    sections.append(current)

                if heading:
                    label_line = stripped
                    section_line = stripped
                else:
                    label_line = (
                        f"{embedded.group('num')}. {embedded.group('rest')}"
                    )
                    section_line = label_line

                current = {
                    "label": normalize_label(label_line),
                    "lines": [(page_number, section_line)],
                }
            else:
                current["lines"].append((page_number, line))

    if _has_content(current["lines"]):
        sections.append(current)
    return sections


def _page_sections(pages):
    """Fallback when no headings are found: treat each page as a section."""
    sections = []
    for page_number, page_text in enumerate(pages, start=1):
        lines = [(page_number, line) for line in normalize_text(page_text).split("\n")]
        if _has_content(lines):
            sections.append({"label": f"Page {page_number}", "lines": lines})
    return sections


def _paragraphs(lines):
    """Group section lines into (page_number, paragraph) tuples."""
    paragraphs = []
    buffer = []
    page_number = None

    for line_page, line in lines:
        if line.strip():
            if page_number is None:
                page_number = line_page
            buffer.append(line.rstrip())
        elif buffer:
            paragraphs.append((page_number, "\n".join(buffer)))
            buffer = []
            page_number = None

    if buffer:
        paragraphs.append((page_number, "\n".join(buffer)))
    return paragraphs


def _split_long_text(text):
    """Hard-split a paragraph that is larger than one chunk."""
    if len(text) <= MAX_CHUNK_CHARS:
        return [text]

    pieces = []
    start = 0
    while start < len(text):
        end = min(start + MAX_CHUNK_CHARS, len(text))
        if end < len(text):
            cut = text.rfind(" ", start + MAX_CHUNK_CHARS // 2, end)
            if cut > start:
                end = cut
        pieces.append(text[start:end].strip())
        start = end
    return pieces


def _infer_label(text, label):
    if label:
        return label
    match = re.search(r"(?m)^\s*(\d{1,4})\.", text)
    if match:
        return f"Section {match.group(1)}"
    return ""


def _add_chunk(chunks, text, label, page_start, page_end):
    text = text.strip()
    if len(text) < MIN_CHUNK_CHARS:
        return
    chunks.append(
        {
            "text": text,
            "section_label": _infer_label(text, label),
            "page_start": page_start,
            "page_end": page_end,
        }
    )


def _chunk_section(section):
    chunks = []
    current = ""
    page_start = None
    page_end = None

    for page_number, paragraph in _paragraphs(section["lines"]):
        for piece in _split_long_text(paragraph):
            piece = piece.strip()
            if not piece:
                continue

            if current and len(current) + 2 + len(piece) > MAX_CHUNK_CHARS:
                _add_chunk(chunks, current, section["label"], page_start, page_end)
                current = f"{current[-OVERLAP_CHARS:]}\n\n{piece}"
                page_start = page_number
            else:
                current = f"{current}\n\n{piece}" if current else piece
                if page_start is None:
                    page_start = page_number
            page_end = page_number

    if current:
        _add_chunk(chunks, current, section["label"], page_start, page_end)
    return chunks


def build_chunks(pages):
    """Build section chunks from a list of page strings."""
    sections = _section_lines(pages)
    if not any(section["label"] for section in sections):
        sections = _page_sections(pages)
    else:
        for section in sections:
            if not section["label"]:
                section["label"] = "Preamble"

    chunks = []
    for section in sections:
        chunks.extend(_chunk_section(section))
    return chunks


def apply_label_style(chunks, title):
    """The Constitution numbers its provisions as Articles, not Sections."""
    if "constitution of the people" not in (title or "").lower():
        return
    for chunk in chunks:
        chunk["section_label"] = re.sub(
            r"^Section\b", "Article", chunk["section_label"] or ""
        )


class Command(BaseCommand):
    help = "Ingest PDF/TXT legal sources from backend/BASE/law into the RAG tables."

    def add_arguments(self, parser):
        parser.add_argument(
            "--files",
            nargs="+",
            help="Only ingest these filenames (e.g. THE-EVIDENCE-ACT-v-1898.pdf).",
        )
        parser.add_argument(
            "--dir",
            help="Directory to scan instead of BASE/law.",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Extract and chunk without embedding or writing to the database.",
        )
        parser.add_argument(
            "--include-all",
            action="store_true",
            help="Include commentary, policy, and metadata files excluded by default.",
        )
        parser.add_argument(
            "--manifest",
            help="Ingest paths/titles from a JSON manifest instead of scanning a directory.",
        )

    def _within_law_dir(self, path):
        try:
            Path(path).resolve().relative_to(LAW_DIR.resolve())
            return True
        except ValueError:
            return False

    def handle(self, *args, **options):
        if options.get("manifest"):
            self._handle_manifest(
                Path(options["manifest"]).expanduser().resolve(),
                dry_run=options["dry_run"],
            )
            return

        law_dir = (
            Path(options["dir"]).expanduser().resolve()
            if options.get("dir")
            else LAW_DIR
        )
        if not self._within_law_dir(law_dir):
            self.stderr.write(f"Refusing path outside LAW_DIR: {law_dir}")
            return
        if not law_dir.is_dir():
            self.stderr.write(f"Law directory not found: {law_dir}")
            return

        files = sorted(
            path
            for path in law_dir.iterdir()
            if path.is_file() and path.suffix.lower() in {".pdf", ".txt"}
        )
        if options["files"]:
            wanted = set(options["files"])
            files = [path for path in files if path.name in wanted]
        elif not options["include_all"]:
            files = [path for path in files if path.name not in DEFAULT_EXCLUDES]

        scanned = skipped = documents_created = chunks_created = 0
        dry_run = options["dry_run"]

        for path in files:
            scanned += 1
            try:
                pages = self._read_pages(path)
            except Exception as exc:
                skipped += 1
                self.stderr.write(f"Skipped {path.name}: {exc}")
                continue

            full_text = normalize_text("\n\n".join(pages))
            if not full_text:
                skipped += 1
                self.stdout.write(f"Skipped {path.name}: no extractable text")
                continue

            chunks = build_chunks(pages)
            if not chunks:
                skipped += 1
                self.stdout.write(f"Skipped {path.name}: no usable chunks")
                continue

            if dry_run:
                self.stdout.write(
                    f"Would ingest {path.name}: {len(chunks)} chunks "
                    f"({len(full_text)} chars)"
                )
                continue

            checksum = hashlib.sha256(full_text.encode("utf-8")).hexdigest()
            if LegalDocument.objects.filter(checksum=checksum).exists():
                skipped += 1
                self.stdout.write(f"Skipped {path.name}: already ingested")
                continue

            try:
                created = self._store(path, checksum, chunks)
            except Exception as exc:
                skipped += 1
                self.stderr.write(f"Skipped {path.name}: {exc}")
                continue

            documents_created += 1
            chunks_created += created
            self.stdout.write(f"Ingested {path.name}: {created} chunks")

        self.stdout.write(
            self.style.SUCCESS(
                f"Scanned {scanned} files, skipped {skipped}, "
                f"created {documents_created} documents and {chunks_created} chunks."
            )
        )

    def _handle_manifest(self, manifest_path, dry_run=False):
        import json

        records = json.loads(manifest_path.read_text(encoding="utf-8"))
        scanned = skipped = documents_created = chunks_created = 0
        for record in records:
            path = Path(record["path"])
            if not path.is_absolute():
                path = Path(settings.BASE_DIR) / path
            if not self._within_law_dir(path):
                skipped += 1
                self.stderr.write(f"Skipped {path.name}: outside LAW_DIR")
                continue
            scanned += 1
            try:
                pages = self._read_pages(path)
            except Exception as exc:
                skipped += 1
                self.stderr.write(f"Skipped {path.name}: {exc}")
                continue
            full_text = normalize_text("\n\n".join(pages))
            if not full_text:
                skipped += 1
                self.stdout.write(f"Skipped {path.name}: no extractable text")
                continue
            chunks = build_chunks(pages)
            if not chunks:
                skipped += 1
                self.stdout.write(f"Skipped {path.name}: no usable chunks")
                continue
            if dry_run:
                self.stdout.write(
                    f"Would ingest {record.get('title', path.name)}: "
                    f"{len(chunks)} chunks ({len(full_text)} chars)"
                )
                continue
            checksum = hashlib.sha256(full_text.encode("utf-8")).hexdigest()
            if LegalDocument.objects.filter(checksum=checksum).exists():
                skipped += 1
                continue
            try:
                created = self._store(
                    path, checksum, chunks, title=record.get("title")
                )
            except Exception as exc:
                skipped += 1
                self.stderr.write(f"Skipped {path.name}: {exc}")
                continue
            documents_created += 1
            chunks_created += created
            self.stdout.write(f"Ingested {record.get('title', path.name)}: {created} chunks")
        self.stdout.write(
            self.style.SUCCESS(
                f"Manifest: {scanned} records, skipped {skipped}, "
                f"created {documents_created} documents and {chunks_created} chunks."
            )
        )

    def _read_pages(self, path):
        if path.suffix.lower() == ".txt":
            text = path.read_text(encoding="utf-8", errors="replace")
            return drop_leading_toc([clean_page_text(text)])

        try:
            from pypdf import PdfReader
        except ImportError as exc:
            raise RuntimeError(
                "pypdf is not installed; run `pip install pypdf`."
            ) from exc

        reader = PdfReader(str(path))
        pages = []
        for page in reader.pages:
            try:
                pages.append(clean_page_text(page.extract_text() or ""))
            except Exception as exc:
                self.stderr.write(f"  page skipped in {path.name}: {exc}")
                pages.append("")
        return drop_leading_toc(pages)

    def _store(self, path, checksum, chunks, title=None):
        try:
            source_file = str(path.relative_to(settings.BASE_DIR))
        except ValueError:
            source_file = str(path)
        title = (title or TITLE_OVERRIDES.get(
            path.name, path.stem.replace("_", " ")
        ))[:512]
        # The Constitution numbers its provisions as Articles, not Sections.
        apply_label_style(chunks, title)
        document = LegalDocument.objects.create(
            title=title,
            source_file=source_file[:1024],
            checksum=checksum,
        )

        try:
            for start in range(0, len(chunks), EMBEDDING_BATCH_SIZE):
                batch = chunks[start:start + EMBEDDING_BATCH_SIZE]
                vectors = embed_texts([chunk["text"] for chunk in batch])
                if len(vectors) != len(batch):
                    raise RuntimeError(
                        f"embedding count mismatch: expected {len(batch)}, "
                        f"got {len(vectors)}"
                    )
                LegalChunk.objects.bulk_create(
                    [
                        LegalChunk(
                            document=document,
                            section_label=chunk["section_label"],
                            page_start=chunk["page_start"],
                            page_end=chunk["page_end"],
                            text=chunk["text"],
                            embedding=vector,
                        )
                        for chunk, vector in zip(batch, vectors)
                    ]
                )
        except Exception:
            # Do not leave a checksum behind when only part of the document was stored.
            document.delete()
            raise

        return len(chunks)
