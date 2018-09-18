# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-07-10 10:57
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('warehouse', '0020_space_arealength'),
    ]

    operations = [
        migrations.AddField(
            model_name='invoice',
            name='archivedDate',
            field=models.DateTimeField(null=True),
        ),
        migrations.AddField(
            model_name='invoice',
            name='billedDate',
            field=models.DateTimeField(null=True),
        ),
        migrations.AddField(
            model_name='invoice',
            name='dueDate',
            field=models.DateField(null=True),
        ),
        migrations.AddField(
            model_name='invoice',
            name='recievedDate',
            field=models.DateTimeField(null=True),
        ),
    ]