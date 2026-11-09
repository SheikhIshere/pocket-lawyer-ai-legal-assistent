# location: backend/chat_bot/models.py

# core import
from django.db import models
from django.conf import settings

# ai engin
from google import genai
from google.genai import types

# id
import uuid
import requests

# model
from accounts.models import Account
from api_key.models import ApiKey

# base import
from BASE.base_model import BaseModel
from BASE.base_prompt import generate_title_prompt, get_legal_prompt, get_rag_prompt
from BASE.base_choice import (
    CeleryStatus, 
    ChatEngine,
    ModelStyle,
)
from legal_rag.planner import plan_question
# utils
from django.utils import timezone
import re


def platform_ai_available():
    """True when the owner-configured OmniRoute fallback is usable."""
    return bool(settings.OMNIROUTE_BASE_URL and settings.OMNIROUTE_API_KEY)


def platform_completion(prompt, timeout=55, max_models=None):
    """Call OmniRoute, rotating free models when one is rate-limited."""
    url = f"{settings.OMNIROUTE_BASE_URL.rstrip('/')}/chat/completions"
    models = [
        settings.OMNIROUTE_MODEL,
        *getattr(settings, "OMNIROUTE_FALLBACK_MODELS", []),
    ]
    if max_models:
        models = models[:max_models]
    last_response = None

    for model in models:
        response = requests.post(
            url,
            headers={
                "Authorization": f"Bearer {settings.OMNIROUTE_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=timeout,  # keep below the frontend's 60s polling timeout
        )
        if response.status_code in {429, 502, 503, 504}:
            last_response = response
            continue
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]

    if last_response is not None:
        last_response.raise_for_status()
    raise RuntimeError("No OmniRoute fallback model is configured.")


def gemini_planner_completion(api_key, prompt, timeout=25, max_models=None):
    """Run the planner on the user's own Gemini key (keyed accounts)."""
    client = genai.Client(
        api_key=api_key,
        http_options=types.HttpOptions(timeout=timeout * 1000),
    )
    for model in (
        ChatEngine.GEMINI_2_5_FLASH_LITE.label,
        ChatEngine.GEMINI_2_5_FLASH.label,
    ):
        try:
            result = client.models.generate_content(
                model=model,
                contents=prompt,
            )
            text = result.text
            if text:
                return text
        except Exception as exc:
            print(f"Gemini planner model {model} failed: {exc}")
    raise RuntimeError("Gemini planner failed")


def legal_refusal_message():
    """User-facing refusal used when no indexed source supports an answer."""
    try:
        from legal_rag.services import refusal_message
        return refusal_message()
    except Exception:
        return (
            "I could not find this in the provided legal sources. "
            "Please try to connect with a real lawyer licensed in Bangladesh."
        )


def is_legal_refusal(text):
    return "could not find this in the provided legal sources" in (
        text or ""
    ).lower()


OUT_OF_SCOPE_MESSAGE = (
    "I can only help with questions about Bangladesh law. "
    "For math, coding, or general questions, please use another tool."
)

def refusal_message_for(question):
    """Legal refusal for a question the corpus cannot support."""
    return legal_refusal_message()


def is_refusal(text):
    return is_legal_refusal(text) or (text or "").strip() == OUT_OF_SCOPE_MESSAGE


_SMALL_TALK = re.compile(
    r"^\s*(hi|hello|hey|good\s+(morning|afternoon|evening)|"
    r"thanks|thank\s+you|bye|goodbye|ok|okay)\s*[!.?]*\s*$",
    re.IGNORECASE,
)

SMALL_TALK_REPLY = (
    "Hello! I'm PocketLawyer. Ask me a question about Bangladesh law — "
    "for example bail, dowry, wages, marriage, or cyber offences."
)

CLARIFY_FALLBACK = "What legal issue should I search for?"


def _clarify_count(session):
    """Count consecutive assistant replies that were questions."""
    if not session:
        return 0
    count = 0
    for entry in reversed(session.messages or []):
        response = (entry.get("response") or "").strip()
        if response.endswith("?") and len(response) <= 300:
            count += 1
        else:
            break
    return count


