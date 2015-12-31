# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2015-12-31 16:51
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('PIM', '0020_auto_20151231_1152'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='blogpost',
            name='text',
        ),
        migrations.AddField(
            model_name='blogpost',
            name='source',
            field=models.TextField(max_length=20000, null=True),
        ),
        migrations.AddField(
            model_name='blogpost',
            name='state',
            field=models.CharField(choices=[(b'saved', b'saved'), (b'archived', b'archived'), (b'published', b'published'), (b'hidden', b'hidden')], default=b'saved', max_length=20),
        ),
        migrations.AddField(
            model_name='blogpost',
            name='title',
            field=models.CharField(max_length=500, null=True),
        ),
    ]
