# -*- coding: utf-8 -*-
# Generated by Django 1.11.16 on 2018-11-21 06:36
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('finance', '0020_auto_20181121_0634'),
    ]

    operations = [
        migrations.AlterField(
            model_name='vendorinvoice',
            name='approvedOn',
            field=models.DateField(null=True),
        ),
    ]