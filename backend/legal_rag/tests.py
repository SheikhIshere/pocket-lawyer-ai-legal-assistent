"""Tests for the legal RAG services; no network or vector database required."""

import json
import tempfile
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import SimpleTestCase, TestCase, override_settings

from legal_rag import services
from legal_rag.case_pipeline import run_case_turn
from legal_rag.catalog import normalize_title, parse_index
from legal_rag.coverage import coverage_score, verdict
from legal_rag.issue_map import build_map, quote_in
from legal_rag.issue_spotter import spot
from legal_rag.models import ActCatalog, LegalChunk, LegalDocument
from legal_rag.planner import plan_question
from legal_rag.roles import ELEMENT_ROLES
from legal_rag.sections import (
    detect_language,
    normalize_section_number,
    parse_act_page,
    parse_section_page,
    split_label,
)
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

    def test_planner_parses_risk_and_known_facts(self):
        def complete(prompt, **kwargs):
            return (
                '{"intent":"legal_question","risk":"harmful",'
                '"known_facts":{"age":"17"},"search_queries":["q"],'
                '"slots_missing":[],"clarifying_question":null}'
            )

        plan = plan_question("q", "", complete)
        self.assertEqual(plan["risk"], "harmful")
        self.assertEqual(plan["known_facts"], {"age": "17"})

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


    def test_build_context_prefers_section_number_and_title(self):
        context = services.build_context(
            [
                {
                    "document_title": "The Arms Act, 1878",
                    "section_number": "13",
                    "section_title": "Prohibition of going armed without license",
                    "text": "No person shall go armed.",
                }
            ]
        )
        self.assertIn(
            "[S1] The Arms Act, 1878 — Section 13 — "
            "Prohibition of going armed without license",
            context,
        )


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


class CatalogParserTests(SimpleTestCase):
    INDEX = """
    <table>
      <tr>
        <td><a href="/upload/arms.pdf">The Arms Act, 1878</a></td>
        <td><a href="/upload/arms.pdf">XI</a></td>
        <td><a href="/upload/arms.pdf">1878</a></td>
      </tr>
      <tr>
        <td><a href="/upload/arms.pdf">The Arms Act, 1878</a></td>
        <td><a href="/upload/arms.pdf">XI</a></td>
        <td><a href="/upload/arms.pdf">1878</a></td>
      </tr>
      <tr>
        <td><a href="/upload/penal.pdf">The Penal Code, 1860</a></td>
        <td><a href="/upload/penal.pdf">XLV</a></td>
        <td><a href="/upload/penal.pdf">1860</a></td>
      </tr>
    </table>
    """

    def test_index_deduplicates_rows_by_pdf_url(self):
        refs = parse_index(self.INDEX, "http://bdcode.gov.bd/index.html")
        self.assertEqual(len(refs), 2)
        self.assertEqual(refs[0].title, "The Arms Act, 1878")
        self.assertEqual(refs[0].act_no, "XI")
        self.assertEqual(refs[0].year, "1878")
        self.assertTrue(refs[0].pdf_url.startswith("http://bdcode.gov.bd/"))

    def test_normalize_title_ignores_case_and_leading_the(self):
        self.assertEqual(
            normalize_title("The Arms Act, 1878"),
            normalize_title("arms act 1878"),
        )

    def test_mismatched_pdf_filename_is_flagged(self):
        from legal_rag.catalog import link_status

        self.assertEqual(
            link_status("The Arms Act, 1878", "http://x/The-Arms-Act,-1878.pdf"),
            "active",
        )
        self.assertEqual(
            link_status(
                "The Foreign Recruiting Act, 1874",
                "http://x/The-Survey-Act,-1875.pdf",
            ),
            "link_mismatch",
        )
        self.assertEqual(
            link_status(
                "The Railways Act, 1890",
                "http://x/The-Excise-(Malt-Liquors)-Act,-1890.pdf",
            ),
            "link_mismatch",
        )


