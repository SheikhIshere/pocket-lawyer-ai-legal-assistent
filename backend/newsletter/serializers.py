# location: backend/newsletter/serializers.py
# core import
from dataclasses import field
from rest_framework import serializers

# model import
from .models import NewsLetter

"""
i will be taking email only
"""
class NewsLetterSerializers(serializers.ModelSerializer):
    class Meta:
        model = NewsLetter
        fields = ['email']

        