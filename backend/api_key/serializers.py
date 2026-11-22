# location: backend/api_key/serializers.py
# core import
import time

from rest_framework import serializers

from BASE.base_choice import CeleryStatus
from .models import ApiKey, validate_key
from accounts.models import Account

# ponytail: 6h model-list cache; refresh sooner if a key's catalog changes often.
MODEL_CACHE_TTL = 6 * 60 * 60


"""
taking api key from user and testing it
"""
class ApiKeySerializers(serializers.ModelSerializer):
    models = serializers.SerializerMethodField()

    class Meta:
        model = ApiKey
        exclude = [
            'updated_at',
            'account_id',
        ]
        read_only_fields = ['created_at', 'is_working', 'total_used', 'worker_status', 'meta_data']
        extra_kwargs = {
            'api_key': {'write_only': True},
        }

    def get_models(self, obj):
        data = obj.meta_data or {}
        cached = data.get("models")
        fetched_at = data.get("models_fetched_at") or 0
        if isinstance(cached, list):
            if not fetched_at or time.time() - fetched_at < MODEL_CACHE_TTL:
                return cached
        if not obj.is_working:
            return cached if isinstance(cached, list) else []

        try:
            ok, meta = validate_key(obj.api_key)
        except Exception:
            return cached if isinstance(cached, list) else []
        if not ok:
            return cached if isinstance(cached, list) else []
        obj.meta_data = {**data, **meta, "models_fetched_at": time.time()}
        obj.save(update_fields=["meta_data"])
        return obj.meta_data.get("models", [])

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # provider errors live in meta_data; keep it out of API responses
        data.pop('meta_data', None)
        return data

    def validate(self, attrs):
        key = attrs.get('api_key')  # safe access
        if not key:
            raise serializers.ValidationError({
                "api_key": "This field is required."
            })

        user = self.context['request'].user

        try:
            account = Account.objects.get(user=user)
        except Account.DoesNotExist:
            raise serializers.ValidationError("Account doesn't exist")

        attrs['account'] = account
        return attrs

    def create(self, validated_data):
        from django.db import transaction

        account = validated_data.pop('account')
        is_working, meta = validate_key(validated_data.get('api_key', ''))
        # Lock the account row so two concurrent creates cannot both pass the cap.
        with transaction.atomic():
            Account.objects.select_for_update().get(pk=account.pk)
            if ApiKey.objects.filter(account_id=account).count() >= 3:
                raise serializers.ValidationError(
                    "An account cannot contain more than 3 API keys"
                )
            return ApiKey.objects.create(
                account_id=account,
                is_working=is_working,
                worker_status=(
                    CeleryStatus.COMPLETED if is_working else CeleryStatus.FAILED
                ),
                meta_data={**meta, "models_fetched_at": time.time()},
                **validated_data,
            )
