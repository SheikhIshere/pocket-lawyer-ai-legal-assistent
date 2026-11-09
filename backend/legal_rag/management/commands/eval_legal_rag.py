"""Measure retrieval against a gold question set; no LLM answer call."""

import json
from pathlib import Path

from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Evaluate legal RAG retrieval against a gold question set."

    def add_arguments(self, parser):
        parser.add_argument(
            "--questions",
            default="legal_rag/eval/lay_questions.json",
        )

    def handle(self, *args, **options):
        from chat_bot.models import retrieve_rag_sources

        cases = json.loads(Path(options["questions"]).read_text())
        hits = 0
        reciprocal = 0.0
        wrong_law = 0
        rows = []

        for case in cases:
            sources = retrieve_rag_sources(case["question"])
            expected = [term.lower() for term in case["expected_terms"]]
            rank = next(
                (
                    index
                    for index, source in enumerate(sources, start=1)
                    if any(
                        term
                        in (
                            f"{source.get('document_title', '')} "
                            f"{source.get('section_label', '')}"
                        ).lower()
                        for term in expected
                    )
                ),
                None,
            )
            top_title = sources[0].get("document_title", "") if sources else ""
            hits += 1 if rank else 0
            reciprocal += 1.0 / rank if rank else 0.0
            wrong_law += (
                1
                if rank
                and top_title
                and not any(term in top_title.lower() for term in expected)
                else 0
            )
            rows.append((case["question"], rank, top_title or "-"))

        total = len(cases)
        self.stdout.write(f"cases: {total}")
        self.stdout.write(f"recall@20: {hits / total:.0%}")
        self.stdout.write(f"MRR: {reciprocal / total:.3f}")
        self.stdout.write(f"wrong-law@1: {wrong_law / max(1, hits):.0%}")
        for question, rank, title in rows:
            self.stdout.write(f"- {rank or 'MISS'} | {question} | {title}")
