from unittest.mock import patch

from axes.models import AccessAttempt
from django.core.cache import cache
from django.test import TestCase
from django_otp.oath import totp
from django_otp.plugins.otp_totp.models import TOTPDevice
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
        # account enumeration removed: uniform body, no user identifiers
        self.assertNotIn("user", response.json())

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

    @patch("users.views.send_otp_email.delay")
    def test_unknown_email_returns_uniform_200(self, delay):
        response = self.client.post(
            "/v1/api/users/login/otp/resend/",
            {"email": "missing-user@example.com"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertNotIn("user", response.json())
        delay.assert_not_called()


class LoginOtpLockoutTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="lockout-user@example.com",
            password="Str0ngPass!2026",
            full_name="Lockout User",
        )

    def test_five_wrong_otps_lock_the_account(self):
        Otp.objects.create(user=self.user, otp="222222")
        for _ in range(5):
            response = self.client.post(
                "/v1/api/users/login/otp/verify/",
                {"email": self.user.email, "otp": "000000"},
                format="json",
            )
            self.assertEqual(response.status_code, 400)

        response = self.client.post(
            "/v1/api/users/login/otp/verify/",
            {"email": self.user.email, "otp": "222222"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            Otp.objects.filter(user=self.user, is_expired=False).count(), 0
        )


class PasswordResetTokenTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="reset-user@example.com",
            password="Str0ngPass!2026",
            full_name="Reset User",
        )
        self.user.is_verified = True
        self.user.save()

    def test_reset_token_is_single_purpose_and_confirm_changes_password(self):
        Otp.objects.create(user=self.user, otp="333333")
        verified = self.client.post(
            "/v1/api/users/forget-password/otp/verify/",
            {"email": self.user.email, "otp": "333333"},
            format="json",
        )
        self.assertEqual(verified.status_code, 200)
        reset_token = verified.json()["access_token"]
        # opaque token, not a JWT bearer
        self.assertNotIn(".", reset_token)

        reset = self.client.post(
            "/v1/api/users/forget-password/confirm/",
            {
                "email": self.user.email,
                "new_password": "N3wStr0ngPass!2026",
                "confirm_password": "N3wStr0ngPass!2026",
            },
            format="json",
            HTTP_AUTHORIZATION=f"Bearer {reset_token}",
        )
        self.assertEqual(reset.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("N3wStr0ngPass!2026"))

        reuse = self.client.post(
            "/v1/api/users/forget-password/confirm/",
            {
                "email": self.user.email,
                "new_password": "An0therStr0ng!2026",
                "confirm_password": "An0therStr0ng!2026",
            },
            format="json",
            HTTP_AUTHORIZATION=f"Bearer {reset_token}",
        )
        self.assertEqual(reuse.status_code, 400)


class AdminLockoutTests(TestCase):
    def setUp(self):
        AccessAttempt.objects.all().delete()
        self.user = User.objects.create_user(
            email="admin-lockout@example.com",
            password="Str0ngPass!2026",
            full_name="Admin Lockout",
        )
        self.user.is_staff = True
        self.user.is_superuser = True
        self.user.is_verified = True
        self.user.save()

    def test_fifth_wrong_admin_login_is_locked(self):
        statuses = []
        for index in range(5):
            response = self.client.post(
                "/admin/login/",
                {
                    "username": self.user.email,
                    "password": f"wrong-{index}",
                    "next": "/admin/",
                },
            )
            statuses.append(response.status_code)
        self.assertEqual(statuses[-1], 429)


class AdminOTPTests(TestCase):
    def setUp(self):
        AccessAttempt.objects.all().delete()
        self.user = User.objects.create_user(
            email="admin-otp@example.com",
            password="Str0ngPass!2026",
            full_name="Admin OTP",
        )
        self.user.is_staff = True
        self.user.is_superuser = True
        self.user.is_verified = True
        self.user.save()
        self.device = TOTPDevice.objects.create(
            user=self.user,
            name="default",
            confirmed=True,
        )

    def test_admin_login_requires_totp(self):
        response = self.client.post(
            "/admin/login/",
            {
                "username": self.user.email,
                "password": "Str0ngPass!2026",
                "next": "/admin/",
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "OTP Token")

        token = totp(
            self.device.bin_key,
            step=self.device.step,
            t0=self.device.t0,
            digits=self.device.digits,
        )
        response = self.client.post(
            "/admin/login/",
            {
                "username": self.user.email,
                "password": "Str0ngPass!2026",
                "otp_device": self.device.persistent_id,
                "otp_token": str(token),
                "next": "/admin/",
            },
        )
        self.assertEqual(response.status_code, 302)


class RegistrationThrottleTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()

    def test_fourth_registration_is_throttled(self):
        statuses = []
        for index in range(4):
            response = self.client.post(
                "/v1/api/users/register/",
                {
                    "email": f"invalid-{index}",
                    "full_name": "Throttle",
                    "password": "x",
                    "password2": "x",
                },
                format="json",
            )
            statuses.append(response.status_code)
        self.assertEqual(statuses[-1], 429)


class OtpEnumerationTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="enum-user@example.com",
            password="Str0ngPass!2026",
            full_name="Enum User",
        )
        self.user.is_verified = True
        self.user.save()
        Otp.objects.create(user=self.user, otp="123456")

    def test_unknown_email_and_wrong_otp_have_same_response(self):
        unknown = self.client.post(
            "/v1/api/users/login/otp/verify/",
            {"email": "missing-user@example.com", "otp": "000000"},
            format="json",
        )
        wrong = self.client.post(
            "/v1/api/users/login/otp/verify/",
            {"email": self.user.email, "otp": "000000"},
            format="json",
        )
        self.assertEqual(unknown.status_code, wrong.status_code)
        self.assertEqual(unknown.json(), wrong.json())

    @patch("users.views.send_otp_email.delay")
    def test_resend_known_and_unknown_have_same_response(self, delay):
        known = self.client.post(
            "/v1/api/users/login/otp/resend/",
            {"email": self.user.email},
            format="json",
        )
        unknown = self.client.post(
            "/v1/api/users/login/otp/resend/",
            {"email": "missing-user@example.com"},
            format="json",
        )
        self.assertEqual(known.status_code, unknown.status_code)
        self.assertEqual(known.json(), unknown.json())


class OtpReplayTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="replay-user@example.com",
            password="Str0ngPass!2026",
            full_name="Replay User",
        )
        self.user.is_verified = True
        self.user.save()
        Otp.objects.create(user=self.user, otp="123456")

    def test_otp_cannot_be_used_twice(self):
        first = self.client.post(
            "/v1/api/users/login/otp/verify/",
            {"email": self.user.email, "otp": "123456"},
            format="json",
        )
        self.assertEqual(first.status_code, 200)

        second = self.client.post(
            "/v1/api/users/login/otp/verify/",
            {"email": self.user.email, "otp": "123456"},
            format="json",
        )
        self.assertEqual(second.status_code, 400)
        self.assertEqual(
            second.json(),
            {"error": ["Invalid or expired OTP."]},
        )