def extractive_answer(chunks, question=None, search_terms=None):
    """Grounded fallback when the LLM is unavailable or fails citation checks."""
    refuse = legal_refusal_message()
    if not chunks:
        return refuse
    index = 0
    chunk = chunks[0]
    if question:
        from legal_rag.services import chunk_grounded

        # Keep the reranker's order: take the first chunk that covers the
        # question, not whichever chunk happens to repeat the most words.
        for position, candidate in enumerate(chunks):
            if chunk_grounded(
                question, candidate, search_terms or [question]
            ):
                index = position
                chunk = candidate
                break
        else:
            # FIX: the LLM being rate-limited used to quote the top chunk
            # even when it had nothing to do with the question. Refuse
            # instead of presenting an irrelevant statute as the answer.
            return refuse

    text = " ".join((chunk.get("text") or "").split())
    if not text:
        return refuse

    title = chunk.get("document_title") or "Legal source"
    section = chunk.get("section_label") or ""
    page = chunk.get("page_start")
    prefix = title
    if section:
        prefix += f" — {section}"
    if page:
        prefix += f" (p. {page})"
    suffix = f" [S{index + 1}]"

    budget = 300 - len(prefix) - len(suffix) - 2
    if budget < 60:
        prefix = title
        budget = 300 - len(prefix) - len(suffix) - 2
    if budget < 20:
        return refuse

    snippet = text if len(text) <= budget else text[:budget].rsplit(" ", 1)[0]
    if not snippet:
        return refuse
    return f"{prefix}: {snippet}{suffix}"


_AMENDMENT_LABEL = re.compile(
    r"\b(substituted|inserted|omitted|amended|amendment|repealed)\b",
    re.IGNORECASE,
)


def _drop_amendments(chunks):
    """Prefer the article text over its amendment footnotes."""
    clean = [
        chunk
        for chunk in chunks
        if not _AMENDMENT_LABEL.search(chunk.get("section_label") or "")
    ]
    return clean or chunks


_RERANK_PROMPT = (
    "You are a Bangladeshi legal research assistant. Do not answer the question. "
    "From the numbered Act titles below, choose the Acts that directly govern "
    "the question. Reply with only the numbers of up to 5 Acts, most relevant "
    "first, separated by commas. If none are relevant, reply NONE.\n\n"
    "Question: {question}\n\nActs:\n{acts}"
)


def _rerank_by_title(question, chunks):
    """Reorder chunks by Act title; return (chunks, reranked)."""
    if len(chunks) < 2 or not platform_ai_available():
        return chunks, False
    titles = list(
        dict.fromkeys(chunk.get("document_title") or "" for chunk in chunks)
    )
    # 60 titles covers the whole deduplicated pool for a 150-chunk candidate
    # set, including a rare Act that only the lexical arm found at rank 130.
    titles = [title for title in titles if title][:60]
    if len(titles) < 2:
        return chunks, False
    acts = "\n".join(
        f"{index}. {title}" for index, title in enumerate(titles, 1)
    )
    try:
        answer = platform_completion(
            _RERANK_PROMPT.format(question=question, acts=acts),
            timeout=8,
            max_models=2,
        )
    except Exception as exc:
        print(f"Legal RAG rerank failed: {exc}")
        return chunks, False
    picked = []
    for number in re.findall(r"\d+", answer or ""):
        index = int(number)
        if 1 <= index <= len(titles) and index not in picked:
            picked.append(index)
        if len(picked) == 5:
            break
    if not picked:
        return chunks, False
    selected = [titles[index - 1] for index in picked]
    ordered = [
        chunk
        for title in selected
        for chunk in chunks
        if chunk.get("document_title") == title
    ]
    ordered += [
        chunk
        for chunk in chunks
        if chunk.get("document_title") not in selected
    ]
    return ordered, True