class SectionParserTests(SimpleTestCase):
    ACT = """
    <html><head><title>The Arms Act, 1878 | Laws of Bangladesh</title></head>
    <body>
      <a href="/act-38/section-955.html">1. Short title</a>
      <a href="/act-38/section-957.html">2. Commencement</a>
      <a href="/act-38/section-955.html">1. Short title duplicate</a>
    </body></html>
    """

    SECTION = """
    <html><body>
      <div id="page-content">
        <div class="txt-head">Prohibition of going armed without license</div>
        <div class="txt-details">13. No person shall go armed with any arms
        except under a license.</div>
      </div>
    </body></html>
    """

    def test_act_page_returns_unique_sections(self):
        parsed = parse_act_page(self.ACT, "http://bdlaws.minlaw.gov.bd/act-38.html")
        self.assertEqual(parsed["title"], "The Arms Act, 1878")
        self.assertEqual(len(parsed["sections"]), 2)
        self.assertEqual(parsed["sections"][0]["number"], "1")
        self.assertEqual(parsed["sections"][1]["number"], "2")
        self.assertTrue(parsed["sections"][0]["url"].startswith("http://"))

    def test_section_page_returns_number_title_and_text(self):
        section = parse_section_page(
            self.SECTION, "http://bdlaws.minlaw.gov.bd/act-38/section-983.html"
        )
        self.assertEqual(section["number"], "13")
        self.assertEqual(section["title"], "Prohibition of going armed without license")
        self.assertTrue(section["text"].startswith("13. No person"))

    def test_split_label_english_bangla_and_preamble(self):
        self.assertEqual(
            split_label("Section 12 — Appeal"),
            ("12", "Appeal"),
        )
        self.assertEqual(
            split_label("Section ২ — বিষয় বা প্রসঙ্গ"),
            ("2", "বিষয় বা প্রসঙ্গ"),
        )
        self.assertEqual(split_label("Preamble"), ("", "Preamble"))

    def test_normalize_section_number_maps_bangla_digits(self):
        self.assertEqual(normalize_section_number("১২ক"), "12ক")

    def test_detect_language_by_script(self):
        self.assertEqual(detect_language("যৌতুক নিরোধ আইন"), "bn")
        self.assertEqual(detect_language("The Penal Code, 1860"), "en")



class UniversalRoleTests(SimpleTestCase):
    def test_roles_are_domain_agnostic(self):
        self.assertIn("authority", ELEMENT_ROLES)
        self.assertIn("backfire", ELEMENT_ROLES)
        self.assertNotIn("criminal", ELEMENT_ROLES)
        self.assertNotIn("family", ELEMENT_ROLES)


class CoverageTests(SimpleTestCase):
    def test_covered_and_not_covered(self):
        chunk = {"text": "bail application and surety", "section_label": "Section 498"}
        self.assertEqual(coverage_score("bail", [chunk]), 1.0)
        self.assertEqual(verdict(coverage_score("bail", [chunk])), "covered")
        self.assertEqual(verdict(coverage_score("weather", [chunk])), "not_covered")


class IssueSpotterTests(SimpleTestCase):
    CHUNK = {
        "id": 1,
        "text": "bail application and surety",
        "document_title": "The Code of Criminal Procedure, 1898",
        "section_label": "Section 498",
        "section_number": "498",
    }

    def test_spot_returns_json_issues(self):
        def complete(prompt, **kwargs):
            return (
                '{"issues": [{"title": "bail", "act_title": '
                '"The Code of Criminal Procedure, 1898", '
                '"section_hint": "498", "confidence": 0.9}]}'
            )

        with patch(
            "legal_rag.issue_spotter.retrieve_legal_chunks",
            return_value=[self.CHUNK],
        ):
            result = spot("bail", complete=complete)

        self.assertEqual(result["verdict"], "covered")
        self.assertEqual(len(result["issues"]), 1)
        self.assertEqual(result["issues"][0]["title"], "bail")

    def test_spot_refuses_uncovered_without_llm(self):
        unrelated = {**self.CHUNK, "text": "weather and rainfall"}

        def complete(prompt, **kwargs):
            raise AssertionError("LLM must not be called")

        with patch(
            "legal_rag.issue_spotter.retrieve_legal_chunks",
            return_value=[unrelated],
        ):
            result = spot("bail", complete=complete)

        self.assertEqual(result["issues"], [])
        self.assertEqual(result["reason"], "retrieval_not_covered")


