# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2016-10-04 11:00
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('ERP', '0005_application_inmenu'),
    ]

    operations = [
        migrations.CreateModel(
            name='device',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('sshKey', models.CharField(max_length=500, null=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('name', models.CharField(max_length=50)),
            ],
        ),
        migrations.CreateModel(
            name='profile',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('devices', models.ManyToManyField(to='ERP.device')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='gitProfile', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]