# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-10-31 12:14
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('POS', '0092_product_grossweight'),
    ]

    operations = [
        migrations.CreateModel(
            name='ProductMeta',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('description', models.CharField(max_length=500)),
                ('typ', models.CharField(choices=[('HSN', 'HSN'), ('SAC', 'SAC')], default='HSN', max_length=5)),
                ('code', models.PositiveIntegerField()),
                ('taxRate', models.PositiveIntegerField()),
            ],
        ),
    ]