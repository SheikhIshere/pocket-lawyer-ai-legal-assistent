# location: backend/chat_bot/tasks.py

from celery import shared_task
import logging
from django.core.exceptions import ObjectDoesNotExist

logger = logging.getLogger(__name__)

"""
when user start chatting with ai this will run in background 
and set a custom title according to the starting of chat
"""
@shared_task(bind=True, max_retries=3)
def handle_ai_session_title_name(self, request_id):
    try:
        from .models import ChatSession
        session = ChatSession.objects.get(id=request_id)
        session.handle()
        logger.info(f"Successfully processed session title for session {request_id}")
    except ObjectDoesNotExist:
        logger.error(f"Session {request_id} not found for title generation")
    except Exception as exc:
        logger.error(f"Error processing session title for {request_id}: {exc}")
        # Retry with exponential backoff
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))

@shared_task(bind=True, max_retries=3)
def handle_ai_request_job(self, request_id):
    try:
        from .models import AiRequest
        ai_request = AiRequest.objects.get(id=request_id)
        ai_request.handle()
        logger.info(f"Successfully processed AI request {request_id}")
    except ObjectDoesNotExist:
        logger.error(f"AI request {request_id} not found")
    except Exception as exc:
        logger.error(f"Error processing AI request {request_id}: {exc}")
        # Retry with exponential backoff
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))

