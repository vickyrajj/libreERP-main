# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2019-01-29 12:45
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('support', '0075_customerprofile_is_blink'),
    ]

    operations = [
        migrations.AddField(
            model_name='supportchat',
            name='is_hidden',
            field=models.BooleanField(default=False),
        ),
    ]