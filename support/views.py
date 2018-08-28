# -*- coding: utf-8 -*-

from django.contrib.auth.models import User , Group
from django.shortcuts import render, redirect,HttpResponse
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
from django.contrib.auth.hashers import make_password,check_password
from excel_response import ExcelResponse
# import libreERP.Checksum as Checksum
from django.views.decorators.csrf import csrf_exempt
import urllib
import datetime
from Crypto.Cipher import DES
import base64
import hashlib
from Crypto.Cipher import AES
from Crypto import Random
from django.db.models.functions import Concat
from ERP.models import service
import re
regex = re.compile('^HTTP_')

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
    permission_classes = (permissions.AllowAny,)
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
        if 'allAgents' in request.GET:
            print '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%'
            allAgents = list(User.objects.exclude(pk=self.request.user.pk).values_list('pk',flat=True))
            print allAgents,type(allAgents)
            return Response({'allAgents':allAgents}, status=status.HTTP_200_OK)
        if 'getMyUser' in request.GET:
            # uidsList = list(SupportChat.objects.filter(user = self.request.GET['user']).values_list('uid',flat=True).distinct())
            uidsList = list(ChatThread.objects.filter(user = self.request.GET['user'],status='started').values_list('uid',flat=True).distinct())
            print uidsList , 'distinct'
            toSend = []
            # chatThreadObjs = ChatThread.objects.filter(uid__in=uidsList)
            for i in uidsList:
                try:
                    data = Visitor.objects.get(uid=i)
                    dic = {'uid':data.uid,'name':data.name ,'email':data.email}
                except:
                    dic = {'uid':i,'name':'' ,'email':''}
                # print ChatThread.objects.get(uid=i).company.pk
                dic['companyPk'] = ChatThread.objects.get(uid=i).company.pk
                dic['chatThreadPk'] = ChatThread.objects.get(uid=i).pk
                toSend.append(dic)


            return Response(toSend, status=status.HTTP_200_OK)


class ReviewFilterCalAPIView(APIView):
    renderer_classes = (JSONRenderer,)

    def get(self, request, format=None):
        print '****** entered', request.GET

        toSend = []
        res = []
        sobj = SupportChat.objects.filter(user__isnull=False)
        if 'customer' in self.request.GET:
            userCompany = list(service.objects.filter(contactPerson=self.request.user).values_list('pk',flat=True).distinct())
            userCustProfile = list(CustomerProfile.objects.filter(service__in=userCompany).values_list('pk',flat=True).distinct())
            if 'customerProfilePkList' in self.request.GET:
                print 'a###############',userCustProfile
                return Response(userCustProfile, status=status.HTTP_200_OK)
            userCompanyUidList = list(ChatThread.objects.filter(company__in=userCustProfile).values_list('uid',flat=True).distinct())
            print userCompany
            print userCustProfile
            print userCompanyUidList
            sobj = SupportChat.objects.filter(uid__in=userCompanyUidList)

        if 'date' in self.request.GET:
            date = datetime.datetime.strptime(self.request.GET['date'], '%Y-%m-%d').date()
            sobj = sobj.filter(created__startswith = date)
        if 'user' in self.request.GET:
            sobj = sobj.filter(user = int(self.request.GET['user']))
        if 'client' in self.request.GET:
            userCustProfile = list(CustomerProfile.objects.filter(service=self.request.GET['client']).values_list('pk',flat=True).distinct())
            userCompanyUidList = list(ChatThread.objects.filter(company__in=userCustProfile).values_list('uid',flat=True).distinct())
            print userCustProfile,userCompanyUidList
            sobj = sobj.filter(uid__in=userCompanyUidList)
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
                try:
                    company = ChatThread.objects.get(uid=j).company.service.name
                except:
                    company = ''
                print company
                agUidObj = list(agSobj.filter(uid=j).values().annotate(company=Value(company, output_field=CharField()),email=Value(email, output_field=CharField()),file=Concat(Value('/media/'),'attachment')))
                toSend.append(agUidObj)
                res = res + list(agSobj.filter(uid=j).values('uid','user','message','attachment','attachmentType').annotate(company=Value(company, output_field=CharField()),email=Value(email, output_field=CharField())))
        print toSend
        if 'download' in self.request.GET:
            print 'downloadddddddddddddddddddddddd'
            # res = []
            # for i in toSend:
            #     res = res + i
            return ExcelResponse(res)

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

class GetChatterScriptAPI(APIView):
    def get(self , request , format = None):
        print '*******************************************'
        pk = request.GET['pk']
        encrypted = encrypt(pk, "cioc")
        print 'ee',encrypted

        while '/' in encrypted:
            encrypted = encrypt(pk, "cioc")

        return Response({'data':encrypted  }, status = status.HTTP_200_OK)

