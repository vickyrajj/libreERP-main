# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2019-01-31 08:46
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('finance', '0049_auto_20190131_0842'),
    ]

    operations = [
        migrations.AlterField(
            model_name='inventory',
            name='qtyAdded',
            field=models.CharField(default=0, max_length=100),
        ),
        migrations.AlterField(
            model_name='inventory',
            name='refurnished',
            field=models.CharField(default=0, max_length=100),
        ),
        migrations.AlterField(
            model_name='inventory',
            name='refurnishedAdded',
            field=models.CharField(default=0, max_length=100),
        ),
        migrations.AlterField(
            model_name='inventory',
            name='value',
            field=models.CharField(default=0, max_length=100),
        ),
        migrations.AlterField(
            model_name='inventorylog',
            name='refurnished',
            field=models.CharField(default=0, max_length=100),
        ),
        migrations.AlterField(
            model_name='inventorylog',
            name='value',
            field=models.CharField(default=0, max_length=100),
        ),
    ]