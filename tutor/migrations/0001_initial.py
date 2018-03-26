# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-03-26 09:19
from __future__ import unicode_literals

from django.conf import settings
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion
import tutor.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('LMS', '0022_auto_20180216_0811'),
    ]

    operations = [
        migrations.CreateModel(
            name='Profile',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('school', models.CharField(choices=[('S', 'School'), ('C', 'College')], default='S', max_length=10)),
                ('schoolName', models.CharField(max_length=100, null=True)),
                ('standard', models.CharField(choices=[('1', 'Class 1'), ('2', 'Class 2'), ('3', 'Class 3'), ('4', 'Class 4'), ('5', 'Class 5'), ('6', 'Class 6'), ('7', 'Class 7'), ('8', 'Class 8'), ('9', 'Class 9'), ('10', 'Class 10'), ('11', 'Class 11'), ('12', 'Class 12'), ('13', 'Class 13'), ('14', 'Class 14'), ('15', 'Class 15')], default='1', max_length=10)),
                ('street', models.TextField(max_length=100, null=True)),
                ('city', models.CharField(max_length=25, null=True)),
                ('pinCode', models.IntegerField(null=True)),
                ('state', models.CharField(max_length=20, null=True)),
                ('country', models.CharField(max_length=20, null=True)),
                ('balance', models.IntegerField(null=True)),
                ('typ', models.CharField(choices=[('S', 'Student'), ('T', 'Tutor')], default='S', max_length=10)),
            ],
        ),
        migrations.CreateModel(
            name='Session',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('start', models.DateTimeField(auto_now_add=True)),
                ('end', models.DateTimeField()),
                ('attachments', models.FileField(null=True, upload_to=tutor.models.getAttachmentPath)),
                ('initialQuestion', models.CharField(max_length=4000)),
                ('minutes', models.IntegerField(null=True)),
                ('idle', models.IntegerField(null=True)),
                ('ratings', models.IntegerField(null=True, validators=[django.core.validators.MaxValueValidator(5), django.core.validators.MinValueValidator(1)])),
                ('ratingComments', models.CharField(max_length=1000, null=True)),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='studentSession', to=settings.AUTH_USER_MODEL)),
                ('subject', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sessionSubject', to='LMS.Subject')),
                ('topic', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sessionTopic', to='LMS.Topic')),
                ('tutor', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tutorSession', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Transaction',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('ref_id', models.IntegerField(null=True)),
                ('mid', models.CharField(max_length=50)),
                ('status', models.CharField(max_length=20)),
                ('source', models.CharField(max_length=50)),
                ('amount', models.IntegerField(null=True)),
                ('txn_id', models.CharField(max_length=50, null=True)),
                ('bank_refno', models.CharField(max_length=50, null=True)),
                ('name', models.CharField(max_length=60, null=True)),
                ('email', models.EmailField(max_length=254, null=True)),
                ('mobile', models.CharField(max_length=14, null=True)),
                ('Product_info', models.CharField(max_length=60, null=True)),
                ('before', models.PositiveIntegerField(null=True)),
                ('after', models.PositiveIntegerField(null=True)),
                ('value', models.PositiveIntegerField(null=True)),
                ('promoCode', models.CharField(max_length=10, null=True)),
                ('discount', models.FloatField(null=True)),
            ],
        ),
    ]
