from types import SimpleNamespace
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from accounts.models import Account
from api_key.models import ApiKey
from chat_bot.models import (
    AiRequest,
    ChatSession,
    CLARIFY_FALLBACK,
    OUT_OF_SCOPE_MESSAGE,
    SMALL_TALK_REPLY,
    extractive_answer,
    retrieve_rag_sources,
    validate_rag_answer,
)
from chat_bot.serializers import AiRequestCreateSerializer

User = get_user_model()


def default_plan(question):
    return {
        "intent": "legal_question",
        "answer_first": True,
        "search_queries": [question],
        "slots_missing": [],
        "clarifying_question": None,
    }


class PlatformFallbackTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="fallback@example.com",
            password="TestPass!2026",
            full_name="Fallback User",
        )
        self.user.is_verified = True
        self.user.save()
        self.account = Account.objects.create(user=self.user, full_name="Fallback User")
        self.session = ChatSession.objects.create(
            title="Test Session",
            account_id=self.account,
        )
        self.client = APIClient()
        self.client.force_authenticate(self.user)
        self.plan_patcher = patch(
            "chat_bot.models.plan_question",
            side_effect=lambda question, history, complete: default_plan(question),
        )
        self.plan_patcher.start()
        self.addCleanup(self.plan_patcher.stop)

    @override_settings(
        OMNIROUTE_BASE_URL="http://omniroute.test/v1",
        OMNIROUTE_API_KEY="test-key",
    )
    def test_serializer_allows_no_key_when_platform_configured(self):
        request = SimpleNamespace(user=self.user)
        serializer = AiRequestCreateSerializer(
            data={"session": self.session.id, "message": "hello"},
            context={"request": request},
        )
        self.assertTrue(serializer.is_valid(), serializer.errors)

    @override_settings(
        OMNIROUTE_BASE_URL="",
        OMNIROUTE_API_KEY="",
    )
    def test_serializer_blocks_no_key_without_platform(self):
        request = SimpleNamespace(user=self.user)
        serializer = AiRequestCreateSerializer(
            data={"session": self.session.id, "message": "hello"},
            context={"request": request},
        )
        self.assertFalse(serializer.is_valid())
        self.assertIn("error", serializer.errors)

    @override_settings(
        OMNIROUTE_BASE_URL="http://omniroute.test/v1",
        OMNIROUTE_API_KEY="test-key",
        OMNIROUTE_DAILY_LIMIT=50,
    )
    def test_keyless_user_gets_429_at_daily_limit(self):
        for _ in range(50):
            AiRequest.objects.create(
                account_id=self.account,
                session=self.session,
                message="seed",
                status="COMPLETED",
            )

        response = self.client.post(
            f"/v1/api/assistant/sessions/{self.session.id}/send/",
            {"message": "one too many"},
            format="json",
        )
        self.assertEqual(response.status_code, 429)
        self.assertIn("Daily free limit", response.json()["error"])

    @override_settings(
        OMNIROUTE_DAILY_LIMIT=50,
    )
    def test_user_with_working_key_is_not_capped(self):
        ApiKey.objects.create(
            account_id=self.account,
            api_key="test-gemini-key",
            is_working=True,
        )
        for _ in range(50):
            AiRequest.objects.create(
                account_id=self.account,
                session=self.session,
                message="seed",
                status="COMPLETED",
            )

        response = self.client.post(
            f"/v1/api/assistant/sessions/{self.session.id}/send/",
            {"message": "still allowed"},
            format="json",
        )
        self.assertEqual(response.status_code, 201)

    @override_settings(
        OMNIROUTE_BASE_URL="http://omniroute.test/v1",
        OMNIROUTE_API_KEY="test-key",
        OMNIROUTE_MODEL="test-model",
    )
    def test_keyless_request_uses_platform_fallback(self):
        chunk = {
            "id": "chunk-1",
            "text": "Section 496 of the Criminal Procedure Code grants bail.",
            "section_label": "Section 496 — Bail",
            "page_start": 10,
            "page_end": 10,
            "source_url": "https://example.test/act-11",
            "document_title": "Code of Criminal Procedure",
            "score": 0.9,
        }
        ai_request = AiRequest.objects.create(
            account_id=self.account,
            session=self.session,
            message="What is bail?",
        )

        with patch("chat_bot.models.retrieve_rag_sources", return_value=[chunk]), \
             patch("chat_bot.models.build_rag_context", return_value="[S1] Code of Criminal Procedure"), \
             patch("chat_bot.models.platform_completion", return_value="Platform answer [S1]") as completion, \
             patch("chat_bot.models.ChatSession._queue_job"):
            ai_request.handle()

        ai_request.refresh_from_db()
        self.assertEqual(ai_request.status, "COMPLETED")
        self.assertEqual(ai_request.response, "Platform answer [S1]")
        completion.assert_called_once()

    @override_settings(
        OMNIROUTE_BASE_URL="http://omniroute.test/v1",
        OMNIROUTE_API_KEY="test-key",
    )
    def test_first_non_legal_message_asks_for_context(self):
        plan = {
            "intent": "gibberish",
            "answer_first": False,
            "search_queries": [],
            "slots_missing": [],
            "clarifying_question": "What legal issue should I search for?",
        }
        ai_request = AiRequest.objects.create(
            account_id=self.account,
            session=self.session,
            message="What is the weather in Dhaka?",
        )

        with patch("chat_bot.models.plan_question", return_value=plan), \
             patch("chat_bot.models.retrieve_rag_sources") as retrieve, \
             patch("chat_bot.models.platform_completion") as completion, \
             patch("chat_bot.models.ChatSession._queue_job"):
            ai_request.handle()

        ai_request.refresh_from_db()
        self.assertEqual(ai_request.status, "COMPLETED")
        self.assertEqual(ai_request.response, plan["clarifying_question"])
        retrieve.assert_not_called()
        completion.assert_not_called()

    def test_repeated_non_legal_messages_hit_the_boundary(self):
        self.session.messages = [
            {"response": "What legal issue should I search for?"},
            {"response": "Which area is this about?"},
        ]
        self.session.save(update_fields=["messages"])
        plan = {
            "intent": "gibberish",
            "answer_first": False,
            "search_queries": [],
            "slots_missing": [],
            "clarifying_question": "What legal issue should I search for?",
        }
        ai_request = AiRequest.objects.create(
            account_id=self.account,
            session=self.session,
            message="What is the weather in Dhaka?",
        )

        with patch("chat_bot.models.plan_question", return_value=plan), \
             patch("chat_bot.models.retrieve_rag_sources", return_value=[]), \
             patch("chat_bot.models.platform_completion") as completion, \
             patch("chat_bot.models.ChatSession._queue_job"):
            ai_request.handle()

        ai_request.refresh_from_db()
        self.assertEqual(ai_request.response, OUT_OF_SCOPE_MESSAGE)
        completion.assert_not_called()

    def test_planner_failure_refuses_instead_of_guessing(self):
        plan = {
            "intent": "legal_question",
            "planner_ok": False,
            "answer_first": False,
            "search_queries": [],
            "lexical_query": "",
            "slots_missing": [],
            "clarifying_question": None,
        }
        ai_request = AiRequest.objects.create(
            account_id=self.account,
            session=self.session,
            message="I need a gun and how can I own one?",
        )

        with patch("chat_bot.models.plan_question", return_value=plan), \
             patch("chat_bot.models.retrieve_rag_sources") as retrieve, \
             patch("chat_bot.models.platform_completion") as completion, \
             patch("chat_bot.models.ChatSession._queue_job"):
            ai_request.handle()

        ai_request.refresh_from_db()
        self.assertIn("connect with a real lawyer", ai_request.response)
        retrieve.assert_not_called()
        completion.assert_not_called()

    def test_legal_question_without_sources_returns_lawyer_referral(self):
        ai_request = AiRequest.objects.create(
            account_id=self.account,
            session=self.session,
            message="What is the punishment for dowry?",
        )

        with patch("chat_bot.models.retrieve_rag_sources", return_value=[]), \
             patch("chat_bot.models.platform_completion") as completion, \
             patch("chat_bot.models.ChatSession._queue_job"):
            ai_request.handle()

        ai_request.refresh_from_db()
        self.assertIn("connect with a real lawyer", ai_request.response)
        completion.assert_not_called()

    @override_settings(
        OMNIROUTE_BASE_URL="http://omniroute.test/v1",
        OMNIROUTE_API_KEY="test-key",
    )
    def test_uncited_model_answer_falls_back_to_grounded_excerpt(self):
        chunk = {
            "id": "chunk-1",
            "text": "Section 3 defines evidence.",
            "section_label": "Section 3",
            "page_start": 1,
            "page_end": 1,
            "source_url": "",
            "document_title": "Evidence Act",
            "score": 0.9,
        }
        ai_request = AiRequest.objects.create(
            account_id=self.account,
            session=self.session,
            message="What is evidence?",
        )

        with patch("chat_bot.models.retrieve_rag_sources", return_value=[chunk]), \
             patch("chat_bot.models.build_rag_context", return_value="[S1] Evidence Act"), \
             patch("chat_bot.models.platform_completion", return_value="Evidence is whatever I remember."), \
             patch("chat_bot.models.ChatSession._queue_job"):
            ai_request.handle()

        ai_request.refresh_from_db()
        self.session.refresh_from_db()
        self.assertIn("Section 3 defines evidence", ai_request.response)
        self.assertEqual(len(self.session.messages[-1]["sources"]), 1)
        self.assertEqual(
            self.session.messages[-1]["sources"][0]["citation"], "S1"
        )

    def test_uncited_sentence_is_removed_not_answered(self):
        chunks = [
            {
                "text": "Section 3 defines evidence.",
                "section_label": "Section 3",
                "document_title": "The Evidence Act, 1872",
            }
        ]
        accepted = validate_rag_answer(
            "Evidence is defined in Section 3 [S1]. This means it covers "
            "oral and documentary proof.",
            chunks,
            "What is evidence?",
        )
        self.assertIn("[S1]", accepted)
        self.assertNotIn("oral and documentary", accepted)
        self.assertNotIn("could not find", accepted.lower())

    def test_answer_with_no_citation_is_refused(self):
        chunks = [{"text": "Section 3 defines evidence."}]
        rejected = validate_rag_answer(
            "Evidence is whatever I remember.", chunks
        )
        self.assertIn("connect with a real lawyer", rejected)

    def test_non_legal_answer_with_a_real_citation_is_refused(self):
        chunks = [
            {
                "text": "Section 3 defines evidence.",
                "document_title": "The Evidence Act, 1872",
            }
        ]
        answer = validate_rag_answer(
            "The integral of x squared is 2x [S1].",
            chunks,
            "What is the integral of x squared?",
        )
        self.assertIn("connect with a real lawyer", answer)

    def test_small_talk_does_not_call_retrieval(self):
        ai_request = AiRequest.objects.create(
            account_id=self.account,
            session=self.session,
            message="hello",
        )

        with patch("chat_bot.models.retrieve_rag_sources") as retrieve, \
             patch("chat_bot.models.platform_completion") as completion, \
             patch("chat_bot.models.ChatSession._queue_job"):
            ai_request.handle()

        ai_request.refresh_from_db()
        self.assertEqual(ai_request.response, SMALL_TALK_REPLY)
        retrieve.assert_not_called()
        completion.assert_not_called()

    def test_non_legal_question_asks_for_context_before_retrieval(self):
        plan = {
            "intent": "gibberish",
            "answer_first": False,
            "search_queries": [],
            "slots_missing": [],
            "clarifying_question": "What legal issue should I search for?",
        }
        ai_request = AiRequest.objects.create(
            account_id=self.account,
            session=self.session,
            message="What is 2+2?",
        )

        with patch("chat_bot.models.plan_question", return_value=plan), \
             patch("chat_bot.models.retrieve_rag_sources") as retrieve, \
             patch("chat_bot.models.platform_completion") as completion, \
             patch("chat_bot.models.ChatSession._queue_job"):
            ai_request.handle()

        ai_request.refresh_from_db()
        self.assertEqual(ai_request.response, plan["clarifying_question"])
        retrieve.assert_not_called()
        completion.assert_not_called()
        self.session.refresh_from_db()
        self.assertEqual(self.session.messages[-1]["sources"], [])

    def test_xml_citation_is_normalized(self):
        chunks = [{"text": "Section 3 defines evidence."}]
        accepted = validate_rag_answer(
            "Evidence is defined here <citation src=\"S1\"></citation>.",
            chunks,
        )
        self.assertEqual(accepted, "Evidence is defined here [S1].")

    def test_extractive_answer_is_short_and_cited(self):
        chunks = [
            {
                "text": "Section 3 defines evidence. " * 40,
                "section_label": "Section 3",
                "page_start": 12,
                "document_title": "The Evidence Act, 1872",
            }
        ]
        answer = extractive_answer(chunks)
        self.assertLessEqual(len(answer), 300)
        self.assertIn("The Evidence Act, 1872", answer)
        self.assertIn("[S1]", answer)
        self.assertIn("Section 3 defines evidence", answer)

    def test_extractive_answer_picks_the_relevant_chunk(self):
        chunks = [
            {
                "text": "Article 36 protects freedom of movement.",
                "section_label": "Article 36",
                "document_title": "Constitution",
            },
            {
                "text": (
                    "Whoever voluntarily has carnal intercourse against the "
                    "order of nature shall be punished."
                ),
                "section_label": "Section 377",
                "document_title": "Penal Code",
            },
        ]
        terms = [
            "Penal Code 377 unnatural carnal",
            "carnal intercourse punished",
        ]
        answer = extractive_answer(chunks, "Why LGBT is forbidden?", terms)
        self.assertIn("Penal Code", answer)
        self.assertIn("[S2]", answer)

    def test_extractive_answer_refuses_irrelevant_chunks(self):
        answer = extractive_answer(
            [{"text": "Article 36 protects freedom of movement."}],
            "Why LGBT is forbidden?",
            ["LGBT unnatural carnal 377", "forbidden prohibited punished"],
        )
        self.assertIn("connect with a real lawyer", answer)

    def test_retrieval_uses_planner_queries(self):
        vector = {"id": 1, "text": "vector", "document_title": "Penal Code"}
        keyword = {"id": 2, "text": "keyword", "document_title": "Dowry Act"}

        with patch(
                 "legal_rag.services.retrieve_legal_chunks",
                 return_value=[vector],
             ), \
             patch(
                 "legal_rag.services.retrieve_legal_chunks_keyword",
                 return_value=[keyword],
             ), \
             patch(
                 "chat_bot.models._rerank_by_title",
                 side_effect=lambda question, chunks: (chunks, True),
             ):
            result = retrieve_rag_sources(
                "Why LGBT is forbidden?",
                ["Why LGBT is forbidden?", "Penal Code 377"],
            )

        self.assertEqual({chunk["id"] for chunk in result}, {1, 2})

    def test_retrieval_returns_empty_when_all_arms_are_empty(self):
        with patch(
                 "legal_rag.services.retrieve_legal_chunks",
                 return_value=[],
             ), \
             patch(
                 "legal_rag.services.retrieve_legal_chunks_keyword",
                 return_value=[],
             ):
            self.assertEqual(
                retrieve_rag_sources("anything", ["anything"]), []
            )

    def test_followup_retrieval_includes_previous_question(self):
        self.session.messages = [
            {"message": "What is the punishment for taking dowry?"}
        ]
        self.session.save(update_fields=["messages"])
        ai_request = AiRequest.objects.create(
            account_id=self.account,
            session=self.session,
            message="What is the punishment for that?",
        )
        chunk = {
            "id": "chunk-1",
            "text": "Section 4 prescribes the punishment for dowry.",
            "section_label": "Section 4",
            "document_title": "Dowry Prohibition Act",
            "score": 0.9,
        }

        with patch(
            "chat_bot.models.retrieve_rag_sources", return_value=[chunk]
        ) as retrieve, \
             patch(
                 "chat_bot.models.build_rag_context",
                 return_value="[S1] Dowry Prohibition Act",
             ), \
             patch(
                 "chat_bot.models.platform_completion",
                 return_value="Dowry is punishable [S1]",
             ), \
             patch("chat_bot.models.ChatSession._queue_job"):
            ai_request.handle()

        self.assertIn("dowry", retrieve.call_args[0][0].lower())

    def test_add_message_keeps_only_cited_source_metadata(self):
        sources = [
            {"id": 1, "text": "first", "document_title": "A"},
            {"id": 2, "text": "second", "document_title": "B"},
        ]
        with patch("chat_bot.models.ChatSession._queue_job"):
            self.session.add_message(
                "question",
                "answer with the second source [S2].",
                sources=sources,
            )

        self.session.refresh_from_db()
        stored = self.session.messages[-1]["sources"]
        self.assertEqual(len(stored), 1)
        self.assertEqual(stored[0]["citation"], "S2")
        self.assertEqual(stored[0]["document_title"], "B")
        self.assertNotIn("text", stored[0])

    def test_session_detail_returns_source_metadata(self):
        self.session.messages = [
            {
                "message": "What is evidence?",
                "response": "Evidence is defined in Section 3 [S1].",
                "sources": [
                    {
                        "id": 1,
                        "document_title": "The Evidence Act, 1872",
                        "section_label": "Section 3",
                        "page_start": 12,
                    }
                ],
            }
        ]
        self.session.save(update_fields=["messages"])

        response = self.client.get(
            f"/v1/api/assistant/sessions/{self.session.id}/"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json()["messages"][0]["sources"][0]["section_label"],
            "Section 3",
        )

    def test_chat_endpoints_require_authentication(self):
        anonymous = APIClient()
        response = anonymous.get("/v1/api/assistant/sessions/")
        self.assertEqual(response.status_code, 401)
