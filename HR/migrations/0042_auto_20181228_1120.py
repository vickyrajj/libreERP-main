# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-12-28 11:20
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('HR', '0041_auto_20181128_1148'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='prefix',
            field=models.CharField(choices=[(b'NA', b'NA'), (b'Miss.', b'Miss.'), (b'Mr.', b'Mr.'), (b'Dr', b'Dr')], default=b'NA', max_length=4),
        ),
    ]