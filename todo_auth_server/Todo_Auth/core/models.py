from django.db import models

class User(models.Model):
    """
    Данный класс представляет собой таблицу данных пользователей.

    Attributes:
        user_id (AutoField): ID пользователя (автоинкремент).
        user_email (EmailField): Электронная почта пользователя.
        user_password (CharField): Хэш пароля пользователя.
    """
    user_id = models.AutoField(primary_key=True)
    user_email = models.EmailField(max_length=100, null=False, default="example@example.com")
    user_password = models.CharField(max_length=64, null=False, default="example_hash")

    class Meta:
        """
        Данный класс представляет собой мета-информацию.

        Attributes:
            db_table (str): Название таблицы.
        """
        db_table = "user"

class TodoList(models.Model):
    """
    Данный класс представляет собой таблицу всех todo_блоков.

    Attributes:
        todo_list_id (AutoField): ID записи в таблице.
        todo_list_user_user_id (ForeignKey): Внешний ключ для связи с таблицей User по полю user_id.
        todo_list_block_id (IntegerField): Номер блока по очерёдности на странице.
        todo_list_check (BooleanField): Статус каждого блока (сделан или не сделан).
        todo_list_text (CharField): Текстовое значение каждого блока.
    """
    todo_list_id = models.AutoField(primary_key=True)
    todo_list_user_user_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name="todo_list_user_user_id_fk", null=False, default=0)
    todo_list_block_id = models.IntegerField(null=False, default=0)
    todo_list_check = models.BooleanField(null=False, default=False)
    todo_list_text = models.CharField(null=True, default="")

    class Meta:
        """
        Данный класс представляет собой мета-информацию.

        Attributes:
            db_table (str): Название таблицы.
        """
        db_table = "todo_list"
