# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-12-14 10:24
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('support', '0032_auto_20181214_1023'),
    ]

    operations = [
        migrations.AddField(
            model_name='bom',
            name='invoice_price',
            field=models.FloatField(default=0, null=True),
        ),
    ]