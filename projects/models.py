from __future__ import unicode_literals

from django.contrib.auth.models import *
from django.db import models
import datetime
import django.utils.timezone
from django.db.models.signals import post_save , pre_delete
from django.dispatch import receiver
import requests
from django.conf import settings as globalSettings
# Create your models here.
from time import time
from finance.models import CostCenter , ExpenseSheet , Account , ExpenseHeading


def getProjectsUploadsPath(instance , filename ):
    return 'projects/doc/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)

def getcontentFilePath(instance , filename ):
    return 'projects/issue/%s_%s__%s' % (str(time()).replace('.', '_'), instance.title, filename)

def getPettyCashInvoicePath(instance , filename ):
    return 'projects/pettyExpense/%s_%s__%s' % (str(time()).replace('.', '_'), instance.title, filename)

MEDIA_TYPE_CHOICES = (
    ('onlineVideo' , 'onlineVideo'),
    ('video' , 'video'),
    ('image' , 'image'),
    ('onlineImage' , 'onlineImage'),
    ('doc' , 'doc'),
)

class media(models.Model):
    user = models.ForeignKey(User , related_name = 'projectsUploads' , null = False)
    created = models.DateTimeField(auto_now_add = True)
    link = models.TextField(null = True , max_length = 300) # can be youtube link or an image link
    attachment = models.FileField(upload_to = getProjectsUploadsPath , null = True ) # can be image , video or document
    mediaType = models.CharField(choices = MEDIA_TYPE_CHOICES , max_length = 10 , default = 'image')
    name = models.CharField(max_length = 100 , null = True)

class comment(models.Model):
    created = models.DateTimeField (auto_now_add = True,null = True)
    user = models.ForeignKey(User, null = False , related_name='projectsComment')
    text = models.TextField(max_length=200 , null=True)
    media = models.ForeignKey(media , null = True)

class project(models.Model):
    user = models.ForeignKey(User , null = False , related_name='projectsInitiated') # the creator
    dueDate = models.DateTimeField(null = False)
    created = models.DateTimeField (auto_now_add = True)
    title = models.CharField(blank = False , max_length = 200)
    description = models.TextField(max_length=2000 , blank=False)
    files = models.ManyToManyField(media , related_name='projects')
    team = models.ManyToManyField(User , related_name = 'projectsInvolvedIn')
    costCenter = models.ForeignKey(CostCenter , null = True , related_name='projects')
    expenseSheets = models.ManyToManyField(ExpenseSheet , related_name='project')
    invoices = models.ManyToManyField(ExpenseSheet , related_name='projects')

class projectComment(comment):
    project = models.ForeignKey(project , null= False , related_name='comments')

TIMELINE_ITEM_CATEGORIES = (
    ('message' , 'message'),
    ('file' , 'file'),
    ('system' , 'system'),
)

class timelineItem(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    user =  models.ForeignKey(User , null = True, related_name='projectsTimelineItems')
    category = models.CharField(choices = TIMELINE_ITEM_CATEGORIES , max_length = 50 , default = 'message')
    project = models.ForeignKey(project , null = False)
    text = models.TextField(max_length=2000 , null=True)




#--------------------------projects issues model --====-=-=-=-=-=-=-=-=-

ISSUES_ITEM_PRIORITY = (
    ('high', 'high'),
    ('medium', 'medium'),
    ('low', 'low'),
)
ISSUES_ITEM_RESULT = (
    ('resolved','resolved'),
    ('partial','partial'),
    ('parked','parked'),
)
ISSUES_ITEM_STATUS = (
    ('inprogress','inprogress'),
    ('created','created'),
    ('resolved','resolved'),
    ('stuck','stuck'),

)

class Issues(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    title = models.CharField(max_length = 50, null = False)
    project = models.ForeignKey(project, null= False, related_name='projectsIssue')
    status = models.CharField(choices = ISSUES_ITEM_STATUS , max_length = 50,default='created')
    responsible = models.ForeignKey(User, null= True, related_name='projectsIssueResponsible')
    tentresdt = models.DateField(auto_now = False, auto_now_add =False)  #tentative result
    priority = models.CharField(choices = ISSUES_ITEM_PRIORITY , max_length = 50)
    result = models.CharField(choices = ISSUES_ITEM_RESULT , max_length = 50,null=True)
    resultComments = models.CharField(max_length=500 , null = True, blank=False)
    description = models.CharField(max_length=500 , null = True)
    file = models.FileField(upload_to = getcontentFilePath ,  null = True , blank = True)

class ProjectPettyExpense(models.Model): # also petty cash
    created = models.DateTimeField(auto_now_add=True)
    ammount = models.PositiveIntegerField()
    project = models.ForeignKey(project , null = True , related_name='expenses')
    account = models.ForeignKey(Account , null = True , related_name='pettyCashExpenses')
    description = models.TextField(max_length=200 , null = True)
    heading = models.ForeignKey(ExpenseHeading , null = True , related_name='pettyExpense')
    attachment = models.FileField(upload_to = getPettyCashInvoicePath ,  null = True)
    createdUser = models.ForeignKey(User, null= True, related_name='userExpense')
