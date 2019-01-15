# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2019-01-14 05:16
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('organization', '0008_auto_20180614_0401'),
        ('finance', '0037_auto_20190114_0500'),
    ]

    operations = [
        migrations.AddField(
            model_name='purchaseorder',
            name='bussinessunit',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='organization.Unit'),
        ),
        migrations.AddField(
            model_name='purchaseorder',
            name='costcenter',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='purchaseorderCostcenter', to='finance.CostCenter'),
        ),
    ]
