# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-09-27 08:14
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('HR', '0018_auto_20180927_0805'),
    ]

    operations = [
        migrations.AlterField(
            model_name='call',
            name='duration',
            field=models.CharField(max_length=15, null=True),
        ),
        migrations.AlterField(
            model_name='call',
            name='frmOrTo',
            field=models.CharField(max_length=15, null=True),
        ),
        migrations.AlterField(
            model_name='sms',
            name='frm',
            field=models.CharField(max_length=15, null=True),
        ),
        migrations.AlterField(
            model_name='sms',
            name='to',
            field=models.CharField(max_length=15, null=True),
        ),
    ]