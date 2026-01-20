"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from .scripts import documentation

urlpatterns = [
    path('admin/', admin.site.urls),

    # script
    path('', documentation, name='documentation'),
    
    # local
    path('v1/api/users/', include('users.urls')),
    path('v1/api/accounts/', include('accounts.urls')),
    path('v1/api/accounts/api-key/', include('api_key.urls')),
    path('v1/api/assistant/', include('chat_bot.urls')),
    path('v1/api/newsletter/', include('newsletter.urls')),

    


    # drf-spectacular
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