def retrieve_rag_sources(question, search_queries=None, lexical_query=None):
    """Retrieve with the planner's queries, rerank by Act, return the best."""
    try:
        from legal_rag.services import retrieve_multi_query

        queries = search_queries
        if not queries:
            plan = plan_question(question, "", platform_completion)
            if not plan.get("planner_ok", True):
                return []
            queries = plan["search_queries"]
            lexical_query = plan.get("lexical_query")

        chunks = retrieve_multi_query(
            queries,
            limit=settings.LEGAL_RAG_TOP_K * 3,
            lexical_query=lexical_query or (queries[-1] if queries else question),
        )
        chunks, reranked = _rerank_by_title(question, chunks)
        # A rare exact gloss ("dowry" inside the Bangla Dowry Act) is stronger
        # than the title model's opinion; keep the Act it points to.
        exact = next(
            (chunk for chunk in chunks if chunk.get("exact_gloss")),
            None,
        )
        has_core = any(
            chunk.get("planner_core_hits", 0) > 0 for chunk in chunks
        )
        if not reranked and exact is None and not has_core:
            # Only a generic section-label word is left. Refuse rather than
            # answer from a word match the planner cannot confirm.
            return []
        if exact is not None:
            chunks = [exact] + [
                chunk
                for chunk in chunks
                if chunk.get("id") != exact.get("id")
            ]
        elif chunks:
            # The title reranker can be down or wrong; the corpus-measured
            # title vote is deterministic. Keep the Act it points to first.
            best = max(
                chunks,
                key=lambda chunk: chunk.get("planner_title_hits", 0),
            )
            if best.get("planner_title_hits", 0) > 0:
                chunks = [best] + [
                    chunk
                    for chunk in chunks
                    if chunk.get("id") != best.get("id")
                ]
        chunks = chunks[: settings.LEGAL_RAG_TOP_K]
        if "amend" not in (question or "").lower():
            chunks = _drop_amendments(chunks)
        return chunks
    except Exception as exc:
        print(f"Legal RAG retrieval failed: {exc}")
        return []


def build_rag_context(chunks):
    try:
        from legal_rag.services import build_context
        return build_context(chunks)
    except Exception as exc:
        print(f"Legal RAG context build failed: {exc}")
        return ""


def validate_rag_answer(text, chunks, question=None, search_terms=None):
    """Keep only cited sentences and require a cited source to cover the query."""
    refusal = refusal_message_for(question) if question else legal_refusal_message()
    if not text or not text.strip():
        return refusal

    # Some free OpenAI-compatible models emit XML-style citations.
    text = re.sub(
        r'<citation\s+src=["\']?S?(\d+)["\']?\s*/?>(?:\s*</citation>)?',
        r"[S\1]",
        text,
        flags=re.IGNORECASE,
    )
    text = re.sub(
        r"\[(?:Source|S)\s*(\d+)\]",
        r"[S\1]",
        text,
        flags=re.IGNORECASE,
    )

    if is_legal_refusal(text):
        return refusal

    if not chunks:
        return refusal

    valid = {str(i) for i in range(1, len(chunks) + 1)}
    refs = re.findall(r"\[S(\d+)\]", text)
    if not refs:
        return refusal

    cleaned = re.sub(
        r"\[S(\d+)\]",
        lambda m: m.group(0) if m.group(1) in valid else "",
        text,
    ).strip()
    if not re.search(r"\[S\d+\]", cleaned):
        return refusal

    # Drop every sentence that states something without a citation. Caveats
    # and referrals may stand without one; anything else must point at a PDF.
    sentences = [
        sentence.strip()
        for sentence in re.split(r"(?<=[.!?])\s+|\n+", cleaned)
        if sentence.strip()
    ]
    kept = []
    for sentence in sentences:
        lowered = sentence.lower()
        if (
            re.search(r"\[S\d+\]", sentence)
            or "sources do not cover" in lowered
            or "could not find" in lowered
            or "not legal advice" in lowered
            or "consult a lawyer" in lowered
            or "connect with a real lawyer" in lowered
        ):
            kept.append(sentence)
    cleaned = " ".join(kept).strip()
    if not re.search(r"\[S\d+\]", cleaned):
        return refusal

    if question:
        from legal_rag.services import chunk_grounded

        cited = {int(ref) for ref in re.findall(r"\[S(\d+)\]", cleaned)}
        if not any(
            1 <= index <= len(chunks)
            and chunk_grounded(
                question,
                chunks[index - 1],
                search_terms or [question],
            )
            for index in cited
        ):
            # A citation to a real source is not enough; the source must
            # actually answer the planner's query. This is the anti-
            # hallucination backstop for unrelated or non-legal questions.
            return refusal

    return cleaned



