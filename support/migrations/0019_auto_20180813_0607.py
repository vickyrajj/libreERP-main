# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-08-13 06:07
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('support', '0018_auto_20180813_0606'),
    ]

    operations = [
        migrations.RenameField(
            model_name='chatthread',
            old_name='CustomerFeedback',
            new_name='customerFeedback',
        ),
    ]