# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2019-01-14 05:00
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('finance', '0036_account_unit'),
    ]

    operations = [
        migrations.AddField(
            model_name='purchaseorder',
            name='email',
            field=models.CharField(max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='purchaseorder',
            name='phone',
            field=models.CharField(max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='purchaseorder',
            name='pincode',
            field=models.PositiveIntegerField(default=0, null=True),
        ),
    ]