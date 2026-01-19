# location: backend/chat_bot/models.py

# core import
from django.db import models

# ai engin
from google import genai

# id
import uuid

# model
from accounts.models import Account
from api_key.models import ApiKey

# base import
from BASE.base_model import BaseModel
from BASE.base_prompt import generate_title_prompt, get_legal_prompt
from BASE.base_choice import (
    CeleryStatus, 
    ChatEngine,
    ModelStyle,
)
# utils
from django.utils import timezone
import re



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
            # Fetch an ApiKey for this account
            try:
                key = ApiKey.objects.get(account_id=self.account_id)
            except ApiKey.DoesNotExist:
                raise RuntimeError("No API key configured for this account")

            client = genai.Client(api_key=key.api_key)
            model_name = ChatEngine.GEMMA_3_27B.label  # use the label string for the model

            conversation_text = self._conversation_text() or "No conversation text available."
            prompt = generate_title_prompt(conversation_text)

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

    def add_message(self, message: str, response: str = "", email: str = None, engine: str = None, style: str = None, created_at=None):
        """Add a message to the session history and queue AI title generation once.

        Parameters:
            message: user message text (required)
            response: assistant response text (optional)
            email: sender email (optional, falls back to account.user.email)
            engine: model identifier used (optional)
            style: response style used (optional)
            created_at: datetime (optional)
        """
        if created_at is None:
            created_at = timezone.now()

        # ensure messages is a list
        if not isinstance(self.messages, list):
            self.messages = []

        email = email or (self.account_id.user.email if getattr(self.account_id, 'user', None) else "unknown")

        is_first_message = len(self.messages) == 0
        next_count = len(self.messages) + 1

        entry = {
            "email": email,
            "count": next_count,
            "message": message,
            "response": response,
            "model": engine,
            "style": style,
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

    def handle(self):
            """Core logic executed by the Celery worker to call the AI provider."""
            self.status = CeleryStatus.RUNNING
            self.save(update_fields=['status', 'updated_at'] if hasattr(self, 'updated_at') else ['status'])

            try:
                # 1. Get a working API key for this account
                key = ApiKey.objects.filter(account_id=self.account_id, is_working=True).first()
                if not key:
                    raise RuntimeError("No working API key configured for this account")

                # 2. Init client (defensive)
                try:
                    client = genai.Client(api_key=key.api_key)
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

                # 4. Prepare Prompt (Persona + History)
                history = self.session._conversation_text() if self.session else ""
                
                # Get specific system instruction based on selected Style (Supportive, Casual, Deep)
                base_instruction = get_legal_prompt(self.response_style, self.message)
                
                prompt = (
                    f"{base_instruction}\n\n"
                    f"--- CONVERSATION HISTORY ---\n"
                    f"{history}\n"
                    f"----------------------------\n"
                    f"User Query: {self.message}\n"
                    f"Response:"
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
                            created_at=self.created_at if hasattr(self, 'created_at') else timezone.now()
                        )
                    except Exception as exc:
                        # session persistence failed — don't break the main flow
                        print("Warning: failed to append message to session:", exc)

            except Exception as e:
                self.status = CeleryStatus.FAILED
                # store a concise error string for debugging
                self.response = str(e)

            # final save: only update limited fields
            update_fields = ['status', 'response', 'response_engine']
            if hasattr(self, 'updated_at'):
                update_fields.append('updated_at')
            try:
                self.save(update_fields=[f for f in update_fields if hasattr(self, f) or f == 'response'])
            except Exception as save_exc:
                print("AiRequest.save failed in handle():", save_exc)

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




