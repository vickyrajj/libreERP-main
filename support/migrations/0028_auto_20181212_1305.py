# -*- coding: utf-8 -*-
# Generated by Django 1.11.16 on 2018-12-12 13:05
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('support', '0027_projects_savedstatus'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bom',
            name='customer_price',
            field=models.FloatField(default=0, null=True),
        ),
    ]