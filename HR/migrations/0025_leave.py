# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-05-01 05:32
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('HR', '0024_auto_20180416_1044'),
    ]

    operations = [
        migrations.CreateModel(
            name='Leave',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fromDate', models.DateField(null=True)),
                ('toDate', models.DateField(null=True)),
                ('days', models.PositiveIntegerField(null=True)),
                ('approved', models.CharField(max_length=30, null=True)),
                ('category', models.CharField(choices=[(b'AL', b'AL'), (b'ML', b'ML'), (b'casual', b'casual')], max_length=100)),
                ('comment', models.CharField(max_length=10000, null=True)),
                ('approvedStage', models.PositiveIntegerField(default=0, null=True)),
                ('approvedMatrix', models.PositiveIntegerField(default=1, null=True)),
                ('approvedBy', models.ManyToManyField(blank=True, related_name='leaves', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]