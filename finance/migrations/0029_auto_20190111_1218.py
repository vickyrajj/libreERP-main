# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2019-01-11 12:18
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('finance', '0028_auto_20190111_1124'),
    ]

    operations = [
        migrations.RenameField(
            model_name='inflow',
            old_name='ammount',
            new_name='amount',
        ),
        migrations.RenameField(
            model_name='transaction',
            old_name='ammount',
            new_name='amount',
        ),
    ]