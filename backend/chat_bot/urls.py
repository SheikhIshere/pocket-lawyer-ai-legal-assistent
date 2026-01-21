# location: backend/chat_bot/urls.py

from rest_framework.routers import DefaultRouter
from .views import ChatSessionViewSet, AiRequestViewSet

router = DefaultRouter()
router.register(r'sessions', ChatSessionViewSet, basename='chat-session')
router.register(r'requests', AiRequestViewSet, basename='ai-request')

urlpatterns = router.urls