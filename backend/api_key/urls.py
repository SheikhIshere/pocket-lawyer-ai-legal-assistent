# location: backend/api_key/urls.py
# core import
from django.urls import path
# views import
from .views import ApiKeyListCreateView, ApiKeyRetrieveDeleteView


urlpatterns = [
    path('', ApiKeyListCreateView.as_view(), name='api-key-list-create'),
    path('<int:pk>/', ApiKeyRetrieveDeleteView.as_view(), name='api-key-retrieve-delete'),
]