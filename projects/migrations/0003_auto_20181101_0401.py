# -*- coding: utf-8 -*-
# Generated by Django 1.11.16 on 2018-11-01 04:01
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0002_issues'),
    ]

    operations = [
        migrations.AlterField(
            model_name='issues',
            name='status',
            field=models.CharField(choices=[('created', 'created'), ('resolved', 'resolved'), ('stuck', 'stuck')], max_length=50),
        ),
    ]