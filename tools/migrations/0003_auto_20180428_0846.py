# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-04-28 08:46
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tools', '0002_archiveddocument_documentcontent'),
    ]

    operations = [
        migrations.AlterField(
            model_name='documentcontent',
            name='nlpResult',
            field=models.CharField(max_length=3000, null=True),
        ),
    ]
