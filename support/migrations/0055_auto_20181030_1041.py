# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2018-10-30 10:41
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('support', '0054_auto_20181030_1031'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='chatthread',
            name='resolvedBy',
        ),
        migrations.AlterField(
            model_name='chatthread',
            name='resolvedOn',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='resolvedUser', to=settings.AUTH_USER_MODEL),
        ),
    ]