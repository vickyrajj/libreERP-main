# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-08-13 05:44
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ecommerce', '0045_address_primary'),
    ]

    operations = [
        migrations.AddField(
            model_name='supportfeed',
            name='status',
            field=models.CharField(choices=[('created', 'created'), ('ongoing', 'ongoing'), ('resolved', 'resolved'), ('junk', 'junk')], default='created', max_length=10),
        ),
    ]