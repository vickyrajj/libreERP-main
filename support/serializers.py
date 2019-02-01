from django.contrib.auth.models import User , Group
from HR.serializers import userSearchSerializer
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
from ERP.models import service , permission
# from HR.serializers import userSearchSerializer
from rest_framework.response import Response
from fabric.api import *
import os
from django.conf import settings as globalSettings
import datetime
from django.contrib.auth.hashers import make_password,check_password
from django.core.exceptions import SuspiciousOperation
import requests
import json

import re
regex = re.compile('^HTTP_')


class CustomerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerProfile
        fields = ( 'pk' , 'created' , 'service', 'chat' , 'call' , 'email', 'video' ,'audio', 'vr' ,'fontColor', 'windowColor' , 'callBack' , 'ticket','dp' ,'name' , 'supportBubbleColor','userApiKey','firstMessage','iconColor','chatIconPosition','chatIconType','is_blink','support_icon')
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
        fields = ( 'pk' , 'created' , 'uid', 'attachment' ,'user' ,'message' ,'attachmentType','sentByAgent','responseTime','logs','delivered' ,'read','is_hidden')
    def create(self ,  validated_data):
        s = SupportChat(**validated_data)
        print s.uid ,'uiddddddd'
        lstVisMsg = SupportChat.objects.filter(uid = s.uid, sentByAgent = False)
        s.save()
        if len(SupportChat.objects.all())>0:
            if len(lstVisMsg) > 0 and s.sentByAgent==True:
                for m in lstVisMsg:
                    if m.responseTime:
                        pass
                    else:
                        responseTime = round((s.created - m.created).total_seconds()/60.0 , 2)
                        m.responseTime = responseTime
                        m.save()
                # lstMsg = thisUidMsg[0]
                # responseTime = round((s.created - lstMsg.created).total_seconds()/60.0 , 2)
                # if lstMsg.sentByAgent==False and s.sentByAgent==True:
                #     lstMsg.responseTime = responseTime
                # lstMsg.save()
            chatThObj = ChatThread.objects.filter(uid=s.uid)
            if len(chatThObj)>0:
                chatThObj[0].lastActivity=s.created
                chatThObj[0].save()
            if len(chatThObj)>0 and s.sentByAgent==True and len(lstVisMsg) > 0:
                print chatThObj[0].firstResponseTime ,'frt'
                if chatThObj[0].firstResponseTime:
                    print 'frt is already there'
                else:
                    print 'create frt'
                    chatThObj[0].firstResponseTime = round((s.created - lstVisMsg[0].created).total_seconds()/60.0 , 2)
                    chatThObj[0].save()
        return s

class VisitorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visitor
        fields = ( 'pk' , 'created' , 'uid', 'email','name','phoneNumber','notes')


class ReviewCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewComment
        fields = ( 'pk' , 'created' , 'uid', 'user' ,'chatedDate', 'message','timestamp','visitor_capture','agent_capture' )
    def create(self ,  validated_data):
        print '$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$'
        r = ReviewComment(**validated_data)
        u = self.context['request'].user
        r.user = u
        pObj =  permission.objects.filter(user = u, app__name = 'module.reviews.comment')
        if len(pObj)>0:
            print pObj , u , 'yes perm exist$$$$$$$$'
            r.save()
            print 'yyyyyyyyyyyyyyyyyyy'
            return r
        else:
            print 'dddddddddd'
            raise PermissionDenied()

class ChatThreadSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatThread
        fields = ( 'pk' , 'created' , 'uid', 'status' , 'customerRating' , 'customerFeedback' ,
        'company','user','userDevice','userDeviceIp' ,'chatDuration' ,'firstResponseTime',
        'typ','reviewedOn',"reviewedBy",'closedOn','closedBy','resolvedBy','resolvedOn','archivedOn','archivedBy','escalatedL1On','escalatedL1By','escalatedL2On','escalatedL2By','location')
    def create(self ,  validated_data):
        c = ChatThread(**validated_data)
        c.company = CustomerProfile.objects.get(pk=int(self.context['request'].data['company']))
        browserHeader =  dict((regex.sub('', header), value) for (header, value) in self.context['request'].META.items() if header.startswith('HTTP_'))
        print browserHeader.get('USER_AGENT') , self.context['request'].META.get('REMOTE_ADDR'),'@@@@@@@@@@@2'
        if browserHeader.get('USER_AGENT'):
            c.userDevice = browserHeader.get('USER_AGENT')
        if self.context['request'].META.get('REMOTE_ADDR'):
            c.userDeviceIp = self.context['request'].META.get('REMOTE_ADDR')
            try:
                api1=requests.request('GET',"http://api.ipstack.com/"+c.userDeviceIp+"?access_key=f6e584f19ad6fa9080e0434fb46ae508&format=1")
                # api1=requests.request('GET',"http://api.ipstack.com/43.224.128.172?access_key=f6e584f19ad6fa9080e0434fb46ae508&format=1")
                c.location=json.dumps(api1.json())
            except:
                api2=requests.request('GET','http://ip-api.com/json/'+c.userDeviceIp)
                # api2=requests.request('GET','http://ip-api.com/json/43.224.128.172')
                c.location=json.dumps(api2.json())
        c.save()
        return c
    def update(self ,instance, validated_data):
        print 'cameeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
        if 'status' in self.context['request'].data and instance.status=='started':
            print 'changinggggggggggggggggggg',self.context['request'].data['status']
            uidMsg = SupportChat.objects.filter(uid=instance.uid)
            if len(uidMsg)>0:
                instance.chatDuration = round((uidMsg[uidMsg.count()-1].created - uidMsg[0].created).total_seconds()/60.0 , 2)
        if 'status' in self.context['request'].data:
            if self.context['request'].data['status']=='reviewed':
                print 'reviewed','ggggggggggggggggggggggg'
                instance.reviewedOn = datetime.datetime.now()
                instance.reviewedBy = User.objects.get(pk=int(self.context['request'].user.pk))
                instance.save()
            if self.context['request'].data['status']=='closed':
                print 'closed','ggggggggggggggggggggggg'
                instance.closedOn = datetime.datetime.now()
                if 'closedByUser' in self.context['request'].data:
                    pass
                else:
                    instance.closedBy = User.objects.get(pk=int(self.context['request'].user.pk))
                instance.save()
            if self.context['request'].data['status']=='resolved':
                print 'resolved','ggggggggggggggggggggggg'
                instance.resolvedOn = datetime.datetime.now()
                instance.resolvedBy = User.objects.get(pk=int(self.context['request'].user.pk))
                instance.save()
            if self.context['request'].data['status']=='archived':
                print 'archived','ggggggggggggggggggggggg'
                instance.archivedOn = datetime.datetime.now()
                instance.archivedBy = User.objects.get(pk=int(self.context['request'].user.pk))
                instance.save()
            if self.context['request'].data['status']=='escalatedL1':
                print 'escalatedL1','ggggggggggggggggggggggg'
                instance.escalatedL1On = datetime.datetime.now()
                instance.escalatedL1By = User.objects.get(pk=int(self.context['request'].user.pk))
                instance.save()
            if self.context['request'].data['status']=='escalatedL2':
                print 'escalatedL2','ggggggggggggggggggggggg'
                instance.escalatedL2On = datetime.datetime.now()
                instance.escalatedL2By = User.objects.get(pk=int(self.context['request'].user.pk))
                instance.save()

        for key in ['status' , 'customerRating' , 'customerFeedback' , 'company','user','typ','isLate','location']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        if 'user' in self.context['request'].data:
            instance.user = User.objects.get(pk=int(self.context['request'].data['user']))
        instance.save()

        if 'email' in self.context['request'].data:
            print 'getting email here' , self.context['request'].data['email']
            email = self.context['request'].data['email']
            uid = instance.uid
            vObj = Visitor.objects.filter(uid = uid)
            if len(vObj)>0:
                print 'hree'
                vObj[0].email = email
                vObj[0].save()
            else:
                v = Visitor.objects.create(uid = uid , email = email)
                # Visitor(uid = uid , email = email)
                v.save()

        return instance

class CompanyProcessSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyProcess
        fields = ( 'pk' , 'created' , 'text', 'service')


class DocumentationSerializer(serializers.ModelSerializer):
    version_count = serializers.SerializerMethodField()
    process = CompanyProcessSerializer(many=False , read_only=True)
    articleOwner = userSearchSerializer(many=False , read_only=True)
    class Meta:
        model = Documentation
        fields = ( 'pk' , 'created','updated' , 'title', 'customer' , 'text' , 'docs' ,'articleOwner' ,'version_count' ,'process')
    def get_version_count(self , obj):
        return DocumentVersion.objects.filter(parent=obj.pk).count()
    def create(self ,  validated_data):
        d = Documentation(**validated_data)
        if 'articleOwner' in self.context['request'].data:
            d.articleOwner = User.objects.get(pk=self.context['request'].data['articleOwner'])
        if 'process' in self.context['request'].data:
            d.process = CompanyProcess.objects.get(pk=self.context['request'].data['process'])
        d.save()
        return d
    def update(self ,instance, validated_data):
        for key in ['title' , 'customer' , 'text' , 'docs']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        if 'articleOwner' in self.context['request'].data:
            instance.articleOwner = User.objects.get(pk=self.context['request'].data['articleOwner'])
        if 'process' in self.context['request'].data:
            instance.process = CompanyProcess.objects.get(pk=self.context['request'].data['process'])
        instance.save()
        return instance


class DocumentVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentVersion
        fields = ( 'pk' , 'created' , 'text', 'parent','title','user')
    def create(self ,  validated_data):
        d = DocumentVersion(**validated_data)
        d.user = self.context['request'].user
        d.save()
        return d

class CannedResponsesSerializer(serializers.ModelSerializer):
    class Meta:
        model = CannedResponses
        fields = ( 'pk' , 'created' , 'text' ,'service')
    def create(self ,  validated_data):
        c = CannedResponses(**validated_data)
        u = self.context['request'].user
        pObj =  permission.objects.filter(user = u, app__name = 'module.prescript.createDelete')
        if len(pObj)>0:
            c.save()
            return c
        else:
            raise PermissionDenied()

class DynamicFormSerializer(serializers.ModelSerializer):
    class Meta:
        model = DynamicForm
        fields = ( 'pk' , 'created','updated' , 'user' ,'company', 'form_name', 'function_name' , 'form_description')

class DynamicFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = DynamicField
        fields = ( 'pk' , 'created' , 'form' ,'field_typ', 'parameters', 'field_name', 'key', 'is_required')
