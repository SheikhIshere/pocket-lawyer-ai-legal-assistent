from django_otp.admin import OTPAdminSite


class PocketOTPAdminSite(OTPAdminSite):
    def __init__(self):
        super().__init__("admin")
