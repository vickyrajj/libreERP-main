# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2018-04-19 12:09
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('assets', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='asset',
            name='inStock',
        ),
    ]