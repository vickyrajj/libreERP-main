# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-04-26 05:16
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('POS', '0045_merge_20180426_0514'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='vendorservices',
            name='select',
        ),
    ]
