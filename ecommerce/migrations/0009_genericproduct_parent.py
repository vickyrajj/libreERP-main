# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-06-26 06:25
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('ecommerce', '0008_offerbanner'),
    ]

    operations = [
        migrations.AddField(
            model_name='genericproduct',
            name='parent',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='parentgenericProduct', to='ecommerce.genericProduct'),
        ),
    ]