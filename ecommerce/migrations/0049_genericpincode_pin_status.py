# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-09-01 04:08
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ecommerce', '0048_genericpincode'),
    ]

    operations = [
        migrations.AddField(
            model_name='genericpincode',
            name='pin_status',
            field=models.CharField(default='1', max_length=2),
        ),
    ]