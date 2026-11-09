# location: backend/api_key/tasks.py

from celery import shared_task


@shared_task(bind=True, max_retries=3)
def handle_test_api_key(self, request_id):
    from .models import ApiKey

    try:
        ApiKey.objects.get(id=request_id).handle()
    except ApiKey.DoesNotExist:
        # A stale or forged id must not crash the worker.
        return None
