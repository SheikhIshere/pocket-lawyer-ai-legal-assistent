# location: backend/contact_us/views.py

# core import
from rest_framework.generics import GenericAPIView as G
from rest_framework import status
from rest_framework.response import Response

# serializer
from .serializers import ContactUsSerializer, ContactUs

# documentation
from drf_spectacular.utils import extend_schema

"""
just posting to backend
user's what they need information
"""
@extend_schema(tags=['contact us'])
class ContactUsView(G):
    serializer_class = ContactUsSerializer
    throttle_scope = 'public-form'
    
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
