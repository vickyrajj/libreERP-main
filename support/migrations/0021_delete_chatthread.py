# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-08-14 08:38
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('support', '0020_auto_20180814_0620'),
    ]

    operations = [
        migrations.DeleteModel(
            name='ChatThread',
        ),
    ]