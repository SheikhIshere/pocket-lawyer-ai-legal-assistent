# location: backend/api_key/tasks.py

from celery import shared_task

@shared_task
def handle_test_api_key(request_id):
    from .models import ApiKey
    ApiKey.objects.get(id=request_id).handle()