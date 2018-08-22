# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User, Group
from time import time
from ERP.models import service

# Create your models here.

def getdpPath(instance , filename):
    return 'support/customerProfile/DP/%s_%s' % (str(time()).replace('.', '_'), filename)

def getSupportChatAttachment(instance , filename ):
    return 'support/chat/%s_%s' % (str(time()).replace('.', '_'), filename)

def getCustomerAttachments(instance , filename ):
    return 'support/documentations/%s_%s' % (str(time()).replace('.', '_'), filename)


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
    windowColor = models.CharField(max_length = 20 , null = True, default='#000000' )
    dp = models.ImageField(upload_to = getdpPath , null = True)
    name = models.CharField(max_length = 50 , null = True )
    supportBubbleColor = models.CharField(max_length = 20 , null = True ,default='#286EFA')


class SupportChat(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    uid = models.CharField(max_length = 50, null = True)
    attachment = models.FileField(upload_to = getSupportChatAttachment , null = True)
    user = models.ForeignKey(User , related_name = 'supportFile' , null = True)
    message = models.CharField(max_length = 500 , null = True)
    attachmentType =  models.CharField(max_length = 50, null = True)
    sentByAgent = models.BooleanField(default = False)

class Visitor(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    uid = models.CharField(max_length = 50 , null = True )
    email = models.EmailField(null = True)
    name = models.CharField(max_length = 50, null = True , blank = True)
    phoneNumber = models.CharField(max_length = 20, null = True , blank = True)
    notes = models.CharField(max_length = 1000, null = True , blank = True)

class ReviewComment(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    uid = models.CharField(max_length = 50 , null = True )
    user = models.ForeignKey(User , related_name = 'reviewedUser' , null = True)
    message = models.CharField(max_length = 1000 , null = True)
    chatedDate = models.DateField(null=True)

CHATTHREAD_STATUS_CHOICES = (
    ('started' , 'started'),
    ('reviewed' , 'reviewed'),
    ('resolved' , 'resolved'),
    ('archived' , 'archived'),
    ('escalatedL1' , 'escalatedL1'),
    ('escalatedL2' , 'escalatedL2'),
)

class ChatThread(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    uid = models.CharField(max_length = 50 , null = True )
    status = models.CharField(choices = CHATTHREAD_STATUS_CHOICES , max_length = 15 , default = 'started')
    customerRating = models.PositiveSmallIntegerField(null = True,blank=True)
    customerFeedback = models.CharField(max_length = 3000 , null = True )
    company = models.ForeignKey(CustomerProfile , related_name = 'chatThread' , null = False)
    user = models.ForeignKey(User , related_name = 'chatAgentUser' , null = True, blank=True)

class Documentation(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    title = models.CharField(max_length = 200 , null = False )
    customer = models.ForeignKey(CustomerProfile , related_name = 'customerDocumentatios' , null = False)
    text = models.CharField(max_length = 20000 , null = True ,blank=True)
    docs = models.FileField(upload_to = getCustomerAttachments , null = True,blank=True)
