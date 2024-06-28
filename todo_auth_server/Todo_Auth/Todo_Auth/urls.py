"""
URL configuration for Todo_Auth project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
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
from django.urls import path
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse
from core.views import *
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


@ensure_csrf_cookie
def get_csrf_cookie(request: dict) -> JsonResponse:
    """
    Данная функция устанавливает CSRF-токен в cookie.

    Args:
        request (Dict): Входящий запрос, в который встраивается CSRF-токен, который потом сервер будет ожидать при получении запросов.
    Return:
        dict (JsonResponse): Словарь, состоящий из сообщения (message) и статуса (status).
    """
    return JsonResponse({"message": "CSRF cookie set!"}, status=200)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('get_csrf_cookie', get_csrf_cookie, name='get_csrf_cookie'),
    #  path('get_jwt_token', TokenObtainPairView.as_view(), name='get_jwt_token'),
    path('get_new_token_pair', TokenRefreshView.as_view(), name='get_new_token_pair'),
    path('authorization', handle_authorization, name='handle_authorization'),
    path('send_code', handle_send_code, name='handle_send_code'),
    path('input_code', handle_input_code, name='handle_input_code'),
    path('load_areas', handle_load_areas, name='handle_load_areas'),
    path('save_areas', handle_save_areas, name='handle_save_areas'),
]
