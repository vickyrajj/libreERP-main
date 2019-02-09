# -*- coding: utf-8 -*-
# Generated by Django 1.11.16 on 2019-01-17 07:40
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('LMS', '0040_auto_20190117_0544'),
    ]

    operations = [
        migrations.CreateModel(
            name='Announcement',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('notified', models.BooleanField(default=False)),
                ('notification', models.CharField(choices=[('sms', 'sma'), ('email', 'email'), ('sms&email', 'sms&email')], max_length=10, null=True)),
                ('typ', models.CharField(choices=[('general', 'general'), ('quiz', 'quiz'), ('online_class', 'online_class'), ('class', 'class'), ('offline_quiz', 'offline_quiz')], max_length=10, null=True)),
                ('paperDueDate', models.DateField(auto_now=True)),
                ('time', models.DateTimeField(auto_now=True)),
                ('venue', models.CharField(max_length=100, null=True)),
                ('txt', models.TextField(null=True)),
                ('meetingId', models.CharField(max_length=100, null=True)),
                ('announcer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='announcements', to=settings.AUTH_USER_MODEL)),
                ('paper', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='paper', to='LMS.Paper')),
            ],
        ),
    ]