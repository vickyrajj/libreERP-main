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


class CustomerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerProfile
        fields = ( 'pk' , 'created' , 'service', 'chat' , 'call' , 'email', 'videoAndAudio' , 'vr' , 'windowColor' , 'callBack' , 'ticket','dp' ,'name' , 'supportBubbleColor')
    def create(self ,  validated_data):
        c = CustomerProfile(**validated_data)
        c.service = service.objects.get(pk=self.context['request'].data['service'])
        c.save()
        return c

class SupportChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportChat
        fields = ( 'pk' , 'created' , 'uid', 'attachment' ,'user' ,'message' ,'attachmentType','sentByAgent' )

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
        fields = ( 'pk' , 'created' , 'uid', 'status' , 'customerRating' , 'customerFeedback' , 'company')
    def create(self ,  validated_data):
        c = ChatThread(**validated_data)
        c.company = CustomerProfile.objects.get(pk=int(self.context['request'].data['company']))
        c.save()
        return c
