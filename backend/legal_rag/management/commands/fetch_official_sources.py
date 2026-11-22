"""Fetch official Act sections and store them with source metadata."""

import hashlib
import io

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone
from pypdf import PdfReader

from legal_rag.management.commands.ingest_legal_pdfs import build_chunks, clean_page_text
from legal_rag.models import ActCatalog, LegalChunk, LegalDocument
from legal_rag.sections import detect_language, split_label
from legal_rag.services import EMBEDDING_BATCH_SIZE, embed_texts
from legal_rag.sources import fetch, fetch_act_sections


class Command(BaseCommand):
    help = "Fetch official bdlaws Act pages and replace/store their sections."

    def add_arguments(self, parser):
        parser.add_argument("--act-url", action="append")
        parser.add_argument("--catalog", action="store_true")
        parser.add_argument("--catalog-limit", type=int)
        parser.add_argument("--limit", type=int)
        parser.add_argument("--dry-run", action="store_true")
        parser.add_argument("--replace-title", action="store_true")

    def handle(self, *args, **options):
        if options["catalog"]:
            return self._handle_catalog(options)
        if not options["act_url"]:
            raise CommandError("Pass --act-url or --catalog.")

        for act_url in options["act_url"]:
            try:
                parsed = fetch_act_sections(act_url, section_limit=options["limit"])
            except Exception as exc:
                self.stderr.write(f"FAILED {act_url}: {exc}")
                continue
            title = parsed["title"] or act_url.rsplit("/", 1)[-1]
            sections = parsed["sections"]
            if not sections:
                self.stderr.write(f"No sections parsed from {act_url}")
                continue
            self.stdout.write(f"\n{title}: {len(sections)} sections from {act_url}")
            for section in sections[:5]:
                self.stdout.write(
                    f"  {section['number'] or '-'} | "
                    f"{section['title'][:80]} | {section['url']}"
                )
            if options["dry_run"]:
                continue
            try:
                created = self._store(title, act_url, sections, options["replace_title"])
            except Exception as exc:
                raise CommandError(f"Store failed for {title}: {exc}") from exc
            self.stdout.write(self.style.SUCCESS(f"stored {created} chunks"))

    def _handle_catalog(self, options):
        missing = ActCatalog.objects.filter(document__isnull=True)
        mismatch = missing.exclude(status="active").count()
        refs = list(missing.filter(status="active").order_by("year", "title"))
        if options["catalog_limit"]:
            refs = refs[: options["catalog_limit"]]
        self.stdout.write(
            f"missing catalog docs: {missing.count()} "
            f"(active={len(refs)}, skipped_link_mismatch={mismatch})"
        )
        for ref in refs:
            self.stdout.write(f"  {ref.year or '-'} | {ref.title[:90]} | {ref.pdf_url}")
            if options["dry_run"]:
                continue
            try:
                data = fetch(ref.pdf_url)
                reader = PdfReader(io.BytesIO(data))
                pages = [
                    clean_page_text(page.extract_text() or "")
                    for page in reader.pages
                ]
                chunks = build_chunks(pages)
                sections = []
                for chunk in chunks:
                    number, section_title = split_label(chunk["section_label"])
                    sections.append(
                        {
                            "number": number,
                            "title": section_title,
                            "text": chunk["text"],
                            "url": ref.pdf_url,
                            "page_start": chunk["page_start"],
                            "page_end": chunk["page_end"],
                        }
                    )
                if not sections:
                    self.stderr.write(f"  no sections: {ref.title}")
                    continue
                self._store(
                    ref.title,
                    ref.pdf_url,
                    sections,
                    replace_title=False,
                    source_type="official_pdf",
                )
                document = LegalDocument.objects.filter(source_url=ref.pdf_url).first()
                if document:
                    ref.document = document
                    ref.save(update_fields=["document"])
                self.stdout.write(
                    self.style.SUCCESS(f"  stored {len(sections)} chunks")
                )
            except Exception as exc:
                self.stderr.write(f"  FAILED {ref.title}: {exc}")

    def _store(self, title, act_url, sections, replace_title, source_type="official_html"):
        title = title.strip()[:512]
        language = detect_language(" ".join(section["text"] for section in sections))
        joined = "\n".join(section["text"] for section in sections)
        checksum = hashlib.sha256(f"{act_url}\n{joined}".encode("utf-8")).hexdigest()
        now = timezone.now()

        existing = LegalDocument.objects.filter(title__iexact=title).first()
        if existing and not replace_title and existing.source_url != act_url:
            self.stdout.write(
                f"skip {title}: local document exists, pass --replace-title to replace"
            )
            return 0

        with transaction.atomic():
            if existing:
                document = existing
                document.title = title
                document.source_file = act_url[:1024]
                document.source_url = act_url
                document.language = language
                document.checksum = checksum
                document.authority = "official"
                document.fetched_at = now
                document.save(
                    update_fields=[
                        "title", "source_file", "source_url", "language",
                        "checksum", "authority", "fetched_at",
                    ]
                )
                document.chunks.all().delete()
            else:
                document = LegalDocument.objects.create(
                    title=title,
                    source_file=act_url[:1024],
                    source_url=act_url,
                    language=language,
                    checksum=checksum,
                    authority="official",
                    fetched_at=now,
                )

            for start in range(0, len(sections), EMBEDDING_BATCH_SIZE):
                batch = sections[start:start + EMBEDDING_BATCH_SIZE]
                vectors = embed_texts([section["text"] for section in batch])
                if len(vectors) != len(batch):
                    raise RuntimeError(
                        f"embedding count mismatch: {len(vectors)} != {len(batch)}"
                    )
                LegalChunk.objects.bulk_create(
                    [
                        LegalChunk(
                            document=document,
                            section_label=(
                                f"Section {section['number']} — {section['title']}"
                                if section["number"]
                                else section["title"]
                            )[:255],
                            section_number=section["number"],
                            section_title=section["title"][:255],
                            source_url=section.get("url") or act_url,
                            page_start=section.get("page_start"),
                            page_end=section.get("page_end"),
                            source_type=source_type,
                            language=detect_language(section["text"]),
                            fetched_at=now,
                            text=section["text"],
                            embedding=vector,
                        )
                        for section, vector in zip(batch, vectors)
                    ]
                )
        return len(sections)
