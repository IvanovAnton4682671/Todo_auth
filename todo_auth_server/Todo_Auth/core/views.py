from django.views.decorators.csrf import csrf_protect
import json
from .models import *
from rest_framework_simplejwt.tokens import RefreshToken
from django.http import JsonResponse
import random as rnd
from django.core.mail import send_mail
from .jwt_decorator import jwt_protect


@csrf_protect
def handle_authorization(request: dict) -> JsonResponse:
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
        user = User.objects.filter(email=email, password=password).first()
        if user:
            refresh = RefreshToken.for_user(user)  #выдача пары токенов авторизованному пользователю
            print("Данные авторизации успешно получены и обработаны, такой пользователь существует!")
            return JsonResponse({
                "message": "Данные авторизации успешно получены и обработаны, такой пользователь существует!",
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            }, status=200)
        else:
            print("Данные авторизации успешно получены и обработаны, такой пользователь не существует!")
            return JsonResponse({"message": "Данные авторизации успешно получены и обработаны, такой пользователь не существует!"}, status=201)
    else:
        print(f"Разрешены только POST-запросы для авторизации, а пришёл {request.method}-запрос!")
        return JsonResponse({"message": f"Разрешены только POST-запросы для авторизации, а пришёл {request.method}-запрос!"}, status=400)


@csrf_protect
def handle_send_code(request: dict) -> JsonResponse:
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
        user = User.objects.filter(email=email).first()  #проверяем только по почте, потому что у разных пользователей может быть один пароль
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
        print(f"Разрешены только POST-запросы для авторизации, а пришёл {request.method}-запрос!")
        return JsonResponse({"message": f"Разрешены только POST-запросы для отправки кода, а пришёл {request.method}-запрос!"}, status=400)


@csrf_protect
def handle_input_code(request: dict) -> JsonResponse:
    """
    Данная функция обрабатывает регистрацию пользователя. Она получает введённый код и почту с хэшем пароля, проверяет совпадение кодов и старых данных с новыми через сессию,
    и сохраняет нового пользователя в бд, если такого пользователя ещё нет.

    Args:
        request (Dict): Входящий запрос со списком атрибутов, включая registrationEmail, RegistrationPassword и registrationCode.
    Return:
        dict (JsonResponse): Словарь, состоящий из сообщения (message) и статуса (status).
    """
    if request.method == "POST":
        data = json.loads(request.body)
        email = data.get("registrationEmail")
        password = data.get("registrationPassword")
        code = data.get("registrationCode")
        saved_email = request.session.get("registrationEmail")
        saved_password = request.session.get("registrationPassword")
        saved_code = request.session.get("registrationCode")
        user = User.objects.filter(email=email).first()  #проверяем только по почте, потому что у разных пользователей может быть один пароль
        if saved_code is not None and str(code) == str(saved_code) and email == saved_email and password == saved_password and not user:
            user = User(
                is_superuser=False,
                email=email,
                password=password
            )
            user.save()
            refresh = RefreshToken.for_user(user)  # выдача пары токенов авторизованному пользователю
            print("Код был введён верно и никакие данные не изменились!")
            return JsonResponse({
                "message": "Код был введён верно и никакие данные не изменились!",
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            }, status=200)
        elif str(code) != str(saved_code):
            print("Код был введён неверно!")
            return JsonResponse({"message": "Код был введён неверно!"}, status=201)
        elif saved_code is None:
            print("Глобальный код почему-то отсутствует!")
            return JsonResponse({"message": "Глобальный код почему-то отсутствует!"}, status=499)
        elif email != saved_email or password != saved_password:
            print("Какие-то данные изменились (почта или пароль)!")
            return JsonResponse({"message": "Какие-то данные изменились (почта или пароль)!"}, status=498)
    else:
        print(f"Разрешены только POST-запросы для авторизации, а пришёл {request.method}-запрос!")
        return JsonResponse({"message": f"Разрешены только POST-запросы для проверки кода, а пришёл {request.method}-запрос!"}, status=400)


@csrf_protect
@jwt_protect
def handle_load_areas(request: dict) -> JsonResponse:
    """
    Данная функция обрабатывает загрузку To Do блоков пользователя из базы. Она получает на вход почту пользователя, и по этому ключу ищет все To Do блоки.

    Args:
        request (Dict): Входящий запрос со списком атрибутов, включая email.
    Return:
        dict (JsonResponse): Словарь, состоящий из сообщения (message) и статуса (status).
    """
    if request.method == "POST":
        data = json.loads(request.body)
        email = data.get("email")
        if email is not None:
            user = User.objects.get(email=email)
            if user:
                all_user_todo_areas = TodoList.objects.filter(todo_list_user_id=user)
                areas_list = []
                for area in all_user_todo_areas:
                    areas_list.append({"block_id": area.block_id, "complete": area.complete, "text": area.text})
                print(areas_list)
                print("Почта пришла, такой пользователь существует и to do задачи были загружены!")
                return JsonResponse({
                    "message": "Почта пришла, такой пользователь существует и to do задачи были загружены!",
                    "areas": areas_list
                }, status=200)
            else:
                print("Почта пришла, однако такой пользователь не существует!")
                return JsonResponse({"message": "Почта пришла, однако такой пользователь не существует!"}, status=499)
        else:
            print("Почта отсутствует в присланных данных!")
            return JsonResponse({"message": "Почта отсутствует в присланных данных!"}, status=498)
    else:
        print(f"Разрешены только POST-запросы для загрузки данных, а пришёл {request.method}-запрос!")
        return JsonResponse(
            {"message": f"Разрешены только POST-запросы для загрузки данных, а пришёл {request.method}-запрос!"}, status=400)


@csrf_protect
@jwt_protect
def handle_save_areas(request: dict) -> JsonResponse:
    """
    Данная функция обрабатывает сохранение To Do блоков пользователя в базе. Она получает на вход почту пользователя для формирования внешнего ключа и массив самих блоков.
    Эта функция сначала удаляет все старые блоки пользователя, а затем сохраняет новые.

    Args:
        request (Dict): Входящий запрос со списком атрибутов, включая email и areas.
    Return:
        dict (JsonResponse): Словарь, состоящий из сообщения (message) и статуса (status).
    """
    if request.method == "POST":
        data = json.loads(request.body)
        email = data.get("email")
        areas = data.get("areas")
        if email is not None:
            user = User.objects.get(email=email)
            if user:
                TodoList.objects.filter(todo_list_user_id=user).delete()
                for area in areas:
                    complete = area.get("complete", False)  #если пользователь просто создал блок и никак его не обработал, то там эти 2 поля будут отсутствовать
                    text = area.get("text", "")
                    todo_block = TodoList(
                        todo_list_user_id=user,
                        block_id=area["id"],
                        complete=complete,
                        text=text
                    )
                    todo_block.save()
                print("Данные пришли и to do задачи были сохранены!")
                return JsonResponse({"message": "Данные пришли и to do задачи были сохранены!"}, status=200)
            else:
                print("Данные пришли, но такого пользователя нет в бд!")
                return JsonResponse({"message": "Данные пришли, но такого пользователя нет в бд!"}, status=499)
        if email is None:
            print("Данные пришли без почты, т.е. пользователь не авторизован!")
            return JsonResponse({"message": "Данные пришли без почты, т.е. пользователь не авторизован!"}, status=498)
    else:
        print(f"Разрешены только POST-запросы для сохранения данных, а пришёл {request.method}-запрос!")
        return JsonResponse({"message": f"Разрешены только POST-запросы для сохранения данных, а пришёл {request.method}-запрос!"}, status=400)
