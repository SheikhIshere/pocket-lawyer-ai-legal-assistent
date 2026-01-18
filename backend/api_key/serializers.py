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
            'total_used',
            'worker_status',
            'meta_data'
        ]
        read_only_fields = ['created_at', 'is_working']

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

        if ApiKey.objects.filter(account_id=account).count() >= 3:
            raise serializers.ValidationError(
                "An account cannot contain more than 3 API keys"
            )

        attrs['account'] = account
        return attrs

    def create(self, validated_data):
        account = validated_data.pop('account')
        return ApiKey.objects.create(
            account_id=account,
            **validated_data
        )
