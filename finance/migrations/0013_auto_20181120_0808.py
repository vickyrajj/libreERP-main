# -*- coding: utf-8 -*-
# Generated by Django 1.11.16 on 2018-11-20 08:08
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('finance', '0012_vendorinvoice'),
    ]

    operations = [
        migrations.AlterField(
            model_name='vendorinvoice',
            name='amount',
            field=models.FloatField(default=0, null=True),
        ),
    ]