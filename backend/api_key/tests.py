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