class IssueMapTests(SimpleTestCase):
    CHUNK = {
        "id": 1,
        "text": "Whoever commits theft shall be punished with imprisonment.",
        "document_title": "The Penal Code, 1860",
        "section_label": "Section 379 — Punishment for theft",
        "section_number": "379",
        "section_title": "Punishment for theft",
    }

    def _complete(self, prompt, **kwargs):
        if "legal element extractor" in prompt:
            return (
                '{"roles": {"consequence": {"found": true, "quote": '
                '"Whoever commits theft shall be punished with imprisonment.", '
                '"section_number": "379", "confidence": 0.9}}}'
            )
        return '{"roles": {}}'

    def test_build_map_accepts_verified_quote(self):
        with patch(
            "legal_rag.issue_map.retrieve_legal_chunks",
            return_value=[self.CHUNK],
        ):
            result = build_map(
                {"title": "theft", "act_title": "The Penal Code, 1860"},
                complete=self._complete,
            )
        self.assertEqual(result["consequence"]["status"], "found")
        self.assertEqual(result["consequence"]["section_number"], "379")
        self.assertEqual(result["actors"]["status"], "missing")

    def test_build_map_rejects_invented_quote(self):
        def complete(prompt, **kwargs):
            return (
                '{"roles": {"consequence": {"found": true, "quote": '
                '"This sentence is not in the source.", '
                '"section_number": "379", "confidence": 0.9}}}'
            )

        with patch(
            "legal_rag.issue_map.retrieve_legal_chunks",
            return_value=[self.CHUNK],
        ):
            result = build_map(
                {"title": "theft", "act_title": "The Penal Code, 1860"},
                complete=complete,
            )
        self.assertEqual(result["consequence"]["status"], "missing")
        self.assertEqual(result["consequence"]["reason"], "quote_not_found")

    def test_quote_normalizes_whitespace_and_typography(self):
        self.assertTrue(
            quote_in("Whoever commits theft", "Whoever   commits\ntheft shall")
        )
        self.assertTrue(
            quote_in(
                "the person's consent",
                "the person\u2019s consent",
            )
        )

    def test_build_map_rejects_real_but_unrelated_quote(self):
        chunk = {
            "id": 2,
            "text": "Whoever fraudulently makes a claim in a Court of Justice.",
            "document_title": "The Penal Code, 1860",
            "section_label": "Section 209",
            "section_number": "209",
            "section_title": "False claim",
        }

        def complete(prompt, **kwargs):
            return (
                '{"roles": {"consequence": {"found": true, "quote": '
                '"Whoever fraudulently makes a claim in a Court of Justice.", '
                '"section_number": "209", "confidence": 0.9}}}'
            )

        with patch(
            "legal_rag.issue_map.retrieve_legal_chunks",
            return_value=[chunk],
        ):
            result = build_map(
                {"title": "theft", "act_title": "The Penal Code, 1860"},
                complete=complete,
            )
        self.assertEqual(result["consequence"]["status"], "missing")
        self.assertEqual(result["consequence"]["reason"], "not_relevant_to_issue")


class SectionDiversityTests(SimpleTestCase):
    def test_limit_per_section(self):
        chunks = [
            {"document_title": "A", "section_number": "1"},
            {"document_title": "A", "section_number": "1"},
            {"document_title": "A", "section_number": "1"},
            {"document_title": "A", "section_number": "2"},
        ]
        out = services._limit_per_section(chunks, max_per_section=2)
        self.assertEqual(len(out), 3)
        self.assertEqual(out[-1]["section_number"], "2")


