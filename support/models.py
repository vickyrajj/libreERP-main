# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User, Group
from time import time
from ERP.models import service

# Create your models here.

def getdpPath(instance , filename):
    return 'support/customerProfile/DP/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)

def getSupportChatAttachment(instance , filename ):
    return 'support/chat/%s_%s' % (str(time()).replace('.', '_'), filename)


class CustomerProfile(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateTimeField(auto_now=True)
    service = models.ForeignKey(service , related_name = 'customerProfile' , null = False)
    chat = models.BooleanField(default = False)
    call = models.BooleanField(default = False)
    callBack = models.BooleanField(default = False)
    ticket = models.BooleanField(default = False)
    email = models.BooleanField(default = False)
    videoAndAudio = models.BooleanField(default = False)
    vr = models.BooleanField(default = False)
    windowColor = models.CharField(max_length = 20 , null = True )
    dp = models.ImageField(upload_to = getdpPath , null = True)
    name = models.CharField(max_length = 50 , null = True )


class SupportChat(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    uid = models.CharField(max_length = 50, null = True)
    attachment = models.FileField(upload_to = getSupportChatAttachment , null = True)
    user = models.ForeignKey(User , related_name = 'supportFile' , null = True)
    message = models.CharField(max_length = 200 , null = True)
    attachmentType =  models.CharField(max_length = 50, null = True)
    sentByAgent = models.BooleanField(default = False)
