# -*- coding: utf-8 -*-
# Generated by Django 1.11.16 on 2019-01-18 12:16
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('LMS', '0057_auto_20190118_1208'),
    ]

    operations = [
        migrations.AlterField(
            model_name='announcement',
            name='notification',
            field=models.CharField(choices=[('sms', 'sms'), ('email', 'email'), ('Sms&Email', 'sms&email')], max_length=10, null=True),
        ),
    ]
