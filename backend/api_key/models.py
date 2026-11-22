# location: backend/api_key/models.py
import re

# core import
from BASE.base_model import BaseModel
from django.db import models

import requests

# account import
from accounts.models import Account

# base choice
from BASE.base_choice import CeleryStatus, ChatEngine
from BASE.encryption import EncryptedTextField

# ponytail: the API exposes supportedGenerationMethods but not output modality,
# so non-chat families are excluded by id token. Upgrade to a modality field if
# Google ever adds one.
_NON_CHAT_MODEL = re.compile(
    r"(image|tts|live|transcribe|embedding|robotics|lyria|omni|deep-research|"
    r"antigravity|aqa|computer-use|decision|genie|nano-banana)",
    re.IGNORECASE,
)


def _chat_models(payload):
    """Pick text chat models out of a Gemini ListModels response."""
    if not isinstance(payload, dict):
        return []
    models = payload.get("models")
    if not isinstance(models, list):
        return []

    out = []
    for item in models:
        if not isinstance(item, dict):
            continue
        model_id = (item.get("name") or "").removeprefix("models/")
        methods = item.get("supportedGenerationMethods") or []
        if not model_id or "generateContent" not in methods:
            continue
        if _NON_CHAT_MODEL.search(model_id):
            continue
        out.append({
            "id": model_id,
            "label": item.get("displayName") or model_id,
        })
    return out


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
        try:
            models = _chat_models(response.json())
        except ValueError:
            models = []
        return True, {"models": models}
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
    
