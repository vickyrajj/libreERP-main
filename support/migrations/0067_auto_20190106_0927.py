# -*- coding: utf-8 -*-
# Generated by Django 1.11.16 on 2019-01-06 09:27
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('support', '0066_customerprofile_fontcolor'),
    ]

    operations = [
        migrations.AddField(
            model_name='customerprofile',
            name='chatIconPosition',
            field=models.CharField(blank=True, max_length=20000, null=True),
        ),
        migrations.AddField(
            model_name='customerprofile',
            name='chatIconType',
            field=models.BooleanField(default=False),
        ),
    ]