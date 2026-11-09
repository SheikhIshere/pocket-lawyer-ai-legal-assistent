"""Tests for the legal RAG services; no network or vector database required."""

from types import SimpleNamespace
from unittest.mock import patch

from django.test import SimpleTestCase

from legal_rag import services
from legal_rag.planner import plan_question
from legal_rag.management.commands.ingest_legal_pdfs import (
    apply_label_style,
    build_chunks,
    clean_page_text,
    drop_leading_toc,
    normalize_label,
    normalize_text,
)


class ChunkingTests(SimpleTestCase):
    def test_clean_page_text_removes_repeated_print_headers(self):
        raw = (
            "bdlaws.minlaw.gov.bd/act-print-86.html 1/71\n"
            "11/02/2024 The Code of Civil Procedure, 1908\n"
            "Section 1. Short title."
        )
        cleaned = clean_page_text(raw)
        self.assertNotIn("bdlaws", cleaned)
        self.assertNotIn("11/02/2024", cleaned)
        self.assertIn("Section 1. Short title.", cleaned)

    def test_normalize_text_removes_nul_characters(self):
        self.assertEqual(normalize_text("a\x00b"), "ab")

    def test_normalize_label_makes_section_citation(self):
        self.assertEqual(
            normalize_label("18. Admission –"),
            "Section 18 — Admission –",
        )

    def test_bangla_section_heading_becomes_citation(self):
        self.assertEqual(
            normalize_label("২। বিষয় বা প্রসঙ্গের পরিপন্থি"),
            "Section 2 — বিষয় বা প্রসঙ্গের পরিপন্থি",
        )

    def test_dense_bangla_print_page_splits_into_sections(self):
        raw = (
            "প্রিন্ট 01/11/2026 সাইবার সুরক্ষা আইন, ২০২৬ "
            "১। (১) এই আইন সাইবার সুরক্ষা আইন, ২০২৬ নামে অভিহিত হইবে। "
            "(২) ইহা অবিলম্বে কার্যকর হইবে এবং সমগ্র বাংলাদেশে প্রযোজ্য হইবে। "
            "২। (১) বিষয় বা প্রসঙ্গের পরিপন্থি কোনো কিছু না থাকিলে, "
            "এই আইনে— (ক) “সাইবার স্পেস” অর্থ ইন্টারনেট।"
        )
        chunks = build_chunks(drop_leading_toc([clean_page_text(raw)]))
        labels = [chunk["section_label"] for chunk in chunks]
        self.assertIn("Section 1", labels)
        self.assertIn("Section 2", labels)

    def test_drop_leading_toc_blanks_pages_before_body(self):
        pages = [
            "CONTENTS\n1. Short title",
            "11. When facts are relevant",
            "ACT NO. I OF 1872\nSection 1. Short title",
        ]
        result = drop_leading_toc(pages)
        self.assertEqual(result[:2], ["", ""])
        self.assertIn("ACT NO. I OF 1872", result[2])

    def test_unlabelled_page_gets_page_label(self):
        chunks = build_chunks(["This is a long paragraph. " * 20])
        self.assertTrue(chunks)
        self.assertEqual(chunks[0]["section_label"], "Page 1")

    def test_constitution_uses_article_labels(self):
        chunks = [{"section_label": "Section 27"}, {"section_label": "Preamble"}]
        apply_label_style(
            chunks,
            "The Constitution of the People’s Republic of Bangladesh",
        )
        self.assertEqual(chunks[0]["section_label"], "Article 27")
        self.assertEqual(chunks[1]["section_label"], "Preamble")

        other = [{"section_label": "Section 27"}]
        apply_label_style(other, "The Penal Code, 1860")
        self.assertEqual(other[0]["section_label"], "Section 27")


class PlannerTests(SimpleTestCase):
    def test_planner_returns_queries_and_keeps_original(self):
        def complete(prompt, **kwargs):
            return (
                '{"intent":"legal_question","answer_first":true,'
                '"search_queries":["Arms Act 1878 licence possession"],'
                '"slots_missing":[],"clarifying_question":null}'
            )

        plan = plan_question("How do I own a gun?", "", complete)
        self.assertEqual(plan["intent"], "legal_question")
        self.assertEqual(plan["search_queries"][0], "How do I own a gun?")
        self.assertIn(
            "Arms Act 1878 licence possession", plan["search_queries"]
        )

    def test_planner_fails_open_on_garbage(self):
        plan = plan_question("What is bail?", "", lambda *a, **k: "not json")
        self.assertEqual(plan["intent"], "legal_question")
        self.assertEqual(plan["search_queries"], ["What is bail?"])

    def test_planner_keeps_one_clarifying_question(self):
        def complete(prompt, **kwargs):
            return (
                '{"intent":"vague_legal","answer_first":true,'
                '"search_queries":["Bangladesh tenancy law"],'
                '"slots_missing":["agreement type"],'
                '"clarifying_question":"Was there a written rental agreement?"}'
            )

        plan = plan_question("My landlord kept my deposit.", "", complete)
        self.assertEqual(plan["intent"], "vague_legal")
        self.assertEqual(
            plan["clarifying_question"],
            "Was there a written rental agreement?",
        )


