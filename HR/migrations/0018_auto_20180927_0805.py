# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-09-27 08:05
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('HR', '0017_call_location_sms'),
    ]

    operations = [
        migrations.AlterField(
            model_name='call',
            name='dated',
            field=models.DateTimeField(),
        ),
    ]