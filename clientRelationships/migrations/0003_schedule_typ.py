# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-06-15 05:38
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('clientRelationships', '0002_schedule'),
    ]

    operations = [
        migrations.AddField(
            model_name='schedule',
            name='typ',
            field=models.TextField(default=1, max_length=10000),
            preserve_default=False,
        ),
    ]