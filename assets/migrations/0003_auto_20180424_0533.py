# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2018-04-24 05:33
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('assets', '0002_remove_asset_instock'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='allotment',
            name='approvedBy',
        ),
        migrations.RemoveField(
            model_name='allotment',
            name='user',
        ),
        migrations.RemoveField(
            model_name='checkin',
            name='user',
        ),
        migrations.DeleteModel(
            name='Allotment',
        ),
        migrations.DeleteModel(
            name='Checkin',
        ),
    ]