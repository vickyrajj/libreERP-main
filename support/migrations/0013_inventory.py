# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-12-06 05:29
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('support', '0012_auto_20181205_0841'),
    ]

    operations = [
        migrations.CreateModel(
            name='Inventory',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('qty', models.PositiveIntegerField(default=0, null=True)),
                ('rate', models.FloatField(null=True)),
                ('products', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='support.Products')),
            ],
        ),
    ]
