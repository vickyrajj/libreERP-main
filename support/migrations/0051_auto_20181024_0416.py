# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-10-24 04:16
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('support', '0050_chatthread_typ'),
    ]

    operations = [
        migrations.AlterField(
            model_name='chatthread',
            name='customerFeedback',
            field=models.CharField(blank=True, max_length=3000, null=True),
        ),
    ]