# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-07-05 12:15
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0050_auto_20180702_0822'),
    ]

    operations = [
        migrations.AlterField(
            model_name='patient',
            name='uniqueId',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
