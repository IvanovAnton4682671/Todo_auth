from django.views.decorators.csrf import csrf_protect
import json
from .models import *
from django.http import JsonResponse
import random as rnd
from django.core.mail import send_mail


@csrf_protect
def handle_authorization(request: dict) -> dict:
    """
    Данная функция обрабатывает авторизацию пользователя. Она получает корректные почту и хэш пароля и проверяет, существует ли такой пользователь в базе данных.

    Args:
        request (Dict): Входящий запрос со списком атрибутов, включая authorizationEmail и authorizationPassword.
    Return:
        dict (JsonResponse): Словарь, состоящий из сообщения (message) и статуса (status).
    """
    if request.method == "POST":
        data = json.loads(request.body)
        email = data.get("authorizationEmail")
        password = data.get("authorizationPassword")
        user = User.objects.filter(user_email=email, user_password=password)
        if user:
            print("Данные авторизации успешно получены и обработаны, такой пользователь существует!")
            return JsonResponse({"message": "Данные авторизации успешно получены и обработаны, такой пользователь существует!"}, status=200)
        else:
            print("Данные авторизации успешно получены и обработаны, такой пользователь не существует!")
            return JsonResponse({"message": "Данные авторизации успешно получены и обработаны, такой пользователь не существует!"}, status=201)
    else:
        print(f"Разрешены только POST-запросы для авторизации, а пришёл {request.method}-запрос!")
        return JsonResponse({"message": f"Разрешены только POST-запросы для авторизации, а пришёл {request.method}-запрос!"}, status=400)


@csrf_protect
def handle_send_code(request: dict) -> dict:
    """
    Данная функция обрабатывает регистрацию пользователя. Она получает корректную почту и хэш пароля, проверяет, не существует ли такой пользователь, и отправляет код ему на почту.

    Args:
        request (Dict): Входящий запрос со списком атрибутов, включая registrationEmail и registrationPassword.
    Return:
        dict (JsonResponse): Словарь, состоящий из сообщения (message) и статуса (status).
    """
    if request.method == "POST":
        data = json.loads(request.body)
        email = data.get("registrationEmail")
        password = data.get("registrationPassword")
        user = User.objects.filter(user_email=email, user_password=password)
        if not user:
            from_email = "anton-ivanov-080203@mail.ru"
            subject = "Код подтверждения"
            code = rnd.randint(1000000, 9999999)
            request.session["registrationEmail"] = email
            request.session["registrationPassword"] = password
            request.session["registrationCode"] = code
            output_message = f"Ваш код подтверждения для регистрации: {code}\n"
            output_message += "Если вы не пытаетесь зарегистрироваться, то проигнорируйте это письмо."
            send_mail(subject, output_message, from_email, [email])
            print(output_message)
            print("Пользователь с такими данными отсутствует в базе! Отправляем код!")
            return JsonResponse({"message": "Пользователь с такими данными отсутствует в базе! Отправляем код!"}, status=200)
        else:
            print("Пользователь с такими данными уже существует!")
            return JsonResponse({"message": "Пользователь с такими данными уже существует!"}, status=201)
    else:
        return JsonResponse({"message": f"Разрешены только POST-запросы для отправки кода, а пришёл {request.method}-запрос!"}, status=400)


@csrf_protect
def handle_input_code(request: dict) -> dict:
    if request.method == "POST":
        data = json.loads(request.body)
        email = data.get("registrationEmail")
        password = data.get("registrationPassword")
        code = data.get("registrationCode")
        saved_email = request.session.get("registrationEmail")
        saved_password = request.session.get("registrationPassword")
        saved_code = request.session.get("registrationCode")
        if saved_code is not None and str(code) == str(saved_code) and email == saved_email and password == saved_password:
            print("Код был введён верно и никакие данные не изменились!")
            return JsonResponse({"message": "Код был введён верно и никакие данные не изменились!"}, status=200)
        elif str(code) != str(saved_code):
            print("Код был введён неверно!")
            return JsonResponse({"message": "Код был введён неверно!"}, status=201)
        elif saved_code is None:
            print("Глобальный код почему-то отсутствует!")
            return JsonResponse({"message": "Глобальный код почему-то отсутствует!"}, status=401)
        elif email != saved_email or password != saved_password:
            print("Какие-то данные изменились (почта или пароль)!")
            return JsonResponse({"message": "Какие-то данные изменились (почта или пароль)!"}, status=402)
    else:
        return JsonResponse({"message": f"Разрешены только POST-запросы для проверки кода, а пришёл {request.method}-запрос!"}, status=400)
