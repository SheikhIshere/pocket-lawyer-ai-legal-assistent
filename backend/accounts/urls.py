# location: backend/accounts/urls.py

# core import
from django.urls import path

# including views
from .views import (
    AccountViewSet,
    AccountAddressViewSet,
)

urlpatterns = [
    # own profile
    path('me/', AccountViewSet.as_view(), name='profile'),    
    
    # account address
    path('me/address/', AccountAddressViewSet.as_view(), name='account-address'),
]


