# location: backend/chat_bot/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChatSessionViewSet, AiRequestViewSet

router = DefaultRouter()
router.register(r'sessions', ChatSessionViewSet, basename='chat-session')
router.register(r'chat', AiRequestViewSet, basename='ai-request')

urlpatterns = [
    path('', include(router.urls)),
]