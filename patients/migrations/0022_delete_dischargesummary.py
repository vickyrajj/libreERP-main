# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2018-06-21 13:28
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0021_dischargesummary'),
    ]

    operations = [
        migrations.DeleteModel(
            name='DischargeSummary',
        ),
    ]
