# -*- coding: utf-8 -*-
# Generated by Django 1.11.17 on 2019-02-06 12:09
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('LMS', '0085_auto_20190205_0507'),
    ]

    operations = [
        migrations.AddField(
            model_name='forumcomment',
            name='verified',
            field=models.BooleanField(default=False),
        ),
    ]