class MultiQueryTests(SimpleTestCase):
    def test_rrf_keeps_one_copy_per_chunk(self):
        fused = services.rrf_fuse(
            [
                (2.0, [{"id": 1}, {"id": 2}]),
                (1.0, [{"id": 2}, {"id": 3}]),
            ],
            limit=10,
        )
        self.assertEqual([chunk["id"] for chunk in fused], [2, 1, 3])

    def test_multi_query_runs_every_query(self):
        calls = []

        def fake_vector(query, **kwargs):
            calls.append(("vector", query))
            return [{"id": len(calls), "document_title": "Arms Act"}]

        def fake_keyword(query, **kwargs):
            calls.append(("keyword", query))
            return []

        with patch.object(
            services, "retrieve_legal_chunks", side_effect=fake_vector
        ), patch.object(
            services,
            "retrieve_legal_chunks_keyword",
            side_effect=fake_keyword,
        ):
            result = services.retrieve_multi_query(["q1", "q2"], limit=5)

        self.assertEqual(
            calls,
            [
                ("vector", "q1"),
                ("vector", "q2"),
                ("keyword", "q2"),
            ],
        )
        self.assertEqual(len(result), 2)


class GroundingTests(SimpleTestCase):
    def test_grounding_uses_the_planners_terms(self):
        chunk = {
            "text": (
                "No person shall have in his possession any firearms except "
                "under a license."
            ),
            "section_label": "Section 14",
            "document_title": "The Arms Act, 1878",
        }
        terms = ["Arms Act 1878 firearm licence"]
        self.assertGreaterEqual(
            services.grounding_score("How do I own a gun?", chunk, terms),
            0.5,
        )
        self.assertTrue(
            services.chunk_grounded("How do I own a gun?", chunk, terms)
        )

    def test_grounding_rejects_a_different_sense(self):
        chunk = {
            "text": "security deposit",
            "section_label": "Section 4",
            "document_title": "Wills and Intestacy Regulation",
        }
        terms = ["landlord tenancy deposit"]
        self.assertFalse(
            services.chunk_grounded(
                "My landlord will not return my deposit.", chunk, terms
            )
        )


class BuildContextTests(SimpleTestCase):
    def test_build_context_numbers_blocks(self):
        chunks = [
            {
                "id": 1,
                "text": "The Constitution is the supreme law.",
                "section_label": "Article 7",
                "page_start": 2,
                "page_end": 2,
                "source_url": "",
                "document_title": "Constitution of Bangladesh",
                "score": 0.91,
            },
            {
                "id": 2,
                "text": "Bail may be granted by the court.",
                "section_label": "Section 497",
                "page_start": 10,
                "page_end": 11,
                "source_url": "",
                "document_title": "Code of Criminal Procedure",
                "score": 0.82,
            },
        ]

        context = services.build_context(chunks)

        self.assertIn(
            "[S1] Constitution of Bangladesh — Article 7 — pages 2-2", context
        )
        self.assertIn(
            "[S2] Code of Criminal Procedure — Section 497 — pages 10-11", context
        )
        self.assertIn("The Constitution is the supreme law.", context)
        self.assertIn("Bail may be granted by the court.", context)
        self.assertLess(context.index("[S1]"), context.index("[S2]"))

    def test_build_context_stops_at_the_character_budget(self):
        chunks = [
            {
                "id": index,
                "text": "x" * 200,
                "section_label": f"Section {index}",
                "document_title": "Penal Code",
            }
            for index in range(1, 6)
        ]
        with self.settings(LEGAL_RAG_MAX_CONTEXT_CHARS=600):
            context = services.build_context(chunks)
        self.assertIn("[S1]", context)
        self.assertNotIn("[S5]", context)


class RefusalMessageTests(SimpleTestCase):
    def test_refusal_message_is_exact(self):
        self.assertEqual(
            services.refusal_message(),
            "I could not find this in the provided legal sources. "
            "Please try to connect with a real lawyer licensed in Bangladesh. "
            "If you can tell me the Act or section, I can look it up.",
        )


class RetrieveLegalChunksTests(SimpleTestCase):
    def test_blank_question_returns_empty_list(self):
        self.assertEqual(services.retrieve_legal_chunks("   "), [])

    def test_no_matching_rows_returns_empty_list(self):
        with (
            patch.object(services, "embed_texts", return_value=[[0.1, 0.2]]),
            patch.object(services, "LegalChunk") as legal_chunk,
        ):
            query = (
                legal_chunk.objects.select_related.return_value.annotate.return_value
                .order_by.return_value
            )
            query.__getitem__.return_value = []
            self.assertEqual(services.retrieve_legal_chunks("what is bail?"), [])

    def test_score_is_one_minus_distance_and_filtered(self):
        def row(pk, distance):
            return SimpleNamespace(
                id=pk,
                text="legal text",
                section_label="Section 1",
                page_start=1,
                page_end=2,
                distance=distance,
                document=SimpleNamespace(title="Penal Code", source_url=""),
            )

        rows = [row(1, 0.9), row(2, 0.2)]

        with (
            patch.object(services, "embed_texts", return_value=[[0.1, 0.2]]),
            patch.object(services, "LegalChunk") as legal_chunk,
        ):
            query = (
                legal_chunk.objects.select_related.return_value.annotate.return_value
                .order_by.return_value
            )
            query.__getitem__.return_value = rows
            chunks = services.retrieve_legal_chunks("bail", k=2, min_score=0.5)

        self.assertEqual(len(chunks), 1)
        self.assertEqual(chunks[0]["id"], 2)
        self.assertAlmostEqual(chunks[0]["score"], 0.8)


class RetrievalDefaultsTests(SimpleTestCase):
    def test_defaults_are_not_a_refusal_gate(self):
        from django.conf import settings

        self.assertGreaterEqual(settings.LEGAL_RAG_TOP_K, 20)
        self.assertGreaterEqual(
            settings.LEGAL_RAG_CANDIDATE_K, settings.LEGAL_RAG_TOP_K
        )
        self.assertEqual(settings.LEGAL_RAG_MIN_SCORE, 0.0)
