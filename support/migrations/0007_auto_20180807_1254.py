# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-08-07 12:54
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('support', '0006_supportchat_attachmenttype'),
    ]

    operations = [
        migrations.AddField(
            model_name='customerprofile',
            name='callBack',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='customerprofile',
            name='ticket',
            field=models.BooleanField(default=False),
        ),
    ]
