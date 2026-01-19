# location: backend/chat_bot/serializers.py
from pydantic import ValidationError
from rest_framework import serializers
from .models import ChatSession, AiRequest

# choice
from BASE.base_choice import CeleryStatus


class ChatSessionListSerializer(serializers.ModelSerializer):
    """For listing all sessions (sidebar/history list)."""
    class Meta:
        model = ChatSession
        fields = ['id', 'title', 'created_at']

class ChatSessionDetailSerializer(serializers.ModelSerializer):
    """For seeing specific session messages."""
    class Meta:
        model = ChatSession
        fields = ['id', 'title', 'messages', 'status', 'created_at', 'updated_at']

class AiRequestCreateSerializer(serializers.ModelSerializer):
    """For posting a new message."""
    class Meta:
        model = AiRequest
        fields = ['session', 'message', 'response_engine', 'response_style']
        extra_kwargs = {
            'session': {'required': False} # if this field stay null, model.save() creates new one
        }
    
    def validate(self, attrs):
        message = attrs.get("message", "")
        session = attrs.get("session")

        # 1: checking is message is empty or not
        if not message:
            raise serializers.ValidationError("Message is required")
        
        # 2: does this chat have any session or not
        if session:
            # 2: checking is last message is still on process or not
            last_message = (
                    AiRequest.objects.filter(session=session)
                    .order_by("-created_at")
                    .values_list('status', flat=True) # Optimized: only get the status string
                    .first()
                )
            
            if last_message in [CeleryStatus.RUNNING, CeleryStatus.PENDING]:
                raise serializers.ValidationError("Please wait, the AI is still responding to your last message")
            
            # 3: if one session have like 30 message i won't let user post more rather tell to create new session
            if session and session.ai_request_count >= 30:
                raise serializers.ValidationError("You have reached the maximum number of messages for this session. Please create a new session.")

        return attrs


class AiRequestDetailSerializer(serializers.ModelSerializer):
    """For checking the status/response of a specific request."""
    class Meta:
        model = AiRequest
        fields = '__all__'