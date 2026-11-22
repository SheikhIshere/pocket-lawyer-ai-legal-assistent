import time
from unittest.mock import Mock, patch

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from accounts.models import Account
from api_key.models import ApiKey


class ApiKeyValidationTests(TestCase):
    def setUp(self):
        user = get_user_model().objects.create_user(
            email="key-test@example.test", password="x"
        )
        user.is_verified = True
        user.save(update_fields=["is_verified"])
        self.account = Account.objects.create(user=user)
        self.client = APIClient()
        self.client.force_authenticate(user=user)

    def _create(self, key="test-key"):
        return self.client.post(
            reverse("api-key-list-create"), {"api_key": key}, format="json"
        )

    def test_valid_key_is_saved_completed(self):
        with patch("api_key.models.requests.get") as get:
            get.return_value = Mock(status_code=200)
            response = self._create()
        self.assertEqual(response.status_code, 201)
        key = ApiKey.objects.get(account_id=self.account)
        self.assertTrue(key.is_working)
        self.assertEqual(key.worker_status, "COMPLETED")

    def test_invalid_key_is_saved_failed(self):
        with patch("api_key.models.requests.get") as get:
            get.return_value = Mock(
                status_code=400,
                json=lambda: {"error": {"status": "INVALID_ARGUMENT"}},
            )
            response = self._create()
        self.assertEqual(response.status_code, 201)
        key = ApiKey.objects.get(account_id=self.account)
        self.assertFalse(key.is_working)
        self.assertEqual(key.worker_status, "FAILED")

    def test_timeout_is_saved_failed(self):
        import requests as http

        with patch("api_key.models.requests.get", side_effect=http.Timeout):
            response = self._create()
        self.assertEqual(response.status_code, 201)
        key = ApiKey.objects.get(account_id=self.account)
        self.assertEqual(key.worker_status, "FAILED")
        self.assertNotEqual(key.worker_status, "RUNNING")

    def test_valid_key_stores_only_chat_models(self):
        payload = {
            "models": [
                {
                    "name": "models/gemini-flash-latest",
                    "displayName": "Gemini Flash Latest",
                    "supportedGenerationMethods": ["generateContent", "countTokens"],
                },
                {
                    "name": "models/gemini-embedding-001",
                    "displayName": "Gemini Embedding 001",
                    "supportedGenerationMethods": ["embedContent"],
                },
                {
                    "name": "models/gemini-2.5-flash-image",
                    "displayName": "Nano Banana",
                    "supportedGenerationMethods": ["generateContent"],
                },
            ]
        }
        with patch("api_key.models.requests.get") as get:
            get.return_value = Mock(status_code=200, json=lambda: payload)
            response = self._create()
        self.assertEqual(response.status_code, 201)
        self.assertEqual(
            response.data["models"],
            [{"id": "gemini-flash-latest", "label": "Gemini Flash Latest"}],
        )
        self.assertNotIn("meta_data", response.data)

    def test_models_are_served_from_cache_without_refresh(self):
        ApiKey.objects.create(
            account_id=self.account,
            api_key="test-key",
            is_working=True,
            worker_status="COMPLETED",
            meta_data={
                "models": [{"id": "gemini-3.8-flash", "label": "Gemini 3.8 Flash"}],
                "models_fetched_at": time.time(),
            },
        )
        with patch("api_key.serializers.validate_key") as validate:
            response = self.client.get(reverse("api-key-list-create"))
        validate.assert_not_called()
        self.assertEqual(
            response.data[0]["models"],
            [{"id": "gemini-3.8-flash", "label": "Gemini 3.8 Flash"}],
        )
        self.assertNotIn("meta_data", response.data[0])

    def test_legacy_key_refreshes_models_once(self):
        key = ApiKey.objects.create(
            account_id=self.account,
            api_key="test-key",
            is_working=True,
            worker_status="COMPLETED",
            meta_data={"models": "ok"},
        )
        with patch(
            "api_key.serializers.validate_key",
            return_value=(True, {"models": [{"id": "gemini-flash-latest", "label": "Gemini Flash Latest"}]}),
        ) as validate:
            response = self.client.get(reverse("api-key-list-create"))
        validate.assert_called_once()
        self.assertEqual(
            response.data[0]["models"],
            [{"id": "gemini-flash-latest", "label": "Gemini Flash Latest"}],
        )
        key.refresh_from_db()
        self.assertEqual(
            key.meta_data["models"],
            [{"id": "gemini-flash-latest", "label": "Gemini Flash Latest"}],
        )
        self.assertIn("models_fetched_at", key.meta_data)
