"""Import the corrected vector DB export into the app's legal schema.

The importer is deliberately strict: it never invents a page, section, or
vector. If a field is missing or the vector space does not match the
configured provider, it stops before writing.
"""

from __future__ import annotations

import base64
import json
import math
import struct
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from legal_rag.models import LegalChunk, LegalDocument

REQUIRED = (
    "source_path",
    "document_title",
    "source_type",
    "language",
    "section_number",
    "section_label",
    "page_start",
    "page_end",
    "text",
    "embedding",
    "checksum",
)
SOURCE_TYPES = {
    "act", "case_law", "sro", "lexifina", "gazette", "constitution",
    "treaty",
}
BATCH = 500


def _norm(vector):
    return math.sqrt(sum(float(value) ** 2 for value in vector))


def _vector(value, dim):
    if isinstance(value, str):
        raw = base64.b64decode(value)
        if len(raw) != dim * 4:
            raise CommandError(
                f"base64 embedding has {len(raw)} bytes, expected {dim * 4}"
            )
        return list(struct.unpack(f"<{dim}f", raw))
    return value


def _validate(row, line, expected_dim, provider):
    missing = [key for key in REQUIRED if key not in row]
    if missing:
        raise CommandError(f"line {line}: missing {missing}")
    for field in (
        "text", "document_title", "section_label", "section_title",
        "source_path",
    ):
        value = row.get(field)
        if isinstance(value, str):
            row[field] = value.replace("\x00", "")
    if not str(row["text"] or "").strip():
        raise CommandError(f"line {line}: empty text")
    if not str(row["document_title"] or "").strip():
        raise CommandError(f"line {line}: empty document_title")
    if row["source_type"] not in SOURCE_TYPES:
        raise CommandError(
            f"line {line}: unknown source_type {row['source_type']!r}"
        )
    for field in ("page_start", "page_end"):
        value = row[field]
        if value is not None and not isinstance(value, int):
            raise CommandError(f"line {line}: {field} must be int or null")
    vector = _vector(row["embedding"], expected_dim)
    if not isinstance(vector, list) or len(vector) != expected_dim:
        raise CommandError(
            f"line {line}: expected {expected_dim} dimensions"
        )
    row["embedding"] = vector
    norm = _norm(vector)
    if provider == "gemini" and norm > 0.95:
        raise CommandError(
            f"line {line}: vectors look like qwen (norm {norm:.3f}), "
            "not gemini"
        )
    if provider != "gemini" and norm < 0.95:
        raise CommandError(
            f"line {line}: vectors look like gemini (norm {norm:.3f}), "
            f"not {provider}"
        )


class Command(BaseCommand):
    help = "Import chunks.jsonl from the corrected vector DB export."

    def add_arguments(self, parser):
        parser.add_argument("--source", default=None)
        parser.add_argument("--dry-run", action="store_true")
        parser.add_argument("--replace", action="store_true")
        parser.add_argument("--limit", type=int, default=0)

    def handle(self, *args, **options):
        source = Path(options["source"] or settings.VECTOR_DB_DATA_DIR)
        chunks_path = source / "chunks.jsonl"
        if not chunks_path.exists():
            raise CommandError(f"missing {chunks_path}")
        if (
            not options["dry_run"]
            and not options["replace"]
            and LegalChunk.objects.exists()
        ):
            raise CommandError(
                "legal chunks already exist; pass --replace to swap them"
            )

        expected_dim = settings.LEGAL_RAG_EMBEDDING_DIM
        provider = settings.LEGAL_RAG_EMBEDDING_PROVIDER
        limit = options["limit"]
        total = 0

        with chunks_path.open(encoding="utf-8") as handle:
            rows = []
            for line, raw in enumerate(handle, start=1):
                if limit and total >= limit:
                    break
                row = json.loads(raw)
                _validate(row, line, expected_dim, provider)
                rows.append(row)
                total += 1

                if options["dry_run"]:
                    continue
                if len(rows) >= BATCH:
                    self._write(rows, replace=options["replace"] and total == len(rows))
                    rows = []

            if not options["dry_run"] and rows:
                self._write(
                    rows, replace=options["replace"] and total == len(rows)
                )

        self.stdout.write(
            f"{'validated' if options['dry_run'] else 'imported'} {total} chunks"
        )

    def _write(self, rows, replace=False):
        with transaction.atomic():
            if replace:
                LegalChunk.objects.all().delete()
                LegalDocument.objects.all().delete()

            checksums = {row["checksum"] for row in rows}
            LegalDocument.objects.bulk_create(
                [
                    LegalDocument(
                        title=row["document_title"][:512],
                        source_file=row["source_path"][:1024],
                        language=row["language"],
                        checksum=row["checksum"][:64],
                    )
                    for row in rows
                ],
                ignore_conflicts=True,
            )
            documents = {
                document.checksum: document
                for document in LegalDocument.objects.filter(
                    checksum__in=checksums
                )
            }

            chunks = []
            for row in rows:
                document = documents.get(row["checksum"])
                if document is None:
                    raise CommandError(
                        f"document missing after insert: {row['checksum']}"
                    )
                chunks.append(
                    LegalChunk(
                        document=document,
                        section_label=str(row["section_label"] or "")[:255],
                        section_number=str(row["section_number"] or "")[:32],
                        section_title=str(row.get("section_title") or "")[:255],
                        source_url=str(row.get("source_url") or "")[:2048],
                        source_type=row["source_type"],
                        language=row["language"],
                        page_start=row["page_start"],
                        page_end=row["page_end"],
                        text=row["text"],
                        embedding=row["embedding"],
                    )
                )
            LegalChunk.objects.bulk_create(chunks)
