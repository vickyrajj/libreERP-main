# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2017-09-08 06:25
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('clientRelationships', '0016_deal_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='deal',
            name='state',
            field=models.CharField(choices=[('created', 'created'), ('contacted', 'contacted'), ('demo', 'demo'), ('requirements', 'requirements'), ('proposal', 'proposal'), ('negotiation', 'negotiation'), ('conclusion', 'conclusion')], default='created', max_length=13),
        ),
    ]
