# -*- coding: utf-8 -*-

from django.contrib.auth.models import User , Group
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate , login , logout
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse
from django.template import RequestContext
from django.conf import settings as globalSettings
# Related to the REST Framework
from rest_framework import viewsets , permissions , serializers
from rest_framework.exceptions import *
from url_filter.integrations.drf import DjangoFilterBackend
from .serializers import *
from API.permissions import *
from django.db.models import Q,F,Value,CharField
from allauth.account.adapter import DefaultAccountAdapter
from rest_framework.views import APIView
from rest_framework.renderers import JSONRenderer
import requests
import libreERP.Checksum as Checksum
from django.views.decorators.csrf import csrf_exempt
import urllib
import datetime
from Crypto.Cipher import DES
import base64
import hashlib
from Crypto.Cipher import AES
from Crypto import Random
from django.db.models.functions import Concat

BLOCK_SIZE = 16
pad = lambda s: s + (BLOCK_SIZE - len(s) % BLOCK_SIZE) * chr(BLOCK_SIZE - len(s) % BLOCK_SIZE)
unpad = lambda s: s[:-ord(s[len(s) - 1:])]

# Create your views here.

class CustomerProfileViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny,)
    serializer_class = CustomerProfileSerializer
    queryset = CustomerProfile.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['service']

class SupportChatViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny ,)
    serializer_class = SupportChatSerializer
    # queryset = SupportChat.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['uid','user']
    exclude_fields = ['id']
    def get_queryset(self):
        if 'user__isnull' in self.request.GET:
            return SupportChat.objects.filter(user__isnull=True)
        else:
            return SupportChat.objects.all()


class GetMyUser(APIView):
    renderer_classes = (JSONRenderer,)
    def get(self, request, format=None):
        print '****** entered', request.GET
        if 'getMyUser' in request.GET:
            uidsList = list(SupportChat.objects.filter(user = self.request.GET['user']).values_list('uid',flat=True).distinct())
            print uidsList , 'distinct'
            toSend = []
            for i in uidsList:
                try:
                    data = Visitor.objects.get(uid=i)
                    toSend.append({'uid':data.uid,'name':data.name})
                except:
                    toSend.append({'uid':i,'name':''})

            return Response(toSend, status=status.HTTP_200_OK)


class ReviewFilterCalAPIView(APIView):
    renderer_classes = (JSONRenderer,)

    def get(self, request, format=None):
        print '****** entered', request.GET

        toSend = []
        sobj = SupportChat.objects.filter(user__isnull=False)
        if 'date' in self.request.GET:
            date = datetime.datetime.strptime(self.request.GET['date'], '%Y-%m-%d').date()
            sobj = sobj.filter(created__startswith = date)
        if 'user' in self.request.GET:
            sobj = sobj.filter(user = int(self.request.GET['user']))
        # toSend = list(sobj.values())
        agentsList = list(sobj.values_list('user',flat=True).distinct())
        print agentsList
        for i in agentsList:
            agSobj = sobj.filter(user = i)
            if 'email' in self.request.GET:
                uidl = list(Visitor.objects.filter(email=self.request.GET['email']).values_list('uid',flat=True).distinct())
                agUid = list(agSobj.filter(uid__in=uidl).values_list('uid',flat=True).distinct())
            else:
                agUid = list(agSobj.values_list('uid',flat=True).distinct())
            print agUid
            for j in agUid:
                try:
                    email = Visitor.objects.get(uid=j).email
                except:
                    email = ''
                agUidObj = list(agSobj.filter(uid=j).values().annotate(email=Value(email, output_field=CharField()),file=Concat(Value('/media/'),'attachment')))
                toSend.append(agUidObj)
        # print toSend

        return Response(toSend, status=status.HTTP_200_OK)


def encrypt(raw, password):
    private_key = hashlib.sha256(password.encode("utf-8")).digest()
    raw = pad(raw)
    iv = Random.new().read(AES.block_size)
    cipher = AES.new(private_key, AES.MODE_CBC, iv)
    return base64.b64encode(iv + cipher.encrypt(raw))


def decrypt(enc, password):
    private_key = hashlib.sha256(password.encode("utf-8")).digest()
    enc = base64.b64decode(enc)
    iv = enc[:16]
    cipher = AES.new(private_key, AES.MODE_CBC, iv)
    return unpad(cipher.decrypt(enc[16:]))

class getChatterScriptAPI(APIView):
    def get(self , request , format = None):
        pk = request.GET['pk']
        encrypted = encrypt(pk, "cioc")
        print 'ee',encrypted

        while '/' in encrypted:
            encrypted = encrypt(pk, "cioc")

        return Response({'data':encrypted  }, status = status.HTTP_200_OK)

def getChatterScript(request , fileName):
    print fileName
    fileName = fileName.replace('.js' , '').replace("chatter-" , '')
    pk = decrypt(fileName , "cioc")
    print pk
    obj = CustomerProfile.objects.get(pk = pk)
    print 'dpppppppppppp',obj.dp,obj.dp.url
    dataToSend = {"pk" : pk ,'supportBubbleColor':obj.supportBubbleColor, "windowColor" : obj.windowColor , "custName" : obj.service.name , "chat":obj.chat , "callBack":obj.callBack , "videoAndAudio":obj.videoAndAudio , "ticket":obj.ticket , "name" : obj.name , "dp" : obj.dp.url }
    return render(request, 'chatter.js', dataToSend ,content_type="application/x-javascript")

class VisitorViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny,)
    serializer_class = VisitorSerializer
    queryset = Visitor.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['uid','email' ,'name']

class ReviewCommentViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny,)
    serializer_class = ReviewCommentSerializer
    queryset = ReviewComment.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['uid','user','chatedDate']

class ChatThreadViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny,)
    serializer_class = ChatThreadSerializer
    queryset = ChatThread.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['uid','status']
    def get_queryset(self):
        if 'uid' in self.request.GET and 'checkThread' in self.request.GET:
            threadObj = ChatThread.objects.filter(uid = self.request.GET['uid'])
            if threadObj.count()>0:
                print 'sssssssssssssssssssss',threadObj[0].status
                if threadObj[0].status != 'started':
                    print 'nottttttttttttttt',threadObj[0].status
                    raise ValidationError(detail={'PARAMS' : 'createCookie'})
            print 'tttttttttttttttt',threadObj
            return threadObj
        return ChatThread.objects.all()
