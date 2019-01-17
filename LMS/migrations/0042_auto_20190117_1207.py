# -*- coding: utf-8 -*-
# Generated by Django 1.11.16 on 2019-01-17 12:07
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('LMS', '0041_announcement'),
    ]

    operations = [
        migrations.AlterField(
            model_name='announcement',
            name='notification',
            field=models.CharField(choices=[('sms', 'SMS'), ('email', 'Email'), ('sms&email', 'SMS & Email')], max_length=10, null=True),
        ),
        migrations.AlterField(
            model_name='announcement',
            name='typ',
            field=models.CharField(choices=[('general', 'General'), ('quiz', 'Quiz'), ('onlineclass', 'Online Class'), ('class', 'Class'), ('offlinequiz', 'Offline Quiz')], max_length=10, null=True),
        ),
    ]
