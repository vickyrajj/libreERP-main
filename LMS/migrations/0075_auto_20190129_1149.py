# -*- coding: utf-8 -*-
# Generated by Django 1.11.17 on 2019-01-29 11:49
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('LMS', '0074_merge_20190129_0951'),
    ]

    operations = [
        migrations.CreateModel(
            name='PaperattemptHistory',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('mark', models.FloatField()),
            ],
        ),
        migrations.AlterModelOptions(
            name='notessection',
            options={'ordering': ['sequence']},
        ),
        migrations.AddField(
            model_name='paper',
            name='description',
            field=models.TextField(null=True),
        ),
        migrations.AddField(
            model_name='paper',
            name='level',
            field=models.CharField(choices=[('easy', 'easy'), ('moderate', 'moderate'), ('difficult', 'difficult')], max_length=15, null=True),
        ),
        migrations.AddField(
            model_name='paperattempthistory',
            name='paper',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='paperAttempted', to='LMS.Paper'),
        ),
        migrations.AddField(
            model_name='paperattempthistory',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='attemptedUser', to=settings.AUTH_USER_MODEL),
        ),
    ]