# -*- coding: utf-8 -*-
# Generated by Django 1.11.16 on 2018-11-14 10:43
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion
import finance.models


class Migration(migrations.Migration):

    dependencies = [
        ('ERP', '0006_service_vendor'),
        ('finance', '0003_auto_20181114_1042'),
    ]

    operations = [
        migrations.CreateModel(
            name='VendorProfile',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('contactPerson', models.CharField(max_length=100, unique=True)),
                ('mobile', models.CharField(max_length=12, null=True)),
                ('email', models.EmailField(max_length=254, null=True)),
                ('paymentTerm', models.PositiveIntegerField(default=0, null=True)),
                ('contentDocs', models.FileField(blank=True, null=True, upload_to=finance.models.getcontentDocsPath)),
                ('vendor', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='vendorprofiles', to='ERP.service')),
            ],
        ),
        migrations.CreateModel(
            name='VendorService',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('particular', models.CharField(max_length=100, unique=True)),
                ('rate', models.PositiveIntegerField(default=0, null=True)),
                ('vendorProfile', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='vendorservices', to='finance.VendorProfile')),
            ],
        ),
    ]
