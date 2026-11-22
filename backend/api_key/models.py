# location: backend/api_key/models.py
# core import
from BASE.base_model import BaseModel
from django.db import models

import requests

# account import
from accounts.models import Account

# base choice
from BASE.base_choice import CeleryStatus, ChatEngine
from BASE.encryption import EncryptedTextField


def validate_key(api_key, timeout=8):
    """One read-only models.list call — the provider's built-in smoke test."""
    try:
        response = requests.get(
            "https://generativelanguage.googleapis.com/v1beta/models",
            headers={"x-goog-api-key": api_key},
            timeout=timeout,
        )
    except Exception as exc:
        return False, {"error": type(exc).__name__}
    if response.status_code == 200:
        return True, {"models": "ok"}
    try:
        status = response.json().get("error", {}).get("status", "ERROR")
    except ValueError:
        status = f"HTTP {response.status_code}"
    return False, {"error": status}


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
        return f"{self.account_id.user.email}: ****"
    
