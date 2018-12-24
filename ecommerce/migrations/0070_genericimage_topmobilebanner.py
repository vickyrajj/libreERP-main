# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-11-16 08:18
from __future__ import unicode_literals

from django.db import migrations, models
import ecommerce.models


class Migration(migrations.Migration):

    dependencies = [
        ('ecommerce', '0069_genericimage_topbanner'),
    ]

    operations = [
        migrations.AddField(
            model_name='genericimage',
            name='topMobileBanner',
            field=models.ImageField(null=True, upload_to=ecommerce.models.getEcommerceCenericImageUploadPath),
        ),
    ]