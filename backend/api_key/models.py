# location: backend/api_key/models.py
# core import
from BASE.base_model import BaseModel
from django.db import models, transaction

# account import
from accounts.models import Account

# base choice
from BASE.base_choice import CeleryStatus, ChatEngine
from BASE.encryption import EncryptedTextField

# prompt
from BASE.base_prompt import test_api_key_prompt as prompt

class ApiKey(BaseModel):
    account_id = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='api_keys')
    api_key = EncryptedTextField(blank=True, help_text="please provide your Gemini API Key only")
    
    # for admin
    is_working = models.BooleanField(default=False)
    total_used = models.IntegerField(default=0)

    # api condition
    # TODO: You need to define with the api what type of model can run
    meta_data = models.JSONField(default=dict, blank=True)

    # worker status
    worker_status = models.CharField(max_length=20, choices=CeleryStatus.choices, default=CeleryStatus.PENDING)

    def __str__(self):
        return f"{self.account_id.user.email}: {self.api_key}"
    
    def _queue_task(self):
        """ A privet method to trigger celery """
        # TODO: add a celery to test the api
        from .tasks import handle_test_api_key
        handle_test_api_key.delay(self.id)

    def handle(self):
        from google import genai
        from google.genai import types

        self.worker_status = CeleryStatus.RUNNING
        self.save(update_fields=['worker_status', 'updated_at'])

        model_status = {}
        any_yes = False

        try:
            client = genai.Client(
                api_key=self.api_key,
                http_options=types.HttpOptions(timeout=60_000),
            )

            model_ids = [label for _, label in ChatEngine.choices]

            for model_id in model_ids:
                try:
                    resp = client.models.generate_content(
                        model=model_id,
                        contents=prompt
                    )
                    text = (getattr(resp, "text", None) or "").strip().lower()

                    if text == "yes":
                        model_status[model_id] = True
                        any_yes = True
                        self.total_used += 1
                    else:
                        model_status[model_id] = False

                except Exception as exc:
                    # One unavailable model must not fail the whole key check.
                    print(f"API key check failed for {model_id}: {exc}")
                    model_status[model_id] = False

            # store results in meta_data
            self.meta_data = {
                "models": model_status
            }

            self.is_working = any_yes
            self.worker_status = (
                CeleryStatus.COMPLETED if any_yes else CeleryStatus.FAILED
            )
            self.save(update_fields=[
                "meta_data", "is_working", "total_used",
                "worker_status", "updated_at",
            ])

        except Exception as exc:
            print(f"API key validation failed: {exc}")
            self.is_working = False
            self.worker_status = CeleryStatus.FAILED
            self.meta_data = {"models": model_status, "error": str(exc)}
            self.save(update_fields=[
                "meta_data", "is_working", "worker_status", "updated_at",
            ])

        return self.meta_data


    def save(self, **kwargs):
        # TODO: BEFORE saving add it into task
        is_new = self._state.adding
        super().save(**kwargs)

        if is_new:
            print(f'{self.api_key}')

            # SUGGESTED by ai donno working or not if you are keep seeing it it's working
            # queue task only after database transaction is committed
            transaction.on_commit(self._queue_task)