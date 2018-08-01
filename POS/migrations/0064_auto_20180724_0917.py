# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-07-24 09:17
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('POS', '0063_auto_20180724_0906'),
    ]

    operations = [
        migrations.AlterField(
            model_name='product',
            name='unit',
            field=models.CharField(choices=[('Kilogram', 'Kilogram'), ('Gram', 'Gram'), ('Litre', 'Litre'), ('Mililitre', 'Mililitre'), ('Quantity', 'Quantity')], max_length=10, null=True),
        ),
    ]
