# -*- coding: utf-8 -*-
# Generated by Django 1.11.16 on 2018-11-01 04:42
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('projects', '0004_auto_20181101_0441'),
    ]

    operations = [
        migrations.CreateModel(
            name='issues',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('title', models.CharField(max_length=50)),
                ('status', models.CharField(choices=[('created', 'created'), ('resolved', 'resolved'), ('stuck', 'stuck')], max_length=50)),
                ('tentresdt', models.DateField()),
                ('priority', models.CharField(choices=[('high', 'high'), ('medium', 'medium'), ('low', 'low')], max_length=50)),
                ('result', models.CharField(choices=[('high', 'high'), ('medium', 'medium'), ('low', 'low')], max_length=50)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='projectsIssue', to='projects.project')),
                ('responder', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='projectsIssueResponder', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
