# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2018-06-22 03:54
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0026_auto_20180621_1436'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='patient',
            name='modeOfPayment',
        ),
        migrations.AlterField(
            model_name='patient',
            name='city',
            field=models.CharField(blank=True, max_length=15, null=True),
        ),
        migrations.AlterField(
            model_name='patient',
            name='country',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
        migrations.AlterField(
            model_name='patient',
            name='dateOfBirth',
            field=models.DateField(),
        ),
        migrations.AlterField(
            model_name='patient',
            name='email',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='patient',
            name='emergencyContact1',
            field=models.PositiveIntegerField(),
        ),
        migrations.AlterField(
            model_name='patient',
            name='emergencyContact2',
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='patient',
            name='gender',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AlterField(
            model_name='patient',
            name='lastName',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AlterField(
            model_name='patient',
            name='phoneNo',
            field=models.PositiveIntegerField(),
        ),
        migrations.AlterField(
            model_name='patient',
            name='pin',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='patient',
            name='state',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
        migrations.AlterField(
            model_name='patient',
            name='street',
            field=models.TextField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='patient',
            name='uniqueId',
            field=models.CharField(blank=True, max_length=100),
        ),
    ]