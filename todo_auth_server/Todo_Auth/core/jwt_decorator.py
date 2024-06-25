from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.http import JsonResponse


def jwt_protect(view_func):
    """
    Данный декоратор принимает в себя другую функцию и проверяет, не истёк ли срок действия JWTAccess-токена пользователя, который выполняет данную функцию

    Args:
        view_func (Callable): Функция, которая должна быть защищена JWT-токеном.
    Return:
        dict (JsonResponse): Словарь, состоящий из сообщения (message) и статуса (status).
        view_func (Callable): Проверяемая функция.
        _wrapped_view_func (Callable): Внешняя обёртка.
    """
    def _wrapped_view_func(request, *args, **kwargs):
        auth = JWTAuthentication()
        try:
            user, token = auth.authenticate(request)
            request.user = user
            request.token = token
        except (InvalidToken, TokenError):
            return JsonResponse({"message": "token_not_valid"}, status=401)
        return view_func(request, *args, **kwargs)
    return _wrapped_view_func
