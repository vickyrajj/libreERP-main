# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2019-01-18 06:28
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('support', '0087_projects_grndate'),
    ]

    operations = [
        migrations.AddField(
            model_name='projectstocksummary',
            name='comm_nr',
            field=models.CharField(max_length=100, null=True),
        ),
    ]
