"""Build ActCatalog from the official Bangladesh Code chronological index."""

from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

from legal_rag.catalog import normalize_title, parse_index, reconcile
from legal_rag.models import ActCatalog, LegalDocument
from legal_rag.sources import fetch_text

DEFAULT_INDEX = (
    "http://bdcode.gov.bd/bangladesh-code-chronological-index.html"
)


class Command(BaseCommand):
    help = "Parse the official Act index into ActCatalog; reconcile local documents."

    def add_arguments(self, parser):
        parser.add_argument("--index-url", default=DEFAULT_INDEX)
        parser.add_argument("--dry-run", action="store_true")
        parser.add_argument("--limit", type=int)

    def handle(self, *args, **options):
        index_url = options["index_url"]
        html = fetch_text(index_url)
        refs = parse_index(html, index_url)
        if options["limit"]:
            refs = refs[: options["limit"]]
        if not refs:
            raise CommandError("No Act rows parsed; the index layout changed.")

        local_titles = list(LegalDocument.objects.values_list("title", flat=True))
        matched, missing, extra = reconcile(refs, local_titles)
        self.stdout.write(
            f"catalog={len(refs)} matched={len(matched)} "
            f"missing={len(missing)} extra_local={len(extra)}"
        )
        for ref in refs[:5]:
            self.stdout.write(
                f"  {ref.year or '-'} | {ref.act_no or '-'} | {ref.title[:90]}"
            )
        if options["dry_run"]:
            self.stdout.write("dry-run: nothing written")
            return

        local = {
            normalize_title(title): doc
            for doc in LegalDocument.objects.all()
            for title in [doc.title]
        }
        now = timezone.now()
        for ref in refs:
            ActCatalog.objects.update_or_create(
                pdf_url=ref.pdf_url,
                defaults={
                    "title": ref.title,
                    "act_no": ref.act_no,
                    "year": ref.year,
                    "language": ref.language,
                    "status": ref.status,
                    "document": local.get(normalize_title(ref.title)),
                    "last_seen_at": now,
                },
            )
        self.stdout.write(
            self.style.SUCCESS(f"ActCatalog rows: {ActCatalog.objects.count()}")
        )
