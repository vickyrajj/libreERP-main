# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User
# Create your models here.
from time import time

def getPOSProductUploadPath(instance,filename):
    return "POS/displayPictures/%s_%s_%s"% (str(time()).replace('.','_'),instance.user.username,filename)

class Customer(models.Model):
    user = models.ForeignKey(User , related_name = 'posContacts' , null = False) # the user created it
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateTimeField(auto_now=True)
    name = models.CharField(max_length = 100 , null = False)
    company = models.CharField(max_length = 100 , null = True)
    email = models.EmailField(null = True)
    mobile = models.CharField(max_length = 12 , null = True)
    notes = models.TextField(max_length=300 , null=True)
    pan = models.CharField(max_length = 100 , null = True)
    gst = models.CharField(max_length = 100 , null = True)
    street = models.CharField(max_length = 100 , null = True)
    city = models.CharField(max_length = 100 , null = True)
    state = models.CharField(max_length = 100 , null = True)
    pincode = models.CharField(max_length = 100 , null = True)
    country = models.CharField(max_length = 100 , null = True)
    sameAsShipping = models.BooleanField(default = False)
    streetBilling = models.CharField(max_length = 100 , null = True)
    cityBilling = models.CharField(max_length = 100 , null = True)
    stateBilling = models.CharField(max_length = 100 , null = True)
    pincodeBilling = models.CharField(max_length = 100 , null = True)
    countryBilling = models.CharField(max_length = 100 , null = True)


class Product(models.Model):
    user = models.ForeignKey(User , related_name = 'posProducts' , null = False) # the user created it
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateTimeField(auto_now=True)
    name = models.CharField(max_length = 100 , null = False)
    hsnCode = models.CharField(max_length = 100 , null=False)
    price = models.FloatField(null=False)
    displayPicture = models.ImageField(upload_to=getPOSProductUploadPath,null=True)
    serialNo = models.CharField(max_length = 30, null=False)
    description = models.TextField(max_length=300,null=False)
    inStock = models.PositiveIntegerField(default = 0)
