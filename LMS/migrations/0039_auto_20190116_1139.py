# -*- coding: utf-8 -*-
# Generated by Django 1.11.16 on 2019-01-16 11:39
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('LMS', '0038_auto_20190116_1138'),
    ]

    operations = [
        migrations.AlterField(
            model_name='notessection',
            name='mode',
            field=models.CharField(choices=[('text', 'text'), ('image', 'image')], default='text', max_length=10),
        ),
    ]
