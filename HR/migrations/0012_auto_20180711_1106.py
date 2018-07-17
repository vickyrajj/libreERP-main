# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-07-11 11:06
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('HR', '0011_auto_20180602_0320'),
    ]

    operations = [
        migrations.AddField(
            model_name='payroll',
            name='notice',
            field=models.PositiveIntegerField(default=0, null=True),
        ),
        migrations.AddField(
            model_name='payroll',
            name='probation',
            field=models.PositiveIntegerField(default=0, null=True),
        ),
        migrations.AddField(
            model_name='payroll',
            name='probationNotice',
            field=models.PositiveIntegerField(default=0, null=True),
        ),
    ]
