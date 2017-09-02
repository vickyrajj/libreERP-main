# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2017-09-02 10:01
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('clientRelationships', '0003_auto_20170901_0449'),
    ]

    operations = [
        migrations.AddField(
            model_name='contact',
            name='name',
            field=models.CharField(default='', max_length=100),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='contact',
            name='company',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='contacts', to='ERP.service'),
        ),
        migrations.AlterField(
            model_name='contact',
            name='designation',
            field=models.CharField(max_length=30, null=True),
        ),
        migrations.AlterField(
            model_name='contact',
            name='mobile',
            field=models.PositiveSmallIntegerField(null=True),
        ),
        migrations.AlterField(
            model_name='contact',
            name='mobileSecondary',
            field=models.PositiveSmallIntegerField(null=True),
        ),
        migrations.AlterField(
            model_name='contact',
            name='notes',
            field=models.TextField(max_length=300, null=True),
        ),
    ]
