# location: backend/newsletter/views.py

# core 
from rest_framework import (
    generics,
    permissions
)

# serializers
from .serializers import NewsLetterSerializers

# documentation
from drf_spectacular.utils import extend_schema

"""
just taking input of user
will use it next time to 
do marketing
"""
@extend_schema(
    tags=['NewsLetter'],
)
class NewsLetterView(generics.CreateAPIView):
    serializer_class = NewsLetterSerializers
    permission_classes = (permissions.AllowAny,)