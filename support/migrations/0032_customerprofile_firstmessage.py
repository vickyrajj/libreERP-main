# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-08-28 12:02
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('support', '0031_auto_20180827_0632'),
    ]

    operations = [
        migrations.AddField(
            model_name='customerprofile',
            name='firstMessage',
            field=models.CharField(blank=True, max_length=20000, null=True),
        ),
    ]