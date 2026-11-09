# location: backend/api_key/serializers.py
# core import
from rest_framework import serializers

# model import
from .models import ApiKey
from accounts.models import Account


"""
taking api key from user and testing it
"""
class ApiKeySerializers(serializers.ModelSerializer):
    class Meta:
        model = ApiKey
        exclude = [
            'updated_at',
            'account_id',
        ]
        read_only_fields = ['created_at', 'is_working', 'total_used', 'worker_status', 'meta_data']
        extra_kwargs = {
            'api_key': {'write_only': True},
            'meta_data': {'write_only': True},
        }

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
        # Lock the account row so two concurrent creates cannot both pass the cap.
        with transaction.atomic():
            Account.objects.select_for_update().get(pk=account.pk)
            if ApiKey.objects.filter(account_id=account).count() >= 3:
                raise serializers.ValidationError(
                    "An account cannot contain more than 3 API keys"
                )
            return ApiKey.objects.create(
                account_id=account,
                **validated_data
            )
