# -*- coding: utf-8 -*-
# Generated by Django 1.11.16 on 2018-12-08 13:27
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('support', '0065_auto_20181207_0959'),
    ]

    operations = [
        migrations.AddField(
            model_name='customerprofile',
            name='fontColor',
            field=models.CharField(default='#000000', max_length=20, null=True),
        ),
    ]