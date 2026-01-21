# location: backend/contact_us/serializers.py

# core import
from dataclasses import field
from pyexpat import model
from rest_framework import serializers

# model import
from .models import ContactUs

# choice
from BASE.base_choice import ServiceType

"""
main serializer 
to take user input
"""
class ContactUsSerializer(serializers.ModelSerializer):
    class Meta: 
        model = ContactUs
        fields = (
            'full_name', 
            'email', 
            'service_type', 
            'other', 
            'priority_level', 
            'subject', 
            'message'
        )
    
    def validate(self, attrs):
        service_type = attrs['service_type']
        other = attrs['other']

        if service_type == ServiceType.OTHER and not other:
            raise serializers.ValidationError({'blank field': 'This field may not be blank.'})
            
        return attrs