# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-07-04 07:35
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('recruitment', '0015_auto_20180704_0735'),
    ]

    operations = [
        migrations.AlterField(
            model_name='interview',
            name='person',
            field=models.ManyToManyField(blank=True, related_name='interviwer', to=settings.AUTH_USER_MODEL),
        ),
    ]