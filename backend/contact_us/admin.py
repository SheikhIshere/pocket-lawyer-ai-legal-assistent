# location: backend/contact_us/admin.py

from django.contrib import admin
from django.contrib.admin import ModelAdmin as M
from .models import ContactUs


@admin.register(ContactUs)
class ContactUsAdmin(M):
    list_display = (
        'full_name', 
        'email', 
        'service_type', 
        'other',
        'subject', 
        'message',
        'summary',
        'is_resolved',        
    )
    ordering = (
        '-created_at',
        'email',
        'is_resolved',
        'summary',
    )
    search_fields = (
        'summary',
        'email',
        'service_type',
        'subject',
        'full_name',
    )
    list_filter = (
        'service_type',
        'priority_level',
        'is_resolved',
        'created_at',
    )
