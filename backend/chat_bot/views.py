# location: backend/chat_bot/views.py

# core import
from rest_framework import mixins, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.conf import settings
from django.db import transaction
from django.utils import timezone

# local import
from accounts.models import Account
from api_key.models import ApiKey
from .models import ChatSession, AiRequest
from .serializers import (
    ChatSessionSerializer,
    ChatSessionListSerializer,
    AiRequestCreateSerializer,
    AiRequestListSerializer,
)

# documentation
from drf_spectacular.utils import extend_schema

# permission import
from rest_framework.permissions import IsAuthenticated
from BASE.base_permission import IsVerifiedUser

@extend_schema(tags=['Chat Bot'])
class ChatSessionViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """
    Sessions: allow POST (create), GET (list) and GET (retrieve).
    Also provides POST /sessions/{id}/send/ to create an AiRequest tied to this session.
    """
    queryset = ChatSession.objects.all().order_by("-updated_at")
    serializer_class = ChatSessionSerializer
    permission_classes = (IsAuthenticated, IsVerifiedUser)

    def get_serializer_class(self):
        if self.action == "list":
            return ChatSessionListSerializer
        return ChatSessionSerializer

    def get_throttles(self):
        if self.action == "send":
            self.throttle_scope = 'chat-send'
        return super().get_throttles()

    def get_queryset(self):
        """
        Filter sessions to only show those belonging to the current user.
        """
        user = self.request.user
        account_id = Account.objects.get(user=user)
        return ChatSession.objects.filter(account_id=account_id).order_by("-updated_at")

    def create(self, request, *args, **kwargs):
        """
        POST /sessions/ -> create a new session.
        Title optional in request.data; default to "New Chat".
        """
        title = request.data.get("title") or "New Chat"

        user = self.request.user
        account_id = Account.objects.get(user=user)

        session = ChatSession.objects.create(title=title, account_id=account_id)
        serializer = self.get_serializer(session)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def send(self, request, pk=None):
        """
        POST /sessions/{id}/send/ -> create AiRequest tied to this session.
        Uses AiRequestCreateSerializer for validation (blocks if last request is PENDING/RUNNING).
        """
        session = self.get_object()

        data = {
            "session": session.id,
            "message": request.data.get("message", ""),
        }

        # The frontend sends response_style/response_engine while the
        # API docs also allow style/engine. Accept both spellings.
        style = request.data.get("style") or request.data.get("response_style")
        engine = request.data.get("engine") or request.data.get("response_engine")
        if style:
            data["response_style"] = style
        if engine not in (None, ""):
            data["response_engine"] = engine

        with transaction.atomic():
            # Lock the account row so two concurrent sends cannot both pass
            # the daily-limit check at 49/50.
            Account.objects.select_for_update().get(pk=session.account_id_id)

            has_key = ApiKey.objects.filter(
                account_id=session.account_id,
                is_working=True,
            ).exists()

            if not has_key:
                used_today = AiRequest.objects.filter(
                    account_id=session.account_id,
                    created_at__date=timezone.localdate(),
                ).count()

                if used_today >= settings.OMNIROUTE_DAILY_LIMIT:
                    return Response(
                        {
                            "error": (
                                f"Daily free limit reached "
                                f"({settings.OMNIROUTE_DAILY_LIMIT} messages). "
                                "Try again tomorrow or add your own API key."
                            )
                        },
                        status=status.HTTP_429_TOO_MANY_REQUESTS,
                    )

            serializer = AiRequestCreateSerializer(data=data, context={'request': request})
            serializer.is_valid(raise_exception=True)

            # Set account_id from session's account_id
            ai_request = serializer.save(account_id=session.account_id)

        out = AiRequestCreateSerializer(ai_request).data
        return Response(out, status=status.HTTP_201_CREATED)


@extend_schema(tags=['Chat Bot'])
class AiRequestViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """
    AiRequest: only GET endpoints (list and retrieve).
    Creation of requests should go through sessions/{id}/send/.
    """
    queryset = AiRequest.objects.all().order_by("-created_at")
    serializer_class = AiRequestCreateSerializer
    permission_classes = (IsAuthenticated, IsVerifiedUser)

    def get_serializer_class(self):
        if self.action == "list":
            return AiRequestListSerializer
        return AiRequestCreateSerializer

    def get_queryset(self):
        """
        Filter AI requests to only show those belonging to the current user's sessions.
        """
        user = self.request.user
        account_id = Account.objects.get(user=user)
        return AiRequest.objects.filter(session__account_id=account_id).order_by("-created_at")
