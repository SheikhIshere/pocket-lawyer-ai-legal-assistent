# location: backend/accounts/serializers.py

from rest_framework import serializers
from .models import Account, AccountAddress

# show own profile

class AccountSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Account
        exclude = ('user', 'status', 'credit')  # Include plan, exclude status and credit
        read_only_fields = ('created_at', 'updated_at', 'plan')
    
    # keeping data when updating account
    def update(self, instance, validated_data):
        instance = super().update(instance, validated_data)
        return instance


class AccountAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountAddress
        exclude = ('account',)
        read_only_fields = ('created_at', 'updated_at')
    
    # keeping data when updating account address
    def update(self, instance, validated_data):
        instance = super().update(instance, validated_data)
        return instance