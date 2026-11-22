"""Backfill section_number/section_title from the legacy section_label."""

from django.core.management.base import BaseCommand

from legal_rag.models import LegalChunk
from legal_rag.sections import split_label


class Command(BaseCommand):
    help = "Parse existing section_label values into section_number/title."

    def add_arguments(self, parser):
        parser.add_argument("--batch-size", type=int, default=500)
        parser.add_argument("--dry-run", action="store_true")

    def handle(self, *args, **options):
        batch_size = max(1, options["batch_size"])
        total = updated = 0
        last_id = 0
        while True:
            rows = list(
                LegalChunk.objects.filter(section_number="", id__gt=last_id)
                .only("id", "section_label")
                .order_by("id")[:batch_size]
            )
            if not rows:
                break
            last_id = rows[-1].id
            total += len(rows)
            if options["dry_run"]:
                continue
            for row in rows:
                number, title = split_label(row.section_label)
                LegalChunk.objects.filter(pk=row.pk).update(
                    section_number=number[:32],
                    section_title=title[:255],
                )
                updated += 1
        self.stdout.write(
            self.style.SUCCESS(f"scanned={total} updated={updated}")
        )
