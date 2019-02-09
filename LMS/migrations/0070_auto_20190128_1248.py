# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2019-01-28 12:48
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('LMS', '0069_merge_20190128_1223'),
    ]

    operations = [
        migrations.AlterField(
            model_name='note',
            name='course',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='courseNote', to='LMS.Course'),
        ),
        migrations.AlterField(
            model_name='note',
            name='subject',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='subject', to='LMS.Subject'),
        ),
    ]