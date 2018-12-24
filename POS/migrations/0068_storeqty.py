# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-08-22 07:17
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('POS', '0067_store'),
    ]

    operations = [
        migrations.CreateModel(
            name='StoreQty',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('quantity', models.PositiveIntegerField(default=0)),
                ('store', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='POSStoreDetail', to='POS.Store')),
            ],
        ),
    ]