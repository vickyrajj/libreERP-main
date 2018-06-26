# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-06-08 13:01
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('marketing', '0012_auto_20180608_0948'),
    ]

    operations = [
        migrations.CreateModel(
            name='CampaignLogs',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('followupDate', models.DateField(blank=True, null=True)),
                ('data', models.CharField(blank=True, max_length=1000, null=True)),
                ('typ', models.CharField(choices=[('inbound', 'inbound'), ('outbound', 'smoutbounds'), ('emailSent', 'emailSent'), ('emailRecieved', 'emailRecieved'), ('smsSent', 'smsSent'), ('smsRecieved', 'smsRecieved'), ('task', 'task'), ('comment', 'comment'), ('closed', 'closed'), ('converted', 'converted')], max_length=20, null=True)),
                ('campaign', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='CampaignLogs', to='marketing.Campaign')),
                ('contact', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='CampaignLogs', to='marketing.Contacts')),
                ('user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='CampaignLogs', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
