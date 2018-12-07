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
import os
from os import path
import datetime
from datetime import timedelta
from Crypto.Cipher import DES
import base64
import hashlib
from Crypto.Cipher import AES
from Crypto import Random
from django.db.models.functions import Concat
from ERP.models import service
from django.template.loader import render_to_string, get_template
from django.core.mail import send_mail, EmailMessage
from django.utils import timezone
import re
regex = re.compile('^HTTP_')

BLOCK_SIZE = 16
pad = lambda s: s + (BLOCK_SIZE - len(s) % BLOCK_SIZE) * chr(BLOCK_SIZE - len(s) % BLOCK_SIZE)
unpad = lambda s: s[:-ord(s[len(s) - 1:])]

from openpyxl import Workbook
from openpyxl.styles import Font
from openpyxl.utils import get_column_letter
from dateutil.relativedelta import relativedelta
from django.db.models import Sum, Count, Avg
from .models import *

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
                # dic['companyPk'] = ChatThread.objects.get(uid=i).company.pk
                # dic['chatThreadPk'] = ChatThread.objects.get(uid=i).pk
                dic['companyPk'] = ChatThread.objects.filter(uid=i)[0].company.pk
                dic['chatThreadPk'] = ChatThread.objects.filter(uid=i)[0].pk
                dic['servicePk'] = service.objects.filter(pk = dic['companyPk'])[0].pk
                print dic
                toSend.append(dic)
            return Response(toSend, status=status.HTTP_200_OK)
        if 'getNewUser' in request.GET:
            print 'getNewUser'
            time_threshold = datetime.datetime.now() - timedelta(hours=4)
            # results = Widget.objects.filter(created__lt=time_threshold)
            uidsList = list(ChatThread.objects.filter(user__isnull = True ,status='started' , created__gt = time_threshold).values_list('uid',flat=True).distinct())
            toSend = []
            for i in uidsList:
                try:
                    data = Visitor.objects.get(uid=i)
                    dic = {'uid':data.uid,'name':data.name ,'email':data.email}
                except:
                    dic = {'uid':i,'name':'' ,'email':''}
                dic['companyPk'] = ChatThread.objects.filter(uid=i)[0].company.pk
                dic['chatThreadPk'] = ChatThread.objects.filter(uid=i)[0].pk
                dic['servicePk'] = service.objects.filter(pk = dic['companyPk'])[0].pk
                # print dic['me']
                # print Support.objects.filter(uid = i).count() , 'CCCCCCCCCCCCCCCCCCCC'
                toSend.append(dic)
            print toSend , 'FFFFFFFFFFFFFFFF'
            return Response(toSend, status=status.HTTP_200_OK)


def createExcel(data):
    wb = Workbook()

    # dest_filename = 'empty_book.xlsx'
    ws1 = wb.active
    ws1.title = "UID Wise"
    heading = ['UID','Email','Company','User Message','Agent Message',]
    heading_font = Font(bold=True, size=14)
    ws1.append(heading)
    print ws1.column_dimensions,'widthhhhhhhhhhhhhhhhhhhh'
    for idx,cell in enumerate(ws1["1:1"]):
        cell.font = heading_font
        ws1.column_dimensions[get_column_letter(idx+1)].width = 25 if idx<3 else 50
    uidList = []

    for row in data:
        dt = 'MEDIA ('+row['attachmentType'] +' )' if row['attachmentType'] else row['message']
        if row['uid'] in uidList:
            if row['sentByAgent']:
                ws1.append(['','','','',dt])
            else:
                ws1.append(['','','',dt,''])
        else:
            if len(uidList)>0:
                ws1.append(['','','','','',''])
                ws1.append(['','','','','',''])
                ws1.append(['','','','','',''])
            uidList.append(row['uid'])
            if row['sentByAgent']:
                ws1.append([row['uid'],row['email'],row['company'],'',dt])
            else:
                ws1.append([row['uid'],row['email'],row['company'],dt,''])

    # ws2 = wb.create_sheet(title="Pi")
    #
    # ws2['F5'] = 3.14
    #
    # ws3 = wb.create_sheet(title="Data")
    # for row in range(10, 20):
    #     for col in range(27, 54):
    #         _ = ws3.cell(column=col, row=row, value="{0}".format(get_column_letter(col)))
    # print(ws3['AA10'].value)
    # wb.save(filename = dest_filename)
    return wb

