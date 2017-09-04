# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2017-09-01 04:49
from __future__ import unicode_literals

import clientRelationships.models
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('clientRelationships', '0002_auto_20170831_1210'),
    ]

    operations = [
        migrations.CreateModel(
            name='Activity',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('typ', models.CharField(choices=[('call', 'call'), ('meeting', 'meeting'), ('onlineConf', 'onlineConf'), ('lunch', 'lunch'), ('mail', 'mail'), ('todo', 'todo')], default='call', max_length=11)),
                ('data', models.CharField(max_length=300)),
                ('notes', models.TextField(max_length=1000, null=True)),
                ('contact', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='activities', to='clientRelationships.Contact')),
                ('deal', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='activities', to='clientRelationships.Deal')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='activities', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AlterField(
            model_name='contract',
            name='doc',
            field=models.FileField(upload_to=clientRelationships.models.getClientRelationshipContract),
        ),
    ]