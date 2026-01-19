# location: backend/chat_bot/views.py

from rest_framework import viewsets, mixins
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema

# Models and Serializers
from .models import ChatSession, AiRequest
from .serializers import (
    ChatSessionListSerializer, 
    ChatSessionDetailSerializer, 
    AiRequestCreateSerializer,
    AiRequestDetailSerializer
)

# permissions
from rest_framework.permissions import IsAuthenticated
from BASE.base_permission import IsVerifiedUser


@extend_schema(
    tags=["Chat Bot"],
)
class ChatSessionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Handles viewing chat history. 
    Users can see their list of sessions or open a specific session to see messages.
    """
    permission_classes = [IsAuthenticated, IsVerifiedUser]

    def get_queryset(self):
        # Only return sessions belonging to the logged-in user
        return ChatSession.objects.filter(
            account_id__user=self.request.user
        ).order_by('-created_at')

    def get_serializer_class(self):
        if self.action == 'list':
            return ChatSessionListSerializer
        return ChatSessionDetailSerializer


@extend_schema(
    tags=["Chat Bot"],
)
class AiRequestViewSet(mixins.CreateModelMixin, 
                       mixins.RetrieveModelMixin, 
                       viewsets.GenericViewSet):
    """
    Handles posting new messages and checking their processing status.
    """
    permission_classes = [IsAuthenticated, IsVerifiedUser]

    def get_queryset(self):
        # Only return requests belonging to the logged-in user
        return AiRequest.objects.filter(
            account_id__user=self.request.user
        ).order_by('-created_at')

    def get_serializer_class(self):
        if self.action == 'create':
            return AiRequestCreateSerializer
        return AiRequestDetailSerializer

    def perform_create(self, serializer):
        # 1. Grab the Account instance related to the logged-in User
        user_account = getattr(self.request.user, 'account', None)
        
        # 2. Validate that the user has an associated account
        if user_account is None:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("User account not found")
        
        # 3. Save the request linked to this account
        # The model's save() logic will handle session creation and Celery queuing
        serializer.save(account_id=user_account)

    def create(self, request, *args, **kwargs):
        """
        Override create to return the full detail (including status) 
        immediately after the user posts.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        
        # Return the DetailSerializer so the frontend gets the ID to poll status
        full_data = AiRequestDetailSerializer(instance)
        return Response(full_data.data, status=status.HTTP_201_CREATED)