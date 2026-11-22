"""Relink the official ActCatalog and retitle imported 'Act YYYY/N' documents.

Run after every corpus import:
    python manage.py relink_act_catalog [--dry-run]
"""
import re

from django.core.management.base import BaseCommand
from django.db import transaction

from legal_rag.models import ActCatalog, LegalDocument

CATALOG_TITLE = re.compile(r"^Act\s+(\d{4})/(\d+)$", re.IGNORECASE)
ROMAN = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}


def roman_to_int(value):
    total, prev = 0, 0
    for char in reversed((value or "").upper()):
        digit = ROMAN.get(char)
        if digit is None:
            return None
        total += -digit if digit < prev else digit
        prev = max(prev, digit)
    return total or None


def int_to_roman(number):
    table = (
        (1000, "M"), (900, "CM"), (500, "D"), (400, "CD"), (100, "C"),
        (90, "XC"), (50, "L"), (40, "XL"), (10, "X"), (9, "IX"),
        (5, "V"), (4, "IV"), (1, "I"),
    )
    out = ""
    for value, symbol in table:
        while number >= value:
            out += symbol
            number -= value
    return out


class Command(BaseCommand):
    help = "Relink ActCatalog rows and retitle 'Act YYYY/N' documents."

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true")

    @transaction.atomic
    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        catalog = {}
        for row in ActCatalog.objects.all():
            number = roman_to_int(row.act_no)
            if number:
                catalog.setdefault((row.year, int_to_roman(number)), row)

        renamed = 0
        linked = 0
        for document in LegalDocument.objects.all():
            match = CATALOG_TITLE.match((document.title or "").strip())
            if not match:
                continue
            entry = catalog.get(
                (match.group(1), int_to_roman(int(match.group(2))))
            )
            if not entry:
                continue
            if entry.document_id != document.id:
                linked += 1
                if not dry_run:
                    entry.document = document
                    entry.save(update_fields=["document"])
            if entry.title != document.title:
                renamed += 1
                if not dry_run:
                    document.title = entry.title
                    document.save(update_fields=["title"])

        prefix = "DRY RUN: " if dry_run else ""
        self.stdout.write(self.style.SUCCESS(
            f"{prefix}linked {linked} catalog row(s), "
            f"renamed {renamed} document(s)"
        ))
