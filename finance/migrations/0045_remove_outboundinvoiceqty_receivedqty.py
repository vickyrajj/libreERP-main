# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2019-01-27 07:52
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('finance', '0044_outboundinvoiceqty_receivedqty'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='outboundinvoiceqty',
            name='receivedQty',
        ),
    ]