class CasePipelineTests(SimpleTestCase):
    CHUNK = {
        "id": 1,
        "text": "Bail may be granted by the court.",
        "document_title": "The Code of Criminal Procedure, 1898",
        "section_label": "Section 498 — Bail",
        "section_number": "498",
        "section_title": "Bail",
    }

    def _retrieve(self, *args, **kwargs):
        return [self.CHUNK]

    def _complete(self, prompt, **kwargs):
        if "issue spotter" in prompt:
            return (
                '{"issues": [{"title": "bail", "act_title": '
                '"The Code of Criminal Procedure, 1898", '
                '"section_hint": "498", "confidence": 0.9}]}'
            )
        if "legal element extractor" in prompt:
            return (
                '{"roles": {"consequence": {"found": true, "quote": '
                '"Bail may be granted by the court.", '
                '"section_number": "498", "confidence": 0.9}}}'
            )
        return "not json"

    def test_ask_when_slot_missing(self):
        called = []

        def retrieve(*args, **kwargs):
            called.append(True)
            return [self.CHUNK]

        result = run_case_turn(
            "q",
            {},
            {
                "intent": "legal_question",
                "slots_missing": ["age"],
                "clarifying_question": "How old are you?",
            },
            retrieve,
            self._complete,
        )
        self.assertEqual(result["action"], "ask")
        self.assertEqual(result["question"], "How old are you?")
        self.assertEqual(result["case_state"]["asked"], 1)
        self.assertEqual(called, [])

    def test_question_cap_answers(self):
        result = run_case_turn(
            "q",
            {"asked": 3},
            {
                "intent": "legal_question",
                "slots_missing": ["age"],
                "clarifying_question": "How old?",
            },
            self._retrieve,
            self._complete,
        )
        self.assertEqual(result["action"], "answer")
        self.assertEqual(result["case_state"]["asked"], 0)

    @override_settings(LEGAL_RAG_CASE_MAP=True)
    def test_complete_question_answers_with_coverage(self):
        with patch(
            "legal_rag.issue_map.retrieve_legal_chunks",
            return_value=[self.CHUNK],
        ), patch(
            "legal_rag.issue_map.get_section_window",
            return_value=[],
        ):
            result = run_case_turn(
                "What is bail?",
                {},
                {"intent": "legal_question", "slots_missing": []},
                self._retrieve,
                self._complete,
            )
        self.assertEqual(result["action"], "answer")
        self.assertEqual(
            result["answer_plan"]["coverage"]["consequence"], "found"
        )
        self.assertEqual(result["case_state"]["issues"][0]["title"], "bail")

    def test_facts_survive(self):
        result = run_case_turn(
            "q",
            {"facts": {"amount": "3 lakh"}},
            {"intent": "legal_question", "known_facts": {"year": "2"}},
            self._retrieve,
            self._complete,
        )
        self.assertEqual(result["case_state"]["facts"]["amount"], "3 lakh")
        self.assertEqual(result["case_state"]["facts"]["year"], "2")

    def test_emergency_defers(self):
        result = run_case_turn(
            "q",
            {},
            {"intent": "legal_question", "risk": "emergency"},
            self._retrieve,
            self._complete,
        )
        self.assertEqual(result["action"], "defer")
        self.assertEqual(result["reason"], "emergency")

    def test_harmful_answers_consequences(self):
        result = run_case_turn(
            "q",
            {},
            {"intent": "legal_question", "risk": "harmful"},
            self._retrieve,
            self._complete,
        )
        self.assertEqual(result["action"], "answer")
        self.assertEqual(result["answer_plan"]["risk"], "harmful")

    def test_no_sources_defers(self):
        result = run_case_turn(
            "q",
            {},
            {"intent": "legal_question"},
            lambda *args, **kwargs: [],
            self._complete,
        )
        self.assertEqual(result["action"], "defer")
        self.assertEqual(result["reason"], "no_sources")

    @override_settings(LEGAL_RAG_CASE_MAP=True)
    def test_steps_stream_to_callback(self):
        emitted = []

        def complete(prompt, **kwargs):
            if "issue spotter" in prompt:
                return json.dumps({"issues": [{
                    "title": "bail",
                    "act_title": "The Code of Criminal Procedure, 1898",
                    "section_hint": "498", "confidence": 0.9,
                }]})
            return json.dumps({"roles": {}})

        with override_settings(LEGAL_RAG_CASE_MAP=True), patch(
            "legal_rag.issue_map.retrieve_legal_chunks",
            return_value=[self.CHUNK],
        ), patch(
            "legal_rag.issue_map.get_section_window", return_value=[],
        ), patch(
            "legal_rag.case_pipeline.get_section_window", return_value=[],
        ):
            run_case_turn(
                "bail", {}, {"intent": "legal_question"},
                self._retrieve, complete, on_step=emitted.append,
            )
        self.assertEqual(emitted[0]["name"], "load")
        self.assertIn("plan", [record["name"] for record in emitted])
        self.assertTrue(all("step" in record for record in emitted))

    @override_settings(LEGAL_RAG_CASE_MAP=True)
    def test_map_is_act_aware_and_drill_feeds_sources(self):
        issue = {"title": "Forgery", "act_title": "The Penal Code, 1860",
                 "section_hint": "464", "confidence": 0.9}

        def complete(prompt, **kwargs):
            if "issue spotter" in prompt:
                return json.dumps({"issues": [issue]})
            return json.dumps({"roles": {}})

        with patch(
            "legal_rag.case_pipeline.build_map",
            return_value={role: {"status": "missing"} for role in ELEMENT_ROLES},
        ) as mapper, patch(
            "legal_rag.case_pipeline.get_section_window",
            return_value=[self.CHUNK],
        ):
            result = run_case_turn(
                "bail court", {}, {"intent": "legal_question"},
                self._retrieve, complete,
            )
        self.assertIsNone(mapper.call_args.kwargs.get("chunks"))
        self.assertEqual(result["sources"][0]["id"], self.CHUNK["id"])