"""
chat session :
    1 this will store all of the chat history
    2 it will have a foreign key to the user
"""
class ChatSession(BaseModel):
    # id
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # relation with id
    account_id = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='chat_session')

    # chat history
    title = models.CharField(max_length=255, blank=True)
    messages = models.JSONField(default=list, blank=True)

    # worker status
    status = models.CharField(max_length=20, choices=CeleryStatus.choices, default=CeleryStatus.PENDING)

    class Meta:
        db_table = 'chat_session'
        verbose_name = 'Chat Session'
        verbose_name_plural = 'Chat Sessions'
        
    def __str__(self):
        # account is an Account instance
        email = getattr(self.account_id, 'user', None)
        email_text = email.email if email else str(self.account_id)
        title = self.title
        return f"{title}" if title else f"{email_text} - {self.created_at}"

    
    @property
    def ai_request_count(self):
        """Return count of AiRequest objects in this session."""
        return AiRequest.objects.filter(session=self).count()


    def _queue_job(self):
        """Schedule background AI title generation (Celery task)."""
        from .tasks import handle_ai_session_title_name
        handle_ai_session_title_name.delay(str(self.id))

    def _conversation_text(self) -> str:
        """Render messages into a readable conversation string for the model prompt."""
        parts = []
        for m in (self.messages or []):
            email = m.get("email") or (self.account_id.user.email if getattr(self.account_id, 'user', None) else "user")
            user_msg = m.get("message", "")
            bot = m.get("response", "")
            parts.append(f"User: {user_msg}")
            if bot:
                parts.append(f"Assistant: {bot}")
        return "\n".join(parts).strip()

    def handle(self):
        """Main engine to generate a short title (intended to run inside Celery worker)."""
        self.status = CeleryStatus.RUNNING
        self.save(update_fields=["status", "updated_at"]) if hasattr(self, 'updated_at') else self.save()

        try:
            conversation_text = self._conversation_text() or "No conversation text available."
            prompt = generate_title_prompt(conversation_text)

            key = ApiKey.objects.filter(account_id=self.account_id).first()
            if key:
                client = genai.Client(
                    api_key=key.api_key,
                    http_options=types.HttpOptions(timeout=60_000),
                )
                model_name = ChatEngine.GEMINI_2_5_FLASH_LITE.label  # use the label string for the model

                result = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                )

                # defensive text extraction
                raw = None
                if hasattr(result, "text"):
                    raw = result.text
                elif isinstance(result, dict):
                    raw = result.get("text") or result.get("output") or result.get("result")
                    if isinstance(raw, list) and raw:
                        first = raw[0]
                        raw = first if not isinstance(first, dict) else first.get("content") or first.get("text") or ""
            elif platform_ai_available():
                raw = platform_completion(prompt)
            else:
                raise RuntimeError("No API key and no platform fallback configured")

            raw = (raw or "").strip()

            # sanitize and keep first up to 3 words
            if raw:
                raw = raw.splitlines()[0].strip()
                raw = re.sub(r'^(title[:\s\-]+)', '', raw, flags=re.IGNORECASE).strip()
                raw = re.sub(r'[^\w\s]', '', raw)
                words = [w for w in raw.split() if w]
                cleaned = (" ".join(words[:5]).title()) if words else f"New Chat {uuid.uuid4().hex[:4]}"
            else:
                cleaned = f"New Chat {uuid.uuid4().hex[:4]}"

            self.title = cleaned[:255]
            # save title and updated_at if present
            update_fields = ["title"]
            if hasattr(self, 'updated_at'):
                update_fields.append('updated_at')
            self.save(update_fields=update_fields)

            self.status = CeleryStatus.COMPLETED
            self.save(update_fields=["status"]) if hasattr(self, 'updated_at') else self.save()

        except Exception as exc:
            # log error for debugging
            print(f"ChatSession.handle error: {exc}")
            self.status = CeleryStatus.FAILED
            self.save(update_fields=["status"]) if hasattr(self, 'updated_at') else self.save()

    def add_message(self, message: str, response: str = "", email: str = None, engine: str = None, style: str = None, created_at=None, sources=None):
        """Add a message to the session history and queue AI title generation once.

        Parameters:
            message: user message text (required)
            response: assistant response text (optional)
            email: sender email (optional, falls back to account.user.email)
            engine: model identifier used (optional)
            style: response style used (optional)
            created_at: datetime (optional)
            sources: retrieved legal sources (optional)
        """
        if created_at is None:
            created_at = timezone.now()

        # ensure messages is a list
        if not isinstance(self.messages, list):
            self.messages = []

        email = email or (self.account_id.user.email if getattr(self.account_id, 'user', None) else "unknown")

        is_first_message = len(self.messages) == 0
        next_count = len(self.messages) + 1
        cited = {
            int(index)
            for index in re.findall(r"\[S(\d+)\]", response or "")
        }
        stored_sources = []
        if cited:
            for index, source in enumerate(sources or [], start=1):
                if not isinstance(source, dict):
                    continue
                if index not in cited:
                    continue
                metadata = {
                    key: value for key, value in source.items() if key != "text"
                }
                metadata["citation"] = f"S{index}"
                stored_sources.append(metadata)

        entry = {
            "email": email,
            "count": next_count,
            "message": message,
            "response": response,
            "model": engine,
            "style": style,
            "sources": stored_sources,
            "created_at": created_at.isoformat() if hasattr(created_at, "isoformat") else str(created_at),
        }

        self.messages.append(entry)

        # instant fallback title (first message only)
        if is_first_message and message:
            self.title = str(message).strip()[:60]

        # save messages (and title if set)
        update_fields = ["messages"]
        if hasattr(self, 'updated_at'):
            update_fields.append('updated_at')
        if is_first_message and message:
            update_fields.insert(0, "title")

        self.save(update_fields=update_fields)

        # queue AI title generation only when first message was added
        if is_first_message:
            try:
                self._queue_job()
            except Exception as exc:
                print("Failed to queue AI title job:", exc)





