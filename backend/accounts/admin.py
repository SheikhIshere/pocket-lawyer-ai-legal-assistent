# location: backend/accounts/admin.py

from django.contrib import admin

# models
from .models import (
    Account,
    AccountAddress,
)


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ('user', 'full_name', 'gender', 'birth_day', 'language', 'status', 'plan',)
    list_filter = ('user', 'gender', 'birth_day', 'language', 'status', 'plan','created_at', 'updated_at')
    search_fields = ('user', 'full_name', 'gender', 'birth_day', 'language', 'status', 'plan',)
    ordering = ('user', 'full_name', 'gender', 'birth_day', 'language', 'status', 'plan',)

@admin.register(AccountAddress)
class AccountAddressAdmin(admin.ModelAdmin):
    list_display = ('account', 'street', 'city', 'state', 'country', 'zip_code',)
    list_filter = ('account', 'street', 'city', 'state', 'country', 'zip_code', 'created_at', 'updated_at')
    search_fields = ('account', 'street', 'city', 'state', 'country', 'zip_code', 'created_at', 'updated_at')
    ordering = ('account', 'street', 'city', 'state', 'country', 'zip_code', 'created_at', 'updated_at')