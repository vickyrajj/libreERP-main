# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-07-04 12:34
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('recruitment', '0016_auto_20180704_0735'),
    ]

    operations = [
        migrations.AddField(
            model_name='interview',
            name='status',
            field=models.CharField(choices=[('Created', 'Created')], default='Created', max_length=15),
        ),
    ]
