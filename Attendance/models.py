# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

# Create your models here.


###----- model for calendar-------

def getCalendarAttachment(instance , filename ):
    return 'calendar/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, instance.originator.username, filename)

from clientRelationships.models import Contact
class calendar(models.Model):

    def __str__(self):
        return self.filename
