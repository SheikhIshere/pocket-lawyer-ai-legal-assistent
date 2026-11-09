# location: backend/chat_bot/serializers.py
from pydantic import ValidationError
from rest_framework import serializers
from .models import ChatSession, AiRequest, platform_ai_available
from api_key.models import ApiKey
# choice
from BASE.base_choice import CeleryStatus


class ChatSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatSession
        fields = [
            "id",
            "title",
            "messages",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["messages", "created_at", "updated_at"]



class ChatSessionListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatSession
        fields = [
            "id",
            "title",
            "created_at",
            "updated_at",
        ]


class AiRequestListSerializer(serializers.ModelSerializer):
    class Meta:
        model = AiRequest
        fields = ["id", "session", "status", "created_at"]


class AiRequestCreateSerializer(serializers.ModelSerializer):
    message = serializers.CharField(max_length=4000)
    class Meta:
        model = AiRequest
        fields = [
            "id",
            "session",
            "message",
            "status",
            "response_engine",
            "response_style",
            "response",            
            "created_at",
        ]
        read_only_fields = ["status", "response", "created_at"]

    def validate(self, attrs):        
        message = attrs.get("message", "")
        session = attrs.get("session")
        user = self.context.get("request").user

        # checking is it user not not
        if not user:
            raise serializers.ValidationError(
                {"error": "User not found"}
            )

        # checking do user have a active api key or not
        has_key = ApiKey.objects.filter(
            account_id__user=user,
            is_working=True,
        ).exists()

        if not has_key and not platform_ai_available():
            raise serializers.ValidationError(
                {"error": "No working API key and platform fallback is unavailable."}
            )

        # Message validation
        if not message or not message.strip():
            raise serializers.ValidationError(
                {"message": "Message cannot be empty."}
            )

        # 3️⃣ BLOCK if last request is still running or pending
        last_request = (
            AiRequest.objects
            .filter(session=session)
            .order_by("-created_at")
            .first()
        )

        if last_request and last_request.status in (
            CeleryStatus.PENDING,
            CeleryStatus.RUNNING,
        ):
            raise serializers.ValidationError(
                "Please wait for the previous response to complete."
            )

        return attrs
