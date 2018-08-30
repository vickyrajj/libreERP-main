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

from openpyxl import Workbook
from openpyxl.styles import Font
from openpyxl.utils import get_column_letter
from dateutil.relativedelta import relativedelta
from django.db.models import Sum, Count, Avg

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
        uidL = list(sobj.values_list('uid',flat=True).distinct())
        agentsList = list(ChatThread.objects.filter(~Q(status='archived'),uid__in=uidL).values_list('user',flat=True).distinct())
        print agentsList
        for i in agentsList:
            agentuidList = list(ChatThread.objects.filter(~Q(status='archived'),user=i).values_list('uid',flat=True).distinct())
            agSobj = sobj.filter(uid__in = agentuidList)
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
                res = res + list(agSobj.filter(uid=j).values('uid','user','message','attachment','attachmentType','sentByAgent').annotate(company=Value(company, output_field=CharField()),email=Value(email, output_field=CharField())))
        print toSend
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
        print today,tomorrow,lastWeek
        chatThreadObj = ChatThread.objects.filter(created__range=(lastWeek,tomorrow))
        if 'perticularUser' in self.request.GET:
            if int(self.request.GET['perticularUser'])>0:
                chatThreadObj = chatThreadObj.filter(company=int(self.request.GET['perticularUser']))
        totalChats = chatThreadObj.count()
        print 'cccccccccccccc',totalChats,chatThreadObj
        agentChatCount = list(chatThreadObj.values('user').annotate(count_val=Count('user')))
        missedChats = ChatThread.objects.filter(created__range=(lastWeek,tomorrow),user__isnull=True).count()
        if 'perticularUser' in self.request.GET:
            if int(self.request.GET['perticularUser'])>0:
                missedChats = ChatThread.objects.filter(created__range=(lastWeek,tomorrow),user__isnull=True,company=int(self.request.GET['perticularUser'])).count()
        try:
            a = chatThreadObj.filter(~Q(chatDuration=0)).aggregate(Avg('chatDuration'))
            avgChatDuration = a['chatDuration__avg']
        except:
            avgChatDuration = 0
        print avgChatDuration,'avgggggggggggggg'
        agentLeaderBoard = []
        agL = list(chatThreadObj.filter(user__isnull=False).values_list('user',flat=True).distinct())
        print agL
        for i in agL:
            oneAgentDetails = chatThreadObj.filter(user=i)
            r = oneAgentDetails.filter(customerRating__isnull=False).aggregate(Avg('customerRating'))
            rating = r['customerRating__avg'] if r['customerRating__avg'] else 0
            respTimeAvg = SupportChat.objects.filter(user=i, responseTime__isnull=False).aggregate(Avg('responseTime'))
            respTimeAvg = respTimeAvg['responseTime__avg'] if respTimeAvg['responseTime__avg'] else 0
            agentLeaderBoard.append({'agentName':oneAgentDetails[0].user.username,'rating':rating ,'respTimeAvg':respTimeAvg})
        avgRatingAll=0
        avgRespTimeAll=0
        for i in agentLeaderBoard:
            avgRatingAll+= i['rating']
            avgRespTimeAll+=i['respTimeAvg']
        avgRespTimeAll = avgRespTimeAll/len(agentLeaderBoard)
        avgRatingAll = avgRatingAll/len(agentLeaderBoard)
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
            print dt,received,missed,datetime.datetime.combine(dt, datetime.datetime.min.time()).strftime('%b %d'),datetime.datetime.combine(dt, datetime.datetime.min.time())-datetime.datetime.now()
            graphLabels.append(datetime.datetime.combine(dt, datetime.datetime.min.time()).strftime('%b %d'))
        # for idx,i in enumerate(agentChatCount):
        #     if not i['user']:
        #         missedChats = ChatThread.objects.filter(created__range=(lastWeek,tomorrow),user__isnull=True).count()
        #         agentChatCount[idx]['count_val'] = missedChats
        #         agentChatCount[idx]['user'] = 'noUser'
        #         break
        print agentChatCount,graphData

        return Response({'totalChats':totalChats,'missedChats':missedChats,'agentChatCount':agentChatCount,'graphData':graphData,'graphLabels':graphLabels,'avgChatDuration':avgChatDuration,'agentLeaderBoard':agentLeaderBoard,'avgRatingAll':avgRatingAll,'avgRespTimeAll':avgRespTimeAll}, status = status.HTTP_200_OK)
