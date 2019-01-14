# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2019-01-14 06:50
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('projects', '0020_project_invoices'),
    ]

    operations = [
        migrations.AddField(
            model_name='projectpettyexpense',
            name='createdUser',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='userExpense', to=settings.AUTH_USER_MODEL),
        ),
    ]
