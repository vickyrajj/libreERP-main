# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2019-01-16 10:29
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('finance', '0041_outboundinvoice_outboundinvoiceqty'),
        ('projects', '0025_auto_20190116_0731'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='ourBoundInvoices',
            field=models.ManyToManyField(related_name='projectOutBoundInvoice', to='finance.OutBoundInvoice'),
        ),
        migrations.AlterField(
            model_name='project',
            name='costCenter',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='projectCostcenter', to='finance.CostCenter'),
        ),
    ]