class ReviewFilterCalAPIView(APIView):
    renderer_classes = (JSONRenderer,)

    def get(self, request, format=None):
        print '****** entered', request.GET

        toSend = []
        res = []
        sobj = SupportChat.objects.all()
        if 'customer' in self.request.GET:
            userCompany = list(service.objects.filter(contactPerson=self.request.user).values_list('pk',flat=True).distinct())
            userCustProfile = list(CustomerProfile.objects.filter(service__in=userCompany).values_list('pk',flat=True).distinct())
            if 'customerProfilePkList' in self.request.GET:
                # print 'a###############',userCustProfile
                return Response(userCustProfile, status=status.HTTP_200_OK)
            userCompanyUidList = list(ChatThread.objects.filter(company__in=userCustProfile).values_list('uid',flat=True).distinct())
            # print userCompany
            # print userCustProfile
            # print userCompanyUidList
            sobj = SupportChat.objects.filter(uid__in=userCompanyUidList)
        if 'getMyReviews' in self.request.GET:
            sobj = sobj.filter(user = self.request.user)
        if 'date' in self.request.GET:
            date = datetime.datetime.strptime(self.request.GET['date'], '%Y-%m-%d').date()
            sobj = sobj.filter(created__startswith = date)
        if 'user' in self.request.GET:
            sobj = sobj.filter(user = int(self.request.GET['user']))
        if 'client' in self.request.GET:
            userCustProfile = list(CustomerProfile.objects.filter(service=self.request.GET['client']).values_list('pk',flat=True).distinct())
            userCompanyUidList = list(ChatThread.objects.filter(company__in=userCustProfile).values_list('uid',flat=True).distinct())
            # print userCustProfile,userCompanyUidList
            sobj = sobj.filter(uid__in=userCompanyUidList)
        # toSend = list(sobj.values())
        uidL = list(sobj.values_list('uid',flat=True).distinct())
        if 'status' in self.request.GET:
            if self.request.GET['status']=='archived':
                agentsList = list(ChatThread.objects.filter(status='archived',uid__in=uidL).values_list('user',flat=True).distinct())
        else:
            agentsList = list(ChatThread.objects.filter(~Q(status='archived'),uid__in=uidL).values_list('user',flat=True).distinct())
        # print agentsList
        for i in agentsList:
            if 'status' in self.request.GET:
                if self.request.GET['status']=='archived':
                    agentuidList = list(ChatThread.objects.filter(status='archived',user=i).values_list('uid',flat=True).distinct())
            else:
                agentuidList = list(ChatThread.objects.filter(~Q(status='archived'),user=i).values_list('uid',flat=True).distinct())
            agSobj = sobj.filter(uid__in = agentuidList)
            if 'email' in self.request.GET:
                uidl = list(Visitor.objects.filter(email=self.request.GET['email']).values_list('uid',flat=True).distinct())
                agUid = list(agSobj.filter(uid__in=uidl).values_list('uid',flat=True).distinct())
            else:
                agUid = list(agSobj.values_list('uid',flat=True).distinct())
            # print agUid
            for j in agUid:
                cmntDate =  sobj.filter(uid = j)[0].created
                try:
                    email = Visitor.objects.get(uid=j).email
                except:
                    email = ''
                try:
                    company = ChatThread.objects.get(uid=j).company.service.name
                except:
                    company = ''
                try:
                    rating = ChatThread.objects.get(uid=j).customerRating
                except:
                    rating = ''
                try:
                    chatDuration = ChatThread.objects.get(uid=j).chatDuration
                except:
                    chatDuration = ''
                try:
                    numOfComments = ReviewComment.objects.filter(uid=j, chatedDate=cmntDate).count()
                except:
                    numOfComments = ''
                try:
                    statusChat = ChatThread.objects.get(uid=j).status
                except:
                    statusChat = ''
                try:
                    agentCommentCount = ReviewComment.objects.filter(uid=j, chatedDate=cmntDate, user = ChatThread.objects.get(uid=j).user).count()
                except:
                    agentCommentCount = ''
                try:
                    customerFeedback = ChatThread.objects.get(uid=j).customerFeedback
                except:
                    customerFeedback = ''
                try:
                    customerRating = ChatThread.objects.get(uid=j).customerRating
                except:
                    customerRating = ''
                try:
                    typ = ChatThread.objects.get(uid=j).typ
                except:
                    typ = ''
                try:
                    reviewedOn = ChatThread.objects.get(uid=j).reviewedOn
                except:
                    reviewedOn = ''
                try:
                    reviewedBy = ChatThread.objects.get(uid=j).reviewedBy
                except:
                    reviewedBy = ''
                try:
                    closedOn = ChatThread.objects.get(uid=j).closedOn
                except:
                    closedOn = ''
                try:
                    closedBy = ChatThread.objects.get(uid=j).closedBy
                except:
                    closedBy = ''
                try:
                    resolvedOn = ChatThread.objects.get(uid=j).resolvedOn
                except:
                    resolvedOn = ''
                try:
                    resolvedBy = ChatThread.objects.get(uid=j).resolvedBy
                except:
                    resolvedBy = ''
                try:
                    archivedOn = ChatThread.objects.get(uid=j).archivedOn
                except:
                    archivedOn = ''
                try:
                    archivedBy = ChatThread.objects.get(uid=j).archivedBy
                except:
                    archivedBy = ''
                try:
                    escalatedL1On = ChatThread.objects.get(uid=j).escalatedL1On
                except:
                    escalatedL1On = ''
                try:
                    escalatedL1By = ChatThread.objects.get(uid=j).escalatedL1By
                except:
                    escalatedL1By = ''
                try:
                    escalatedL2On = ChatThread.objects.get(uid=j).escalatedL2On
                except:
                    escalatedL2On = ''
                try:
                    escalatedL2By = ChatThread.objects.get(uid=j).escalatedL2By

                except:
                    escalatedL2By = ''
                # print agentCommentCount
                # print company
                agUidObj = list(agSobj.filter(uid=j).values().annotate(company=Value(company, output_field=CharField()) , rating=Value(rating, output_field=CharField()),
                chatDuration=Value(chatDuration, output_field=CharField()) , statusChat=Value(statusChat, output_field=CharField()) ,
                numOfComments=Value(numOfComments, output_field=CharField()),
                agentCommentCount=Value(agentCommentCount,output_field=CharField()), email=Value(email, output_field=CharField()),
                file=Concat(Value('/media/'),'attachment'),customerFeedback=Value(customerFeedback,output_field=CharField()),
                customerRating=Value(customerRating,output_field=CharField()),typ=Value(typ,output_field=CharField()),
                escalatedL2By=Value(escalatedL2By, output_field=CharField()),escalatedL2On=Value(escalatedL2On, output_field=CharField()),
                escalatedL1By=Value(escalatedL1By, output_field=CharField()),escalatedL1On=Value(escalatedL1On, output_field=CharField()),
                archivedBy=Value(archivedBy, output_field=CharField()),archivedOn=Value(archivedOn, output_field=CharField()),
                resolvedOn=Value(resolvedOn, output_field=CharField()),resolvedBy=Value(resolvedBy, output_field=CharField()),
                reviewedBy=Value(resolvedBy, output_field=CharField()),reviewedOn=Value(reviewedOn, output_field=CharField()),
                closedOn=Value(closedOn, output_field=CharField()),closedBy=Value(closedBy, output_field=CharField())))
                toSend.append(agUidObj)
                res = res + list(agSobj.filter(uid=j).values('uid','user','message','attachment','attachmentType','sentByAgent').annotate(company=Value(company, output_field=CharField()), rating=Value(rating, output_field=CharField()), numOfComments=Value(numOfComments, output_field=CharField()) , chatDuration=Value(chatDuration, output_field=CharField())  ,email=Value(email, output_field=CharField())))
        # print toSend
        if 'download' in self.request.GET:
            print 'downloadddddddddddddddddddddddd'
            response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = 'attachment; filename=excelReport.xlsx'
            excelData = createExcel(res)
            print excelData,'dddddddddddddddd'
            excelData.save(response)
            return response
            # return ExcelResponse(res)

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
        print  decrypt(encrypted, "cioc")
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
    dataToSend = {"pk" : obj.pk ,'supportBubbleColor':obj.supportBubbleColor ,'iconColor':obj.iconColor, "windowColor" : obj.windowColor , "custName" : obj.service.name , "chat":obj.chat , "callBack":obj.callBack , "videoAndAudio":obj.videoAndAudio , "ticket":obj.ticket , "serverAddress" : globalSettings.SITE_ADDRESS , "wampServer" : globalSettings.WAMP_SERVER ,"webrtcAddress": globalSettings.WEBRTC_ADDRESS}
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
        # pass
        return HttpResponse(request,'')
        # return render(request, 'chatter.js', dataToSend ,content_type="application/x-javascript")



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
    filter_fields = ['uid','status','user','company']
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
        if 'companyHandelrs' in self.request.GET and 'checkThread' in self.request.GET:
            threadObj = ChatThread.objects.filter(company = self.request.GET['companyHandelrs'])
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
                userExit = CustomerProfile.objects.get(userApiKey=self.request.GET['apiKey'])
            except:
                raise PermissionDenied()
            if 'date' in self.request.GET:
                try:
                    date = datetime.datetime.strptime(self.request.GET['date'], '%Y-%m-%d').date()
                except:
                    raise ValidationError(detail={'PARAMS' : 'Date Argument Should Be yyyy-mm-dd Formate'} )
                print date,'dateeeeeeeeeeee'
                return ChatThread.objects.filter(created__startswith = date)
            else:
                raise ValidationError(detail={'PARAMS' : 'Date Argument Is Required'} )
        else:
            raise PermissionDenied()

class GetVisitorDetailsViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny,)
    serializer_class = VisitorSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['uid','email' ,'name']
    def get_queryset(self):
        if 'apiKey' in self.request.GET:
            try:
                userExit = CustomerProfile.objects.get(userApiKey=self.request.GET['apiKey'])
            except:
                raise PermissionDenied()
            if 'date' in self.request.GET:
                try:
                    date = datetime.datetime.strptime(self.request.GET['date'], '%Y-%m-%d').date()
                except:
                    raise ValidationError(detail={'PARAMS' : 'Date Argument Should Be yyyy-mm-dd Formate'} )
                print date,'dateeeeeeeeeeee'
                return Visitor.objects.filter(created__startswith = date)
            else:
                raise ValidationError(detail={'PARAMS' : 'Date Argument Is Required'} )
        else:
            raise PermissionDenied()

class GetOfflineMessagesViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny,)
    serializer_class = SupportChatSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['uid','user']
    exclude_fields = ['id']
    def get_queryset(self):
        if 'apiKey' in self.request.GET:
            try:
                userExit = CustomerProfile.objects.get(userApiKey=self.request.GET['apiKey'])
            except:
                raise PermissionDenied()
            if 'date' in self.request.GET:
                try:
                    date = datetime.datetime.strptime(self.request.GET['date'], '%Y-%m-%d').date()
                except:
                    raise ValidationError(detail={'PARAMS' : 'Date Argument Should Be yyyy-mm-dd Formate'} )
                print date,'dateeeeeeeeeeee'
                return SupportChat.objects.filter(user__isnull=True,created__startswith = date)
            else:
                raise ValidationError(detail={'PARAMS' : 'Date Argument Is Required'} )
        else:
            raise PermissionDenied()

