# Generated by Django 5.0.6 on 2024-06-21 19:57

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('user_id', models.AutoField(primary_key=True, serialize=False)),
                ('user_email', models.EmailField(default='example@example.com', max_length=100)),
                ('user_password', models.CharField(default='example_hash', max_length=64)),
            ],
            options={
                'db_table': 'user',
            },
        ),
        migrations.CreateModel(
            name='TodoList',
            fields=[
                ('todo_list_id', models.AutoField(primary_key=True, serialize=False)),
                ('todo_list_block_id', models.IntegerField(default=0)),
                ('todo_list_check', models.BooleanField(default=False)),
                ('todo_list_text', models.CharField(default='', null=True)),
                ('todo_list_user_user_id', models.ForeignKey(default=0, on_delete=django.db.models.deletion.CASCADE, related_name='todo_list_user_user_id_fk', to='core.user')),
            ],
            options={
                'db_table': 'todo_list',
            },
        ),
    ]
