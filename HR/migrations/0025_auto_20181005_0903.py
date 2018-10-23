# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2018-10-05 09:03
from __future__ import unicode_literals

import HR.models
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('HR', '0024_auto_20180927_1205'),
    ]

    operations = [
        migrations.CreateModel(
            name='Email',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('dated', models.DateTimeField()),
                ('frm', models.CharField(max_length=300)),
                ('cc', models.CharField(max_length=300)),
                ('toMe', models.BooleanField(default=False)),
                ('spam', models.BooleanField(default=False)),
                ('body', models.CharField(max_length=20000)),
                ('bodyTxt', models.CharField(max_length=10000)),
                ('category', models.CharField(max_length=30, null=True)),
                ('value', models.FloatField(null=True)),
            ],
        ),
        migrations.CreateModel(
            name='EmailAttachment',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200, null=True)),
                ('size', models.CharField(max_length=10, null=True)),
                ('attachment', models.FileField(upload_to=HR.models.getEmailAttachmentPath)),
                ('emailID', models.EmailField(max_length=254)),
            ],
        ),
        migrations.AddField(
            model_name='profile',
            name='gmailAge',
            field=models.DateField(null=True),
        ),
        migrations.AddField(
            model_name='email',
            name='files',
            field=models.ManyToManyField(blank=True, related_name='parent', to='HR.EmailAttachment'),
        ),
        migrations.AddField(
            model_name='email',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='emails', to=settings.AUTH_USER_MODEL),
        ),
    ]
