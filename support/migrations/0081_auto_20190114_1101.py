# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2019-01-14 11:01
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('support', '0080_auto_20190109_1144'),
    ]

    operations = [
        migrations.AddField(
            model_name='projects',
            name='poNotes',
            field=models.CharField(blank=True, max_length=500, null=True),
        ),
        migrations.AddField(
            model_name='projects',
            name='quoteNotes',
            field=models.CharField(blank=True, max_length=500, null=True),
        ),
    ]