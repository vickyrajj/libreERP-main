# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-10-08 05:40
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('ecommerce', '0060_orderqtymap_prodsku'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='cart',
            name='prodVarPrice',
        ),
    ]