# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2019-01-03 12:09
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('support', '0071_auto_20190103_0926'),
    ]

    operations = [
        migrations.AddField(
            model_name='projects',
            name='junkStatus',
            field=models.BooleanField(default=False),
        ),
    ]