@override_settings(LEGAL_RAG_CASE_MAP=True)
class PipelineGateTests(SimpleTestCase):
    """Diagram steps 9/13/18: the branch gate must decide from real signals."""

    CHUNK = CasePipelineTests.CHUNK

    def _retrieve(self, *args, **kwargs):
        return [self.CHUNK]

    @staticmethod
    def _complete(issues):
        def complete(prompt, **kwargs):
            if "issue spotter" in prompt:
                return json.dumps({"issues": issues})
            if "legal element extractor" in prompt:
                return json.dumps({"roles": {
                    role: {"found": False, "quote": "", "section_number": "",
                           "confidence": 0.0}
                    for role in ELEMENT_ROLES
                }})
            return "not json"
        return complete

    def _run(self, issues, plan=None, state=None, correction=None):
        plan = plan or {"intent": "legal_question", "slots_missing": []}
        return run_case_turn(
            "q", state or {}, plan, self._retrieve, self._complete(issues),
            correction=correction,
        )

    def test_gate_defers_when_no_issues(self):
        result = self._run([])
        self.assertEqual(result["action"], "defer")
        self.assertIn(result["reason"], {"no_issues", "retrieval_not_covered"})

    def test_gate_defers_on_low_confidence(self):
        result = self._run([
            {"title": "police misconduct", "act_title": "The Police Act, 1861",
             "section_hint": "15", "confidence": 0.31},
        ])
        self.assertEqual(result["action"], "defer")
        self.assertEqual(result["reason"], "low_confidence")

    def test_gate_answers_on_confident_issue(self):
        result = self._run([
            {"title": "bail", "act_title": "The Code of Criminal Procedure, 1898",
             "section_hint": "498", "confidence": 0.9},
        ])
        self.assertEqual(result["action"], "answer")

    def test_trace_records_cover_the_pipeline(self):
        with patch(
            "legal_rag.issue_map.retrieve_legal_chunks",
            return_value=[self.CHUNK],
        ), patch(
            "legal_rag.issue_map.get_section_window",
            return_value=[],
        ):
            result = self._run([
                {"title": "bail", "act_title": "The Code of Criminal Procedure, 1898",
                 "section_hint": "498", "confidence": 0.9},
            ])
        trace = result["case_state"]["trace"]
        self.assertTrue(trace)
        self.assertTrue(all(
            {"step", "name", "status", "detail"} <= set(record.keys())
            for record in trace
        ))
        names = [record["name"] for record in trace]
        self.assertIn("gate", names)
        self.assertIn("coverage", names)

    def test_section_window_recorded_when_hint_numeric(self):
        with patch(
            "legal_rag.issue_map.retrieve_legal_chunks",
            return_value=[self.CHUNK],
        ), patch(
            "legal_rag.issue_map.get_section_window",
            return_value=[],
        ), patch(
            "legal_rag.case_pipeline.get_section_window",
            return_value=[self.CHUNK],
        ):
            result = self._run([
                {"title": "bail", "act_title": "The Code of Criminal Procedure, 1898",
                 "section_hint": "498", "confidence": 0.9},
            ])
        self.assertIn(
            "Bail may be granted by the court.",
            result["answer_plan"].get("section_window") or "",
        )

    def test_correction_updates_facts_and_appends(self):
        state = self._run([
            {"title": "bail", "act_title": "The Code of Criminal Procedure, 1898",
             "section_hint": "498", "confidence": 0.9},
        ])["case_state"]
        result = self._run(
            [
                {"title": "bail", "act_title": "The Code of Criminal Procedure, 1898",
                 "section_hint": "498", "confidence": 0.9},
            ],
            state=state,
            correction="bail is anticipatory",
        )
        self.assertEqual(
            result["case_state"]["facts"].get("bail"), "anticipatory"
        )
        self.assertIn(
            "bail: anticipatory", result["case_state"]["corrections"]
        )

    def test_gate_ignores_stale_issues_from_a_previous_turn(self):
        first = self._run([
            {"title": "bail", "act_title": "The Code of Criminal Procedure, 1898",
             "section_hint": "498", "confidence": 0.9},
        ])
        second = self._run([], state=first["case_state"])
        self.assertEqual(second["action"], "defer")
        self.assertEqual(second["case_state"]["issues"], [])
        self.assertNotIn(
            "plan",
            [record["name"] for record in second["case_state"]["trace"]],
        )

    def test_off_topic_risk_defers(self):
        result = self._run(
            [
                {"title": "bail", "act_title": "The Code of Criminal Procedure, 1898",
                 "section_hint": "498", "confidence": 0.9},
            ],
            plan={"intent": "legal_question", "risk": "off_topic",
                  "slots_missing": []},
        )
        self.assertEqual(result["action"], "defer")
        self.assertEqual(result["reason"], "off_topic")