class GethomeCal(APIView):
    def get(self , request , format = None):
        print '******************************************* holmcal'

        today = datetime.datetime.now().date()
        tomorrow = today + relativedelta(days=1)
        lastWeek = today - relativedelta(days=6)
        lastToLastWeek =  lastWeek - relativedelta(days=7)
        chatThreadObj = ChatThread.objects.filter(created__range=(lastWeek,tomorrow))
        lastToLastWeekChatCount = ChatThread.objects.filter(created__range=(lastToLastWeek,lastWeek - relativedelta(days=1))).count()
        # if 'perticularUser' in self.request.GET:
        #     if int(self.request.GET['perticularUser'])>0:
        #         chatThreadObj = chatThreadObj.filter(company=int(self.request.GET['perticularUser']))
        totalChats = chatThreadObj.count()

        agentChatCount = list(chatThreadObj.values('user').annotate(count_val=Count('user')))
        missedChats = chatThreadObj.filter(user__isnull=True).count()
        lastToLastWeekMissedChats = ChatThread.objects.filter(created__range=(lastToLastWeek,lastWeek - relativedelta(days=1)) , user__isnull=True).count()

        agentLeaderBoard = []
        agL = list(chatThreadObj.filter(user__isnull=False).values_list('user',flat=True).distinct())
        # if 'perticularUser' in self.request.GET:
        #     agL = list(chatThreadObj.filter(user__isnull=False , company= int(self.request.GET['perticularUser']) ).values_list('user',flat=True).distinct())
        for i in agL:
            oneAgentDetails = chatThreadObj.filter(user=i)
            r = oneAgentDetails.filter(customerRating__isnull=False).aggregate(Avg('customerRating'))
            rating = r['customerRating__avg'] if r['customerRating__avg'] else 0
            respTimeAvg = SupportChat.objects.filter(created__range=(lastWeek,tomorrow) ,user=i, responseTime__isnull=False).aggregate(Avg('responseTime'))
            respTimeAvg = respTimeAvg['responseTime__avg'] if respTimeAvg['responseTime__avg'] else 0
            firstResTimeAvg = oneAgentDetails.aggregate(Avg('firstResponseTime'))
            firstResTimeAvg = firstResTimeAvg['firstResponseTime__avg'] if firstResTimeAvg['firstResponseTime__avg'] else 0
            agentLeaderBoard.append({'agentName':oneAgentDetails[0].user.username,'rating':rating ,'respTimeAvg':respTimeAvg ,'firstResTimeAvg':firstResTimeAvg})
        avgRatingAll=0
        avgRespTimeAll=0
        avgRespTimeAllLtweek = 0
        firstResTimeAvgAll =0
        firstResTimeAvgAllLtweek = 0
        if 'perticularUser' in self.request.GET:
            if int(self.request.GET['perticularUser'])>0:
                avgChatDuration = 0
                # avgRatingAll=0
                # firstResTimeAvgAll =0
                missedChats = chatThreadObj.filter(user__isnull=True,company=int(self.request.GET['perticularUser'])).count()
                lastToLastWeekMissedChats = ChatThread.objects.filter(created__range=(lastToLastWeek,lastWeek - relativedelta(days=1)) , user__isnull=True , company=int(self.request.GET['perticularUser'])).count()
                a = chatThreadObj.filter(~Q(chatDuration=0) ,company = int(self.request.GET['perticularUser'])).aggregate(Avg('chatDuration'))
                avgChatDuration = a['chatDuration__avg'] if a['chatDuration__avg'] else 0
                alastToLastWeek = ChatThread.objects.filter(~Q(chatDuration=0) , created__range=(lastToLastWeek,lastWeek - relativedelta(days=1)) ,company = int(self.request.GET['perticularUser'])).aggregate(Avg('chatDuration'))
                avgChatDurationLtweek = alastToLastWeek['chatDuration__avg'] if alastToLastWeek['chatDuration__avg'] else 0
                # avgRatingAllLastWeek = alastToLastWeek['chatDuration__avg'] if alastToLastWeek['chatDuration__avg'] else 0
                frt = chatThreadObj.filter(firstResponseTime__isnull=False ,company=int(self.request.GET['perticularUser'])).aggregate(Avg('firstResponseTime'))
                firstResTimeAvgAll =  frt['firstResponseTime__avg'] if frt['firstResponseTime__avg'] else 0
                frtLastToLastWeek = ChatThread.objects.filter(firstResponseTime__isnull=False, created__range=(lastToLastWeek,lastWeek - relativedelta(days=1)) ,company=int(self.request.GET['perticularUser'])).aggregate(Avg('firstResponseTime'))
                firstResTimeAvgAllLtweek = frtLastToLastWeek['firstResponseTime__avg'] if frtLastToLastWeek['firstResponseTime__avg'] else 0
                arAll = chatThreadObj.filter(customerRating__isnull=False ,company=int(self.request.GET['perticularUser'])).aggregate(Avg('customerRating'))
                avgRatingAll = arAll['customerRating__avg'] if arAll['customerRating__avg'] else 0
                totalChats = chatThreadObj.filter(company=int(self.request.GET['perticularUser'])).count()
                lastToLastWeekChatCount = ChatThread.objects.filter(created__range=(lastToLastWeek,lastWeek - relativedelta(days=1)),company=int(self.request.GET['perticularUser'])).count()
                usr = chatThreadObj.filter(company = int(self.request.GET['perticularUser']))[0].user

                artAll = SupportChat.objects.filter( created__range=(lastWeek,tomorrow) ,user=usr , responseTime__isnull=False).aggregate(Avg('responseTime'))
                avgRespTimeAll = artAll['responseTime__avg'] if artAll['responseTime__avg'] else 0

                artAllLtWeek = SupportChat.objects.filter(created__range=(lastToLastWeek,lastWeek - relativedelta(days=1)) , user=usr , responseTime__isnull=False).aggregate(Avg('responseTime'))
                avgRespTimeAllLtweek = artAllLtWeek['responseTime__avg'] if artAllLtWeek['responseTime__avg'] else 0

        else:
            a = chatThreadObj.filter(~Q(chatDuration=0)).aggregate(Avg('chatDuration'))
            avgChatDuration = a['chatDuration__avg'] if a['chatDuration__avg'] else 0
            alastToLastWeek = ChatThread.objects.filter(~Q(chatDuration=0) , created__range=(lastToLastWeek,lastWeek - relativedelta(days=1))).aggregate(Avg('chatDuration'))
            avgChatDurationLtweek = alastToLastWeek['chatDuration__avg'] if alastToLastWeek['chatDuration__avg'] else 0

            for i in agentLeaderBoard:
                avgRatingAll+= i['rating']
                avgRespTimeAll+=i['respTimeAvg']
                firstResTimeAvgAll+=i['firstResTimeAvg']
            if len(agentLeaderBoard) > 0:
                avgRespTimeAll = avgRespTimeAll/len(agentLeaderBoard)
                avgRatingAll = avgRatingAll/len(agentLeaderBoard)
                firstResTimeAvgAll = firstResTimeAvgAll/len(agentLeaderBoard)
        changeInData = {}
        changeInChat = {'percentage':0 , 'increase' : False}
        changeInAvgChatDur = {'percentage':0 , 'increase' : False}
        changeInFrtAvg = {'percentage':0 , 'increase' : False}
        changeInRespTimeAvg = {'percentage':0 , 'increase' : False}
        changeInMissedChat = {'percentage':0 , 'increase' : False}
        # changeInAverageRating = {'percentage':0 , 'increase' : False}
        if lastToLastWeekChatCount<totalChats:
            changeInChat['percentage'] = (float(totalChats - lastToLastWeekChatCount)/totalChats)*100
            changeInChat['increase'] = True
        elif totalChats<lastToLastWeekChatCount:
            changeInChat['percentage'] = (float(lastToLastWeekChatCount - totalChats)/lastToLastWeekChatCount)*100
            changeInChat['increase'] = False
        else:
            changeInChat['percentage'] = 0.0
            changeInChat['increase'] = False
        changeInMissedChat = {}
        if lastToLastWeekMissedChats<missedChats:
            changeInMissedChat['percentage'] = (float(missedChats - lastToLastWeekChatCount)/missedChats)*100
            changeInMissedChat['increase'] = True
        elif missedChats< lastToLastWeekMissedChats:
            changeInMissedChat['percentage'] = (float(lastToLastWeekMissedChats - missedChats)/lastToLastWeekMissedChats)*100
            changeInMissedChat['increase'] = False
        else:
            changeInMissedChat['percentage'] = 0.0
            changeInMissedChat['increase'] = False

        if avgChatDurationLtweek<avgChatDuration:
            changeInAvgChatDur['percentage'] = (float(avgChatDuration - avgChatDurationLtweek)/avgChatDuration)*100
            changeInAvgChatDur['increase'] = True
        elif avgChatDuration<avgChatDurationLtweek:
            changeInAvgChatDur['percentage'] = (float(avgChatDurationLtweek - avgChatDuration)/avgChatDurationLtweek)*100
            changeInAvgChatDur['increase'] = False
        else:
            changeInAvgChatDur['percentage'] = 0.0
            changeInAvgChatDur['increase'] = False

        if firstResTimeAvgAllLtweek<firstResTimeAvgAll:
            changeInFrtAvg['percentage'] = (float(firstResTimeAvgAll - firstResTimeAvgAllLtweek)/firstResTimeAvgAll)*100
            changeInFrtAvg['increase'] = True
        elif firstResTimeAvgAll<firstResTimeAvgAllLtweek:
            changeInFrtAvg['percentage'] = (float(firstResTimeAvgAllLtweek - firstResTimeAvgAll)/firstResTimeAvgAllLtweek)*100
            changeInFrtAvg['increase'] = False
        else:
            changeInFrtAvg['percentage'] = 0.0
            changeInFrtAvg['increase'] = False

        if avgRespTimeAllLtweek<avgRespTimeAll:
            changeInRespTimeAvg['percentage'] = (float(avgRespTimeAll - avgRespTimeAllLtweek)/avgRespTimeAll)*100
            changeInRespTimeAvg['increase'] = True
        elif avgRespTimeAll<avgRespTimeAllLtweek:
            changeInRespTimeAvg['percentage'] = (float(avgRespTimeAllLtweek - avgRespTimeAll)/avgRespTimeAllLtweek)*100
            changeInRespTimeAvg['increase'] = False
        else:
            changeInRespTimeAvg['percentage'] = 0.0
            changeInRespTimeAvg['increase'] = False


        changeInData['changeInChat'] = changeInChat
        changeInData['changeInMissedChat'] = changeInMissedChat
        changeInData['changeInAvgChatDur'] =changeInAvgChatDur
        changeInData['changeInFrtAvg'] = changeInFrtAvg
        changeInData['changeInRespTimeAvg'] = changeInRespTimeAvg
        print changeInData , 'Change in Dataaaaaaaaaaaaaaaaaaa####################'
        graphData = [[],[]]
        graphLabels = []
        for i in range(7):
            dt = lastWeek + relativedelta(days=i)
            dateChat = ChatThread.objects.filter(created__startswith=dt)
            if 'perticularUser' in self.request.GET:
                if int(self.request.GET['perticularUser'])>0:
                    dateChat = dateChat.filter(company=int(self.request.GET['perticularUser']))
            missed = dateChat.filter(user__isnull=True).count() * -1
            received = dateChat.filter(user__isnull=False).count()
            graphData[0].append(received)
            graphData[1].append(missed)
            graphLabels.append(datetime.datetime.combine(dt, datetime.datetime.min.time()).strftime('%b %d'))
        # for idx,i in enumerate(agentChatCount):
        #     if not i['user']:
        #         missedChats = ChatThread.objects.filter(created__range=(lastWeek,tomorrow),user__isnull=True).count()
        #         agentChatCount[idx]['count_val'] = missedChats
        #         agentChatCount[idx]['user'] = 'noUser'
        #         break
        print agentChatCount,graphData

        return Response({'totalChats':totalChats,'missedChats':missedChats,'agentChatCount':agentChatCount,'graphData':graphData,'graphLabels':graphLabels,'avgChatDuration':avgChatDuration,'agentLeaderBoard':agentLeaderBoard,'avgRatingAll':avgRatingAll,'avgRespTimeAll':avgRespTimeAll,'firstResTimeAvgAll':firstResTimeAvgAll,'changeInData':changeInData}, status = status.HTTP_200_OK)


class DocumentVersionViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny,)
    serializer_class = DocumentVersionSerializer
    queryset = DocumentVersion.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['parent']


class CompanyProcessViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny,)
    serializer_class = CompanyProcessSerializer
    # queryset = CompanyProcess.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['service','text']
    def get_queryset(self):
        print '@@@@@@@@@@@@@@@@@@@@@@@'
        return CompanyProcess.objects.all()

class CannedResponsesViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny,)
    serializer_class = CannedResponsesSerializer
    queryset = CannedResponses.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['text','service']


class HeartbeatApi(APIView):
    permission_classes = (permissions.AllowAny,)
    def get(self , request , format = None):
        if 'timesheet' in request.GET:
            u = User.objects.get(pk = request.GET['pk'])
            today_min = datetime.datetime.combine(datetime.date.today(), datetime.time.min)
            today_max = datetime.datetime.combine(datetime.date.today(), datetime.time.max)
            obj=Heartbeat.objects.filter(start__range=(today_min, today_max),user=u)
            print obj ,"heartbeat objjjjjjjjjj"
            if len(obj)==1:
                if obj[0].end is None:
                    obj[0].end=timezone.now()
                    difference=obj[0].end-obj[0].start
                    obj[0].duration = difference.total_seconds()
                    day_difference=difference
                    obj[0].day_duration = day_difference.total_seconds()
                    obj[0].save()
                else:
                    c = timezone.now() - obj[0].end
                    cInMin =  c.total_seconds()/60
                    if cInMin>15:
                        Heartbeat.objects.create(start=timezone.now(),user=u)
                    else:
                        obj[0].end=timezone.now()
                        difference=obj[0].end-obj[0].start
                        obj[0].duration = difference.total_seconds()
                        day_difference=difference
                        obj[0].day_duration = day_difference.total_seconds()
                        obj[0].save()
            elif len(obj)>1:
                print 'multiple hearbeat'
                if obj[len(obj)-1].end is None:
                    print 'heartbeat has only start'
                    obj[len(obj)-1].end=timezone.now()
                    difference=obj[len(obj)-1].end-obj[len(obj)-1].start
                    obj[len(obj)-1].duration = difference.total_seconds()
                    day_difference=obj[len(obj)-1].end-obj[0].start
                    obj[len(obj)-1].day_duration = day_difference.total_seconds()
                    obj[len(obj)-1].save()
                else:
                    print 'heartbeat has end'
                    c = timezone.now() - obj[len(obj)-1].end
                    cInMin =  c.total_seconds()/60
                    if cInMin>15:
                        print 'time exceeds 30 mints creating new heartbeat'
                        Heartbeat.objects.create(start=timezone.now(),user=u)
                    else:
                        print 'updating end for the heartbeat'
                        obj[len(obj)-1].end=timezone.now()
                        difference=obj[len(obj)-1].end-obj[len(obj)-1].start
                        day_difference=obj[len(obj)-1].end-obj[0].start
                        obj[len(obj)-1].day_duration = day_difference.total_seconds()
                        obj[len(obj)-1].duration = difference.total_seconds()
                        obj[len(obj)-1].save()
            else:
                Heartbeat.objects.create(start=timezone.now(),user=u)
            return Response({}, status = status.HTTP_200_OK)
        elif 'getDetailData' in request.GET:
            u = User.objects.get(pk = request.GET['pk'])
            toSend=[]
            heartbtObj = Heartbeat.objects.all()
            if 'date' in request.GET:
                date = datetime.datetime.strptime(request.GET['date'], '%Y-%m-%d').date()
                o = heartbtObj.filter(created__startswith = date,user=u)
                th=list(o.values())
                toSend.append(th);
                return Response(toSend, status=status.HTTP_200_OK)
            else:
                dates = list(heartbtObj.filter(user=u).values_list('created',flat=True).distinct())
                for j in dates:
                    o=heartbtObj.filter(created__startswith = j,user=u)
                    th=list(o.values())
                    toSend.append(th);
                return Response(toSend, status=status.HTTP_200_OK)
        elif 'getTimeSheetData' in request.GET:
            newDetails=[]
            heartbtObj = Heartbeat.objects.filter(created__startswith=request.GET['date'])
            uidL = list(heartbtObj.values_list('user',flat=True).distinct())
            for j in uidL:
                u = User.objects.get(pk = j)
                o = heartbtObj.filter(user=u)
                th=list(o.values())
                newDetails.append(th);
            return Response(newDetails, status=status.HTTP_200_OK)
