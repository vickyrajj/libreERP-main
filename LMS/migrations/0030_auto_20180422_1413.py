# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-04-22 14:13
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('LMS', '0029_question_typ'),
    ]

    operations = [
        migrations.AddField(
            model_name='question',
            name='objectiveAnswer',
            field=models.CharField(max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='question',
            name='solutionVideoLink',
            field=models.CharField(max_length=500, null=True),
        ),
    ]
