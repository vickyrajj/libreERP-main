# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-12-11 14:07
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tools', '0010_auto_20181208_0627'),
    ]

    operations = [
        migrations.CreateModel(
            name='ApiKeyRegistration',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('email', models.EmailField(blank=True, max_length=254, null=True, unique=True)),
                ('email_otp', models.CharField(max_length=6, null=True)),
                ('verified', models.BooleanField(default=False)),
                ('emailApiKey', models.CharField(max_length=50, null=True)),
            ],
        ),
    ]
