from django.contrib.admin.apps import AdminConfig


class PocketOTPAdminConfig(AdminConfig):
    default_site = "users.otp_admin_site.PocketOTPAdminSite"
