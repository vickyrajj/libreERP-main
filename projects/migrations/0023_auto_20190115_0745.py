# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2019-01-15 07:45
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0022_auto_20190114_0740'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='budget',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='project',
            name='projectClosed',
            field=models.BooleanField(default=False),
        ),
    ]
