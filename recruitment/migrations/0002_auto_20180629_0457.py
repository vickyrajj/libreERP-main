# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-06-29 04:57
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('recruitment', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='jobs',
            name='approved',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='jobs',
            name='maximumCTC',
            field=models.CharField(max_length=15, null=True),
        ),
        migrations.AddField(
            model_name='jobs',
            name='status',
            field=models.CharField(choices=[('Created', 'Created'), ('Approved', 'Approved'), ('Active', 'Active'), ('Closed', 'Closed')], default='Intern', max_length=15),
        ),
    ]
