"""Fix language metadata from the title script (Bangla vs English)."""

from django.core.management.base import BaseCommand

from legal_rag.models import LegalDocument
from legal_rag.sections import detect_language


class Command(BaseCommand):
    help = "Set LegalDocument.language from the title script."

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true")

    def handle(self, *args, **options):
        changed = 0
        for document in LegalDocument.objects.only("id", "title", "language"):
            language = detect_language(document.title)
            if language == document.language:
                continue
            changed += 1
            if not options["dry_run"]:
                LegalDocument.objects.filter(pk=document.pk).update(language=language)
        self.stdout.write(
            self.style.SUCCESS(f"changed={changed}")
        )
