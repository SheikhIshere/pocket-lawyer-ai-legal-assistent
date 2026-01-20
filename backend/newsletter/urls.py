# location:backend/newsletter/urls.py

# core
from django.urls import path

# from views
from .views import NewsLetterView

urlpatterns = [
    path('submit/', NewsLetterView.as_view(), name='news_letter')
]