# -*- coding: utf-8 -*-
# Generated by Django 1.11.17 on 2019-01-29 06:54
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('LMS', '0072_paper_group'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='papergroup',
            name='url',
        ),
    ]