# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2019-02-06 13:54
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('support', '0081_dynamicform_typ'),
    ]

    operations = [
        migrations.AlterField(
            model_name='chatthread',
            name='uid',
            field=models.CharField(max_length=50, null=True, unique=True),
        ),
    ]