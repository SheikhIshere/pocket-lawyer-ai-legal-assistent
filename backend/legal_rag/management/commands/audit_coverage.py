"""Print role coverage for saved issue maps."""

from django.core.management.base import BaseCommand

from legal_rag.models import LegalIssue
from legal_rag.roles import ELEMENT_ROLES


class Command(BaseCommand):
    help = "Print role coverage for every cached issue map."

    def add_arguments(self, parser):
        parser.add_argument("--issue")

    def handle(self, *args, **options):
        issues = LegalIssue.objects.all().order_by("title")
        if options["issue"]:
            issues = issues.filter(slug=options["issue"])
        if not issues:
            self.stdout.write("No issue maps saved.")
            return
        for issue in issues:
            rows = {row.role: row for row in issue.elements.all()}
            found = sum(
                1 for role in ELEMENT_ROLES
                if getattr(rows.get(role), "status", "") == "found"
            )
            self.stdout.write(
                f"\n{issue.slug} | {issue.title} | {issue.act_title or '-'} "
                f"| {found}/{len(ELEMENT_ROLES)} roles"
            )
            for role in ELEMENT_ROLES:
                row = rows.get(role)
                status = getattr(row, "status", "missing")
                section = getattr(row, "chunk", None)
                number = getattr(section, "section_number", "") if section else ""
                self.stdout.write(f"  {role}: {status} s.{number or '-'}")
