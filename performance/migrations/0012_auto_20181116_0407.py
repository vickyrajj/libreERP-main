# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-11-16 04:07
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('performance', '0011_auto_20181115_1301'),
    ]

    operations = [
        migrations.AlterField(
            model_name='timesheet',
            name='totaltime',
            field=models.DateTimeField(null=True),
        ),
    ]
