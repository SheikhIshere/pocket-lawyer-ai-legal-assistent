from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail


@shared_task(bind=True, max_retries=3)
def send_otp_email(self, email, subject, message):
    """Send an OTP email outside the request path."""
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
    except Exception as exc:
        # Retry transient SMTP/network failures without blocking registration.
        raise self.retry(exc=exc, countdown=10 * (2 ** self.request.retries))
