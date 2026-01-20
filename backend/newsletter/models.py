# location: backend/newsletter/models.py

# core
from django.db import models

# base import
from BASE.base_model import BaseModel



"""
mini: description
this is a news letter section 
i personally have subscribed once in my life span it's very
irritating to me but for business it's a way to collect lead 
"""
class NewsLetter(BaseModel):
    email = models.EmailField()

    # for admin
    is_subscribed = models.BooleanField(default=True) # this is just for if any one want to unsubscribe

    def __str__(self):
        return f"{self.email} - subscribed: {self.is_subscribed}"
