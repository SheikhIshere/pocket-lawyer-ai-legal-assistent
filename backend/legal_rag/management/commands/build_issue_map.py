"""Spot issues from facts and build an on-demand map of universal roles."""

from django.core.management.base import BaseCommand, CommandError

from legal_rag.issue_map import build_map, save_map
from legal_rag.issue_spotter import spot
from legal_rag.roles import ELEMENT_ROLES


class Command(BaseCommand):
    help = "Spot legal issues and build their role maps."

    def add_arguments(self, parser):
        parser.add_argument("--question")
        parser.add_argument("--title")
        parser.add_argument("--act", default="")
        parser.add_argument("--section", default="")
        parser.add_argument("--limit", type=int, default=3)
        parser.add_argument("--dry-run", action="store_true")

    def handle(self, *args, **options):
        if options["question"]:
            spotted = spot(options["question"])
            self.stdout.write(
                f"coverage={spotted['coverage']:.2f} "
                f"verdict={spotted['verdict']} "
                f"issues={len(spotted['issues'])}"
            )
            if spotted.get("reason"):
                self.stdout.write(f"reason={spotted['reason']}")
            issues = spotted["issues"]
        elif options["title"]:
            issues = [
                {
                    "title": options["title"],
                    "act_title": options["act"],
                    "section_hint": options["section"],
                    "confidence": 1.0,
                }
            ]
        else:
            raise CommandError("Pass --question or --title.")

        if not issues:
            self.stdout.write("No supported issue found; no map built.")
            return

        for issue in issues[: options["limit"]]:
            self.stdout.write(
                f"\nISSUE: {issue['title']} | {issue.get('act_title') or '-'} "
                f"| s.{issue.get('section_hint') or '-'}"
            )
            elements = build_map(issue)
            found = sum(1 for row in elements.values() if row["status"] == "found")
            self.stdout.write(f"roles found: {found}/{len(ELEMENT_ROLES)}")
            for role in ELEMENT_ROLES:
                row = elements[role]
                self.stdout.write(
                    f"  {role}: {row['status']} "
                    f"s.{row.get('section_number') or '-'} "
                    f"| {row.get('reason') or ''}"
                )
            if not options["dry_run"]:
                saved = save_map(issue, elements)
                self.stdout.write(self.style.SUCCESS(f"saved issue {saved.slug}"))
