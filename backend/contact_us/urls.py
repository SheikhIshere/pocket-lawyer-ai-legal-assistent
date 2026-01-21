# location: backend/contact_us/urls.py

# core import
from django.urls import path
from .views import ContactUsView


urlpatterns = [
    path('submit/', ContactUsView.as_view(), name='contact_us')
]