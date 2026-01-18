# location: backend/chat_bot/task.py

from celery import shared_task

"""
when user start chatting with ai this will run in background 
and set a custom title according to the starting of chat
"""
@shared_task
def handle_ai_session_title_name(request_id):
    from .models import ChatSession
    ChatSession.objects.get(id=request_id).handle()

@shared_task
def handle_ai_request_job(request_id):
    from .models import AiRequest
    AiRequest.objects.get(id=request_id).handle()