class GetChatHistory(APIView):
    def get(self , request , format = None):
        if 'email' in request.GET:
            toSend = []
            email = request.GET['email']
            print email,'77777777777777777777'
            uidList = list(Visitor.objects.filter(email=email).values_list('uid',flat=True).distinct())
            print uidList
            for uid in uidList:
                chatList = list(SupportChat.objects.filter(uid=uid).values().annotate(file=Concat(Value('/media/'),'attachment')))
                agentList = list(SupportChat.objects.filter(uid=uid).values_list('user',flat=True).distinct())

                # print agentList,chatList
                toSend.append({'agentList':agentList,'chatList':chatList})
            return Response({'data':toSend}, status = status.HTTP_200_OK)
        else:
            return Response({}, status = status.HTTP_200_OK)


def getChatterScript(request , fileName):
    print fileName,'*****************'
    fileName = fileName.replace('.js' , '').replace("chatter-" , '')
    pk = decrypt(fileName , "cioc")
    print pk
    obj = CustomerProfile.objects.get(pk = pk)
    serviceWebsite = obj.service.web
    browserHeader =  dict((regex.sub('', header), value) for (header, value) in request.META.items() if header.startswith('HTTP_'))
    print browserHeader
    print request.META.get('HTTP_X_FORWARDED_FOR') , request.META.get('REMOTE_ADDR')
    print '**************8',browserHeader['REFERER'],serviceWebsite

    print globalSettings.SITE_ADDRESS
    print request.get_host()
    print request.META.get('REMOTE_ADDR')
    dataToSend = {"pk" : obj.pk ,'supportBubbleColor':obj.supportBubbleColor, "windowColor" : obj.windowColor , "custName" : obj.service.name , "chat":obj.chat , "callBack":obj.callBack , "videoAndAudio":obj.videoAndAudio , "ticket":obj.ticket , "serverAddress" : globalSettings.SITE_ADDRESS}
    if obj.dp:
        dataToSend["dp"] =  obj.dp.url
    if obj.name:
        dataToSend["name"] =  obj.name

    if obj.firstMessage:

        dataToSend["firstMessage"] =  obj.firstMessage
        print obj.firstMessage



    # return render(request, 'chatter.js', dataToSend ,content_type="application/x-javascript")
    if serviceWebsite in browserHeader['REFERER']:
        return render(request, 'chatter.js', dataToSend ,content_type="application/x-javascript")
    else:
        # return HttpResponse(request,'')
        return render(request, 'chatter.js', dataToSend ,content_type="application/x-javascript")



class VisitorViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny,)
    serializer_class = VisitorSerializer
    queryset = Visitor.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['uid','email' ,'name']

class ReviewCommentViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
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

class DocumentationViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny,)
    serializer_class = DocumentationSerializer
    queryset = Documentation.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['title','customer']

class GetChatTranscriptsViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny,)
    serializer_class = ChatThreadSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['uid','status']
    def get_queryset(self):
        if 'apiKey' in self.request.GET:
            try:
                print '*****************',self.request.GET['apiKey']
                userExit = CustomerProfile.objects.get(userApiKey=self.request.GET['apiKey'])
                return ChatThread.objects.all()
            except:
                print 'errorrrrrrrrr'
                raise PermissionDenied()
        else:
            print 'not enter apikey'
            raise PermissionDenied()

class GetVisitorDetailsViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny,)
    serializer_class = VisitorSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['uid','email' ,'name']
    def get_queryset(self):
        if 'apiKey' in self.request.GET:
            try:
                print '*****************',self.request.GET['apiKey']
                userExit = CustomerProfile.objects.get(userApiKey=self.request.GET['apiKey'])
                return Visitor.objects.all()
            except:
                print 'errorrrrrrrrr'
                raise PermissionDenied()
        else:
            print 'not enter apikey'
            raise PermissionDenied()

class GetOfflineMessagesViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny,)
    serializer_class = SupportChatSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['uid','user']
    exclude_fields = ['id']
    def get_queryset(self):
        # userObj = User.objects.get(pk=1)
        # print 'userrrrrrrrrrrrrr',userObj
        if 'apiKey' in self.request.GET:
            try:
                print '*****************',self.request.GET['apiKey']
                userExit = CustomerProfile.objects.get(userApiKey=self.request.GET['apiKey'])
                return SupportChat.objects.filter(user__isnull=True)
            except:
                print 'errorrrrrrrrr'
                raise PermissionDenied()
        else:
            print 'not enter apikey'
            raise PermissionDenied()
