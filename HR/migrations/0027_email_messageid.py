# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-10-08 07:32
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('HR', '0026_auto_20181007_1559'),
    ]

    operations = [
        migrations.AddField(
            model_name='email',
            name='messageId',
            field=models.CharField(default=' ', max_length=100, unique=True),
            preserve_default=False,
        ),
    ]
