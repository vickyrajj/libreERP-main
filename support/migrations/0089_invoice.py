# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2019-01-18 13:31
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('support', '0088_projectstocksummary_comm_nr'),
    ]

    operations = [
        migrations.CreateModel(
            name='Invoice',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('invoiceNumber', models.CharField(blank=True, max_length=20, null=True)),
                ('invoiceDate', models.DateField(null=True)),
                ('poNumber', models.CharField(blank=True, max_length=20, null=True)),
                ('insuranceNumber', models.CharField(blank=True, max_length=20, null=True)),
                ('transporter', models.CharField(blank=True, max_length=50, null=True)),
                ('lrNo', models.CharField(blank=True, max_length=50, null=True)),
                ('billName', models.CharField(blank=True, max_length=50, null=True)),
                ('shipName', models.CharField(blank=True, max_length=50, null=True)),
                ('billAddress', models.CharField(blank=True, max_length=200, null=True)),
                ('shipAddress', models.CharField(blank=True, max_length=200, null=True)),
                ('billGst', models.CharField(blank=True, max_length=50, null=True)),
                ('shipGst', models.CharField(blank=True, max_length=50, null=True)),
                ('billState', models.CharField(blank=True, max_length=50, null=True)),
                ('shipState', models.CharField(blank=True, max_length=50, null=True)),
                ('billCode', models.CharField(blank=True, max_length=20, null=True)),
                ('shipCode', models.CharField(blank=True, max_length=20, null=True)),
                ('isDetails', models.BooleanField(default=False)),
                ('invoiceTerms', models.CharField(blank=True, max_length=200, null=True)),
                ('project', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='support.Projects')),
            ],
        ),
    ]
