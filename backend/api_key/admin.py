# location: backend/api_key/admin.py

# core import
from django.contrib import admin

# model import
from .models import ApiKey

@admin.register(ApiKey)
class ApiAdmin(admin.ModelAdmin):
    list_display = (
        'account_id__user__email', 
        'is_working', 
        'total_used',
        'worker_status',
        'created_at',
    )
    search_fields = ('account_id__user__email', 'is_working')
    ordering = ('-created_at','account_id__user__email', 'is_working', 'total_used')
