# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-12-04 10:42
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('HR', '0016_profile_details'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='details',
            field=models.TextField(blank=True, max_length=1000, null=True),
        ),
    ]
