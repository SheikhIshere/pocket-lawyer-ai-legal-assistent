from django.contrib import admin
from .models import ChatSession, AiRequest


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "account_id",
        "title",
        "status",
        "created_at",
        "updated_at",
    )
    list_filter = ("status", "created_at")
    search_fields = ("title", "account_id__user__email")
    readonly_fields = ("id", "created_at", "updated_at")
    ordering = ("-created_at",)

    fieldsets = (
        ("Basic Info", {
            "fields": ("id", "account_id", "title", "status")
        }),
        ("Conversation", {
            "fields": ("messages",),
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
        }),
    )


@admin.register(AiRequest)
class AiRequestAdmin(admin.ModelAdmin):
    list_display = (
        # "id",
        "account_id",
        "session",
        "status",
        "response_engine",
        "created_at",
    )
    list_filter = ("status", "response_engine", "created_at")
    search_fields = ("message", "response", "account_id__user__email")
    readonly_fields = ("id", "created_at", "updated_at")
    ordering = ("-created_at",)

    fieldsets = (
        ("Request Info", {
            "fields": ("id", "account_id", "session", "status")
        }),
        ("Prompt & Response", {
            "fields": ("message", "response"),
        }),
        ("AI Settings", {
            "fields": ("response_engine", "response_style"),
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
        }),
    )