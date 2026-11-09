"""
users/admin.py
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model

from users.models import Otp
User = get_user_model()


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # Display settings
    list_display = ('email', 'full_name', 'is_verified', 'is_staff', 'is_superuser', 'created_at')
    list_filter = ( 'is_verified', 'is_staff', 'is_superuser')
    search_fields = ('email', 'full_name',)
    ordering = ('email', 'full_name',)
    
    # Fields configuration for viewing/editing users
    fieldsets = (
        (None, {'fields': ('email', 'full_name', 'password')}),
        ('Permissions', {'fields': ('is_active','is_verified', 'is_staff', 'is_superuser')}),
        ('Dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    
    # Fields configuration for creating users
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name',  'password1', 'password2', 'is_active','is_verified', 'is_staff', 'is_superuser'),
        }),
    )
    
    # Read-only fields (can't be edited in admin)
    readonly_fields = ('created_at', 'updated_at', 'last_login')





@admin.register(Otp)
class OtpAdmin(admin.ModelAdmin):
    list_display = ('user', 'is_expired', 'created_at')
    list_filter = ('user', 'is_expired')
    search_fields = ('user__email',)
    ordering = ('-created_at',)