class StreamRecordings(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes=(permissions.AllowAny,)
    def post(self , request , format = None):
        print request.data,'dddddddddddddddd'
        filename = request.data['fileName']
        filepath=os.path.join(globalSettings.BASE_DIR,'media_root',filename)
        with open(filepath, 'wb+') as destination:
            for chunk in request.FILES['file'].chunks():
                destination.write(chunk)
        return Response({}, status = status.HTTP_200_OK)


class EmailChat(APIView):
    renderer_classes = (JSONRenderer,)
    def post(self , request , format = None):
        emailAddr=[]
        print request.data['email'],'email'
        emailAddr.append(request.data['email'])

        sObj = SupportChat.objects.filter(uid = request.data['uid'])
        visitor = Visitor.objects.filter(uid = request.data['uid'])
        if len(visitor)>0:
            name = visitor[0].name
            allChats = []
            for a in sObj:
                toAppend = {'user': a.user , 'message': a.message , 'created': a.created , 'uid': name }
                if a.sentByAgent:
                    toAppend['sentByAgent'] = True
                    if a.attachment:
                        # print a.attachment , 'ggggggggggggg'
                        toAppend['attachment'] = globalSettings.SITE_ADDRESS + '/media/' + str(a.attachment)
                else:
                    toAppend['sentByAgent'] = False
                    if a.attachment:
                        toAppend['attachment'] = a.attachment
                allChats.append(toAppend)
            sObj = allChats
            # print sObj , 'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'

        ctx = {
            'heading' : "Support Conversation",
            'allChats' : sObj
        }
        print ctx
        email_body = get_template('app.support.email.html').render(ctx)
        msg = EmailMessage("Chat Conversation" , email_body, to= emailAddr)
        msg.content_subtype = 'html'
        msg.send()
        return Response({}, status = status.HTTP_200_OK)




class EmailScript(APIView):
    renderer_classes = (JSONRenderer,)
    def post(self , request , format = None):
        emailAddr=[]
        print request.data['email'],'email'
        emailAddr.append(request.data['email'])
        sObj = request.data['script']
        companyName=request.data['companyName']


        ctx = {
            'heading' : "Syrow Script",
            'script' : sObj,
            'companyName':companyName

        }
        print ctx
        email_body = get_template('app.scriptEmail.html').render(ctx)
        msg = EmailMessage("Syrow chat support installation guide" , email_body, to= emailAddr)
        msg.content_subtype = 'html'
        msg.send()
        return Response({}, status = status.HTTP_200_OK)
