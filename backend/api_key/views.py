# location: backend/api_key/views.py

# core import
from rest_framework import (
    generics,
)

# serializers
from .serializers import ApiKeySerializers

# models
from .models import ApiKey

# permission
from rest_framework.permissions import IsAuthenticated
from BASE.base_permission import IsVerifiedUser

# documentation
from drf_spectacular.utils import extend_schema

"""
TODO: 1 post api
      2 show api
      3 retrieve api
      4 delete api
"""
@extend_schema(tags=['API Key'])
class ApiKeyListCreateView(generics.ListCreateAPIView):
    serializer_class = ApiKeySerializers
    permission_classes = [IsAuthenticated, IsVerifiedUser]
    http_method_names = ['get', 'post']  # <- only allow GET and POST


    def get_queryset(self):
        return ApiKey.objects.filter(account_id__user=self.request.user)

@extend_schema(tags=['API Key'])
class ApiKeyRetrieveDeleteView(generics.RetrieveDestroyAPIView):
    serializer_class = ApiKeySerializers
    permission_classes = [IsAuthenticated, IsVerifiedUser]
    http_method_names = ['get', 'delete']  # <- only allow GET and DELETE


    def get_queryset(self):
        return ApiKey.objects.filter(account_id__user=self.request.user)
