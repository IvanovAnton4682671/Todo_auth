from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Данный класс представляет собой таблицу данных пользователей.

    Attributes:
        email (EmailField): Электронная почта пользователя.
        password (CharField): Хэш пароля пользователя.
    """
    email = models.EmailField(max_length=100, null=False, default="example@example.com", unique=True)
    password = models.CharField(max_length=64, null=False, default="example_hash")

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_set',  # Измените related_name
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_set',  # Измените related_name
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

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
        todo_list_user_id (ForeignKey): Внешний ключ для связи с таблицей User по полю id.
        block_id (IntegerField): Номер блока по очерёдности на странице.
        complete (BooleanField): Статус каждого блока (сделан или не сделан).
        text (CharField): Текстовое значение каждого блока.
    """
    todo_list_user_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name="todo_list_user_id_fk", null=False, default=0)
    block_id = models.IntegerField(null=False, default=0)
    complete = models.BooleanField(null=False, default=False)
    text = models.CharField(null=True, default="")

    class Meta:
        """
        Данный класс представляет собой мета-информацию.

        Attributes:
            db_table (str): Название таблицы.
        """
        db_table = "todo_list"
