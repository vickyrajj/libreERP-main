from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
from ERP.models import service
# from HR.serializers import userSearchSerializer
from rest_framework.response import Response
from fabric.api import *
import os
from django.conf import settings as globalSettings
import datetime
from django.contrib.auth.hashers import make_password,check_password

import re
regex = re.compile('^HTTP_')


class CustomerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerProfile
        fields = ( 'pk' , 'created' , 'service', 'chat' , 'call' , 'email', 'videoAndAudio' , 'vr' , 'windowColor' , 'callBack' , 'ticket','dp' ,'name' , 'supportBubbleColor','userApiKey','firstMessage')
    def create(self ,  validated_data):
        c = CustomerProfile(**validated_data)
        c.service = service.objects.get(pk=self.context['request'].data['service'])
        val = '{:%Y-%m-%d %H-%M-%S-%f}'.format(datetime.datetime.now())
        enc = make_password(val)
        print enc
        while '/' in enc:
            print enc,'////////////////'
            enc = make_password(val)
        else:
            print enc
            c.userApiKey=enc
            c.save()
            return c

class SupportChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportChat
        fields = ( 'pk' , 'created' , 'uid', 'attachment' ,'user' ,'message' ,'attachmentType','sentByAgent','responseTime' )
    def create(self ,  validated_data):
        s = SupportChat(**validated_data)
        lstMsg= SupportChat.objects.latest('created')
        s.save()
        responseTime = round((s.created - lstMsg.created).total_seconds()/60.0 , 2)
        if lstMsg.sentByAgent==False and s.sentByAgent==True:
            s.responseTime = responseTime
        s.save()
        chatThObj = ChatThread.objects.filter(uid=s.uid)
        if len(chatThObj)>0 and s.sentByAgent==True:
            print chatThObj[0].firstResponseTime ,'frt'
            if chatThObj[0].firstResponseTime:
                print 'frt is already there'
            else:
                print 'create frt'
                chatThObj[0].firstResponseTime = round((s.created - lstMsg.created).total_seconds()/60.0 , 2)
                chatThObj[0].save()
        return s

class VisitorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visitor
        fields = ( 'pk' , 'created' , 'uid', 'email','name','phoneNumber','notes')

class ReviewCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewComment
        fields = ( 'pk' , 'created' , 'uid', 'user' ,'chatedDate', 'message' )
    def create(self ,  validated_data):
        r = ReviewComment(**validated_data)
        r.user = self.context['request'].user
        r.save()
        return r

class ChatThreadSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatThread
        fields = ( 'pk' , 'created' , 'uid', 'status' , 'customerRating' , 'customerFeedback' , 'company','user','userDevice','userDeviceIp' ,'chatDuration' ,'firstResponseTime')
    def create(self ,  validated_data):
        c = ChatThread(**validated_data)
        c.company = CustomerProfile.objects.get(pk=int(self.context['request'].data['company']))
        browserHeader =  dict((regex.sub('', header), value) for (header, value) in self.context['request'].META.items() if header.startswith('HTTP_'))
        print browserHeader.get('USER_AGENT') , self.context['request'].META.get('REMOTE_ADDR'),'@@@@@@@@@@@2'
        if browserHeader.get('USER_AGENT'):
            c.userDevice = browserHeader.get('USER_AGENT')
        if self.context['request'].META.get('REMOTE_ADDR'):
            c.userDeviceIp = self.context['request'].META.get('REMOTE_ADDR')
        c.save()
        return c
    def update(self ,instance, validated_data):
        print 'cameeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
        if 'status' in self.context['request'].data and instance.status=='started':
            print 'changinggggggggggggggggggg',self.context['request'].data['status']
            uidMsg = SupportChat.objects.filter(uid=instance.uid)
            instance.chatDuration = round((uidMsg[uidMsg.count()-1].created - uidMsg[0].created).total_seconds()/60.0 , 2)
        for key in ['status' , 'customerRating' , 'customerFeedback' , 'company','user']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        if 'user' in self.context['request'].data:
            instance.user = User.objects.get(pk=int(self.context['request'].data['user']))
        instance.save()
        return instance

class DocumentationSerializer(serializers.ModelSerializer):
    version_count = serializers.SerializerMethodField()
    class Meta:
        model = Documentation
        fields = ( 'pk' , 'created','updated' , 'title', 'customer' , 'text' , 'docs' ,'articleOwner' ,'version_count' ,'process')
        read_only_fields = ('process',)
    def get_version_count(self , obj):
        return DocumentVersion.objects.filter(parent=obj.pk).count()

class DocumentVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentVersion
        fields = ( 'pk' , 'created' , 'text', 'parent','title')

class CompanyProcessSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyProcess
        fields = ( 'pk' , 'created' , 'text', 'service')
