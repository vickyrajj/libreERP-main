# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2016-01-09 16:12
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ecommerce', '0006_auto_20160109_1911'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='listing',
            name='files',
        ),
        migrations.AddField(
            model_name='listing',
            name='files',
            field=models.ManyToManyField(null=True, related_name='listings', to='ecommerce.media'),
        ),
        migrations.AlterField(
            model_name='listing',
            name='priceModel',
            field=models.CharField(choices=[('quantity', 'quantity'), ('weight', 'weight'), ('time', 'time'), ('custom', 'custom')], default='quantity', max_length=15),
        ),
        migrations.AlterField(
            model_name='media',
            name='mediaType',
            field=models.CharField(choices=[('onlineVideo', 'onlineVideo'), ('video', 'video'), ('image', 'image'), ('doc', 'doc')], default='image', max_length=10),
        ),
    ]
