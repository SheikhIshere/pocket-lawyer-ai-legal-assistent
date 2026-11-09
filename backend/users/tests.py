from unittest.mock import patch

from django.test import TestCase
from rest_framework.test import APIClient

from .models import Otp, User


class RegistrationEmailTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    @patch("users.views.send_otp_email.delay")
    def test_registration_queues_otp_email_and_returns_immediately(self, delay):
        response = self.client.post(
            "/v1/api/users/register/",
            {
                "email": "new-user@example.com",
                "full_name": "New User",
                "password": "Str0ngPass!2026",
                "password2": "Str0ngPass!2026",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        delay.assert_called_once()
        email, subject, message = delay.call_args.args
        self.assertEqual(email, "new-user@example.com")
        self.assertEqual(subject, "Account Activation OTP")
        self.assertIn("Your OTP is:", message)


class ResendOtpTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="resend-user@example.com",
            password="Str0ngPass!2026",
            full_name="Resend User",
        )
        self.old_otp = Otp.objects.create(user=self.user, otp="111111")

    @patch("users.views.send_otp_email.delay")
    def test_login_resend_expires_old_otp_and_queues_new_one(self, delay):
        response = self.client.post(
            "/v1/api/users/login/otp/resend/",
            {"email": self.user.email},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.old_otp.refresh_from_db()
        self.assertTrue(self.old_otp.is_expired)
        new_otp = Otp.objects.filter(user=self.user, is_expired=False).latest("created_at")
        self.assertNotEqual(new_otp.pk, self.old_otp.pk)
        self.assertEqual(len(new_otp.otp), 6)
        delay.assert_called_once()
        email, subject, message = delay.call_args.args
        self.assertEqual(email, self.user.email)
        self.assertEqual(subject, "Account Activation OTP")
        self.assertIn("Your OTP is:", message)
        self.assertEqual(response.json()["user"]["user_id"], self.user.id)

    @patch("users.views.send_otp_email.delay")
    def test_registration_resend_uses_same_working_path(self, delay):
        response = self.client.post(
            "/v1/api/users/register/activate/otp/resend/",
            {"email": self.user.email},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        delay.assert_called_once()
        self.assertEqual(
            Otp.objects.filter(user=self.user, is_expired=False).count(),
            1,
        )

    def test_unknown_email_returns_400_not_500(self):
        response = self.client.post(
            "/v1/api/users/login/otp/resend/",
            {"email": "missing-user@example.com"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
