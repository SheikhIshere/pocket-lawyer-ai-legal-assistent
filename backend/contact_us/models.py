# location: backend/contact_us

# core import
from django.db import models

# base import
from BASE.base_model import BaseModel

# choice import
from BASE.base_choice import ServiceType, PriorityLevel

"""
this is for contact page where 
anyone can send message to
admin page
"""
class ContactUs(BaseModel):
    full_name = models.CharField(max_length=100)
    email = models.EmailField()
    service_type = models.CharField(
        max_length=50,
        choices=ServiceType.choices,
        default=ServiceType.GENERAL_INQUIRY
    )
    other = models.CharField(max_length=100, blank=True)
    priority_level = models.CharField(
        max_length=20,
        choices=PriorityLevel.choices,
        default=PriorityLevel.NORMAL
    )
    subject = models.CharField(max_length=255)
    message = models.CharField(max_length=1000)

    # for admin
    # TODO: integrate ai to make a quick summary to
            # understand is it spam or genuine
    summary = models.TextField(blank=True)
    is_resolved = models.BooleanField(default=False)

    class Meta:
        db_table = "contact_us"
        verbose_name = "Contact Us"
        verbose_name_plural = "Contact Us"
    
    def __str__(self):
        return f"{self.email} - {self.priority_level} - {self.subject}"