class RelinkActCatalogTests(TestCase):
    def _doc(self, title="Act 1860/45", checksum="c1"):
        return LegalDocument.objects.create(
            title=title, source_file=f"/tmp/{checksum}.pdf", checksum=checksum,
        )

    def _entry(self, title="The Penal Code, 1860"):
        return ActCatalog.objects.create(
            title=title, act_no="XLV", year="1860",
            pdf_url=f"https://example.test/{title.replace(' ', '-')}",
        )

    def test_relink_renames_and_links(self):
        doc = self._doc()
        entry = self._entry()
        call_command("relink_act_catalog")
        doc.refresh_from_db()
        entry.refresh_from_db()
        self.assertEqual(doc.title, "The Penal Code, 1860")
        self.assertEqual(entry.document_id, doc.id)

    def test_dry_run_changes_nothing(self):
        doc = self._doc(title="Act 1872/9", checksum="c2")
        entry = self._entry(title="The Contract Act, 1872")
        entry.act_no = "IX"
        entry.year = "1872"
        entry.pdf_url = "https://example.test/contract"
        entry.save()
        call_command("relink_act_catalog", "--dry-run")
        doc.refresh_from_db()
        entry.refresh_from_db()
        self.assertEqual(doc.title, "Act 1872/9")
        self.assertIsNone(entry.document_id)


@override_settings(LEGAL_RAG_EMBEDDING_PROVIDER="ollama")
class ImportCorpusTests(TestCase):
    def _row(self, **overrides):
        row = {
            "source_path": "clean_data/acts/1860/penal.txt",
            "document_title": "The Penal Code, 1860",
            "source_type": "act",
            "language": "en",
            "section_number": "379",
            "section_label": "Section 379 — Punishment for theft",
            "page_start": None,
            "page_end": None,
            "text": "Whoever commits theft shall be punished.",
            "embedding": [1.0] + [0.0] * 1023,
            "checksum": "a" * 64,
        }
        row.update(overrides)
        return row

    def _export(self, rows):
        directory = Path(tempfile.mkdtemp())
        (directory / "chunks.jsonl").write_text(
            "\n".join(json.dumps(row) for row in rows) + "\n",
            encoding="utf-8",
        )
        return directory

    def test_dry_run_writes_nothing(self):
        directory = self._export([self._row()])
        call_command(
            "import_legal_corpus",
            source=str(directory),
            dry_run=True,
        )
        self.assertEqual(LegalDocument.objects.count(), 0)
        self.assertEqual(LegalChunk.objects.count(), 0)

    def test_import_writes_document_and_chunk(self):
        directory = self._export([self._row()])
        call_command(
            "import_legal_corpus",
            source=str(directory),
            replace=True,
        )
        self.assertEqual(LegalDocument.objects.count(), 1)
        chunk = LegalChunk.objects.get()
        self.assertEqual(chunk.section_number, "379")
        self.assertEqual(chunk.source_type, "act")
        self.assertEqual(len(chunk.embedding), 1024)

    def test_missing_field_fails_before_writing(self):
        row = self._row()
        row.pop("section_number")
        directory = self._export([row])
        with self.assertRaises(CommandError):
            call_command(
                "import_legal_corpus",
                source=str(directory),
                replace=True,
            )
        self.assertEqual(LegalDocument.objects.count(), 0)

    @override_settings(LEGAL_RAG_EMBEDDING_PROVIDER="gemini")
    def test_wrong_vector_space_fails_before_writing(self):
        directory = self._export([self._row()])
        with self.assertRaises(CommandError):
            call_command(
                "import_legal_corpus",
                source=str(directory),
                replace=True,
            )
        self.assertEqual(LegalDocument.objects.count(), 0)