"""
main chat system
where user will send a request
and gemini will give a response according to our ai 
and it's the toughest part cz this is the difference 
between me in home vs me in jain :)
"""

class AiRequest(BaseModel):
    # id
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # user relation ship
    account_id = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='chat_bot')

    # session tracking
    session = models.ForeignKey(
        ChatSession, on_delete=models.CASCADE, null=True, blank=True
    )
    
    # main user thing
    message = models.TextField()

    # auto generated via ai
    response = models.TextField(null=True, blank=True)

    # worker use
    status = models.CharField(max_length=20, choices=CeleryStatus.choices, default=CeleryStatus.PENDING)
    
    # response engine (algorithm use)
    response_engine = models.IntegerField(choices=ChatEngine.choices, blank=True, null=True)
    
    # character style
    response_style = models.CharField(max_length=20, choices=ModelStyle.choices, null=True, blank=True)


    def _queue_job(self):
        """Dispatch the request to Celery on successful transaction commit."""
        from .tasks import handle_ai_request_job
        from django.db import transaction
        transaction.on_commit(lambda: handle_ai_request_job.delay(str(self.id)))

    def _retrieval_question(self):
        """Carry the previous turn into retrieval for a referring follow-up."""
        message = self.message or ""
        refers_back = re.search(
            r"\b(that|this|it|same|thereof|above|those|these)\b",
            message.lower(),
        )
        if not refers_back or not self.session:
            return message
        previous = [
            entry.get("message")
            for entry in (self.session.messages or [])
            if entry.get("message")
        ]
        if not previous:
            return message
        # ponytail: one previous turn is enough for "what is the punishment
        # for that?"; move to a rolling summary if multi-turn follow-ups
        # start losing the original subject.
        return f"{previous[-1]} {message}"

    def _handle_platform(
        self, rag_context=None, sources=None, search_terms=None, plan=None
    ):
        """Answer with the owner-configured OmniRoute fallback (no user key)."""
        try:
            if rag_context:
                prompt = get_rag_prompt(
                    self.response_style,
                    self.message,
                    rag_context,
                    plan,
                )
            else:
                history = self.session._conversation_text() if self.session else ""
                instruction = get_legal_prompt(self.response_style, self.message)
                prompt = (
                    f"{instruction}\n\n"
                    f"--- CONVERSATION HISTORY ---\n{history}\n"
                    f"----------------------------\n"
                    f"User Query: {self.message}\nResponse:"
                )
            text = platform_completion(prompt, timeout=30, max_models=2)
            stored_sources = sources or []
            if rag_context:
                text = validate_rag_answer(
                    text,
                    sources,
                    self._retrieval_question(),
                    search_terms,
                )
                if is_refusal(text):
                    text = extractive_answer(
                        sources,
                        self._retrieval_question(),
                        search_terms,
                    )
                if is_refusal(text):
                    stored_sources = []

            self.response = text
            self.response_engine = None
            self.status = CeleryStatus.COMPLETED
            self.save(update_fields=[
                "status", "response", "response_engine", "updated_at",
            ])

            if self.session:
                email = "unknown"
                if getattr(self.account_id, "user", None):
                    email = self.account_id.user.email
                self.session.add_message(
                    message=self.message,
                    response=self.response,
                    email=email,
                    engine=settings.OMNIROUTE_MODEL,
                    style=self.response_style,
                    created_at=self.created_at,
                    sources=stored_sources,
                )
        except Exception as exc:
            print(f"Platform RAG error: {type(exc).__name__}: {exc}")
            if rag_context:
                self.status = CeleryStatus.COMPLETED
                self.response = extractive_answer(
                    sources,
                    self._retrieval_question(),
                    search_terms,
                )
                stored_sources = (
                    [] if is_refusal(self.response) else (sources or [])
                )
                self.save(update_fields=["status", "response", "updated_at"])
                if self.session:
                    email = "unknown"
                    if getattr(self.account_id, "user", None):
                        email = self.account_id.user.email
                    self.session.add_message(
                        message=self.message,
                        response=self.response,
                        email=email,
                        engine=None,
                        style=self.response_style,
                        created_at=self.created_at,
                        sources=stored_sources,
                    )
            else:
                self.status = CeleryStatus.FAILED
                self.response = str(exc)
                self.save(update_fields=["status", "response", "updated_at"])

    def _finish_with_reply(self, text):
        """Finish with a fixed reply and no sources."""
        self.status = CeleryStatus.COMPLETED
        self.response = text
        self.save(update_fields=["status", "response", "updated_at"])
        if self.session:
            email = "unknown"
            if getattr(self.account_id, "user", None):
                email = self.account_id.user.email
            self.session.add_message(
                message=self.message,
                response=self.response,
                email=email,
                engine=None,
                style=self.response_style,
                created_at=self.created_at,
                sources=[],
            )

    def _finish_without_sources(self):
        """Finish with a lawyer referral instead of answering from model memory."""
        self._finish_with_reply(refusal_message_for(self.message))

    def handle(self):
            """Core logic executed by the Celery worker to call the AI provider."""
            self.status = CeleryStatus.RUNNING
            self.save(update_fields=['status', 'updated_at'] if hasattr(self, 'updated_at') else ['status'])

            if _SMALL_TALK.match(self.message or ""):
                self._finish_with_reply(SMALL_TALK_REPLY)
                return

            history = self.session._conversation_text() if self.session else ""
            key = ApiKey.objects.filter(
                account_id=self.account_id, is_working=True
            ).first()

            def planner_complete(prompt, **kwargs):
                if key:
                    try:
                        return gemini_planner_completion(
                            key.api_key, prompt, **kwargs
                        )
                    except Exception as exc:
                        print(f"Gemini planner fallback failed: {exc}")
                return platform_completion(prompt, **kwargs)

            plan = plan_question(self.message, history, planner_complete)
            if not plan.get("planner_ok", True):
                # Without the planner there is no dynamic legal vocabulary;
                # refuse rather than answer from a word match.
                self._finish_without_sources()
                return
            intent = plan["intent"]
            if intent == "chit_chat":
                self._finish_with_reply(SMALL_TALK_REPLY)
                return
            if intent == "gibberish":
                if _clarify_count(self.session) >= 2:
                    self._finish_with_reply(OUT_OF_SCOPE_MESSAGE)
                else:
                    self._finish_with_reply(
                        plan.get("clarifying_question") or CLARIFY_FALLBACK
                    )
                return
            if intent == "out_of_scope":
                self._finish_with_reply(OUT_OF_SCOPE_MESSAGE)
                return

            sources = []
            try:
                # 0. Retrieve grounded legal sources before calling any model.
                sources = retrieve_rag_sources(
                    self._retrieval_question(),
                    plan["search_queries"],
                )
                if not sources:
                    self._finish_without_sources()
                    return

                rag_context = build_rag_context(sources)
                if not rag_context:
                    self._finish_without_sources()
                    return

                # 1. Use the key already resolved for the planner.
                if not key:
                    if not platform_ai_available():
                        self._finish_without_sources()
                        return
                    return self._handle_platform(
                        rag_context=rag_context,
                        sources=sources,
                        search_terms=plan["search_queries"],
                        plan=plan,
                    )

                # 2. Init client (defensive)
                try:
                    client = genai.Client(
                        api_key=key.api_key,
                        http_options=types.HttpOptions(timeout=25_000),
                    )
                except Exception as e:
                    raise RuntimeError(f"Failed to initialize AI client: {str(e)}")

                # 3. Prepare Engine Candidates
                # map of stored integer -> model string label
                engine_map = {val: label for val, label in ChatEngine.choices}
                
                # Default fallback order (Performance/Cost Hierarchy)
                fallback_order = [
                    ChatEngine.GEMINI_3_FLASH,
                    ChatEngine.GEMINI_2_5_FLASH,
                    ChatEngine.GEMINI_2_5_FLASH_LITE,
                    ChatEngine.GEMMA_3_27B
                ]

                candidates = []
                
                # A. Priority 1: The user's selection
                if self.response_engine and self.response_engine in engine_map:
                    candidates.append(self.response_engine)

                # B. Priority 2: Everything else (The Defaults)
                for e in fallback_order:
                    if e not in candidates:
                        candidates.append(e)

                # 4. Prepare Prompt (Persona + History + Retrieved Sources)
                history = self.session._conversation_text() if self.session else ""
                rag_query = (
                    f"{history}\n\nCurrent question: {self.message}"
                    if history
                    else self.message
                )
                prompt = get_rag_prompt(
                    self.response_style,
                    rag_query,
                    rag_context,
                    plan,
                )

                # 5. Execution Loop (Try candidates until one succeeds)
                completion = None
                used_engine_val = None
                last_exc = None
                
                for engine_val in candidates:
                    model_name = engine_map.get(engine_val)
                    if not model_name:
                        continue

                    try:
                        completion = client.models.generate_content(
                            model=model_name,
                            contents=prompt,
                        )
                        # if call didn't raise, record used engine and break
                        used_engine_val = engine_val
                        break
                    except Exception as e:
                        # record and continue to next candidate
                        last_exc = e
                        print(f"Model {model_name} failed: {e}")
                        continue

                if completion is None:
                    # none of the models worked
                    raise RuntimeError(f"All model attempts failed. Last Error: {last_exc}")

                # 6. Defensive extraction of text
                text = None
                if hasattr(completion, 'text'):
                    text = completion.text
                elif isinstance(completion, dict):
                    text = completion.get('text') or completion.get('output') or completion.get('result')
                    if isinstance(text, list) and text:
                        first = text[0]
                        if isinstance(first, dict):
                            text = first.get('content') or first.get('text') or str(first)
                        else:
                            text = str(first)

                if text is None:
                    text = str(completion)

                text = validate_rag_answer(
                    text,
                    sources,
                    self._retrieval_question(),
                    plan["search_queries"],
                )
                if is_refusal(text):
                    text = extractive_answer(
                        sources,
                        self._retrieval_question(),
                        plan["search_queries"],
                    )
                stored_sources = [] if is_refusal(text) else sources

                # 7. Persist response & mark completed
                self.response = text
                # record the engine actually used (int value)
                if used_engine_val is not None:
                    self.response_engine = used_engine_val
                self.status = CeleryStatus.COMPLETED

                # 8. Store in session with detailed METADATA
                if self.session:
                    try:
                        # Calculate safe email
                        user_email = "unknown"
                        if hasattr(self.account_id, 'user') and self.account_id.user:
                            user_email = self.account_id.user.email

                        self.session.add_message(
                            message=self.message,
                            response=self.response,
                            email=user_email,
                            engine=engine_map.get(used_engine_val), # Store string label
                            style=self.response_style,
                            created_at=self.created_at if hasattr(self, 'created_at') else timezone.now(),
                            sources=stored_sources,
                        )
                    except Exception as exc:
                        # session persistence failed — don't break the main flow
                        print("Warning: failed to append message to session:", exc)

            except Exception as e:
                if sources:
                    self.status = CeleryStatus.COMPLETED
                    self.response = extractive_answer(
                        sources,
                        self._retrieval_question(),
                        plan["search_queries"],
                    )
                    stored_sources = (
                        [] if is_refusal(self.response) else sources
                    )
                    if self.session:
                        try:
                            email = "unknown"
                            if getattr(self.account_id, "user", None):
                                email = self.account_id.user.email
                            self.session.add_message(
                                message=self.message,
                                response=self.response,
                                email=email,
                                engine=None,
                                style=self.response_style,
                                created_at=self.created_at,
                                sources=stored_sources,
                            )
                        except Exception as session_exc:
                            print(
                                "Warning: failed to append fallback to session:",
                                session_exc,
                            )
                else:
                    self.status = CeleryStatus.FAILED
                    self.response = str(e)

            # final save: only update limited fields
            update_fields = ['status', 'response', 'response_engine']
            if hasattr(self, 'updated_at'):
                update_fields.append('updated_at')
            
            try:
                print(f"DEBUG: About to save AiRequest {self.id} with status {self.status}")
                print(f"DEBUG: Update fields: {update_fields}")
                print(f"DEBUG: Has response: {bool(self.response)}")
                print(f"DEBUG: Response length: {len(self.response) if self.response else 0}")
                
                self.save(update_fields=[f for f in update_fields if hasattr(self, f) or f == 'response'])
                print(f"DEBUG: Successfully saved AiRequest {self.id}")
            except Exception as save_exc:
                print("AiRequest.save failed in handle():", save_exc)
                # Don't re-raise, just log it

    def save(self, **kwargs):
        is_new = self._state.adding

        # First save to get an ID (and allow FK creation)
        super().save(**kwargs)

        # If new and no session, create one (use message as title)
        if is_new and not self.session:
            title_candidate = (self.message or "").strip()[:60]
            if not title_candidate:
                title_candidate = f"new chat {uuid.uuid4().hex[:8]}"

            session = ChatSession.objects.create(
                title=title_candidate,
                account_id=self.account_id
            )

            self.session = session
            # Save only the session FK field to avoid re-saving everything
            super().save(update_fields=['session'])

        # queue background job if newly created
        if is_new:
            try:
                self._queue_job()
            except Exception:
                # if queuing fails, don't break saving; the worker will mark failed later
                pass