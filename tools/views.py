from django.contrib.auth.models import User , Group
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate , login , logout
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse
from django.template.loader import render_to_string, get_template
from django.template import RequestContext , Context
from django.conf import settings as globalSettings
from django.core.mail import send_mail , EmailMessage
from django.core import serializers
from django.http import HttpResponse ,StreamingHttpResponse
from django.utils import timezone
from django.db.models import Min , Sum , Avg
import mimetypes
import hashlib, datetime, random
from datetime import timedelta , date
from monthdelta import monthdelta
from time import time
import pytz
import math
import json

from StringIO import StringIO
import math
import requests
# related to the invoice generator
from PIL import Image

# Related to the REST Framework
from rest_framework import viewsets , permissions , serializers
from rest_framework.exceptions import *
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.renderers import JSONRenderer
from rest_framework.decorators import api_view
from url_filter.integrations.drf import DjangoFilterBackend
from .serializers import *
# from .helper import *
from API.permissions import *
from HR.models import accountsKey

from django.core import serializers
from django.http import JsonResponse

from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import StringIO
from django.core.exceptions import PermissionDenied,SuspiciousOperation
import random, string

# from scripts.knnocr.captchaSolver import main as toolFn
# from scripts.pdfReader.main import processDoc as toolFn
# Create your views here.
# from scripts.kpmgPDFExtract.kpmgMain import main as kpmg
# from scripts.pdfEditor.markings import *

# from scripts.PDFReader.reader2 import getBasicDetails

from shutil import copyfile


class COIAPI(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.AllowAny ,)
    def post(self , request , format = None):
        # fil = StringIO.StringIO()
        # getBasicDetails(request.data['file'])
        # print dir(fil)
        toReturn= []
        for tr in getBasicDetails(request.data['file']):
            toReturn.append(str(tr))


        return Response({"data" : toReturn}, status=status.HTTP_200_OK)

def generateOTPCode():
    length = 4
    chars = string.digits
    rnd = random.SystemRandom()
    return ''.join(rnd.choice(chars) for i in range(length))

def sendApiKeyEmail(apiKeyObj,typ):
    print apiKeyObj,'apkobjjjjjjjjj'
    try:
        if typ == 'otp':
            email_subject = "Your OTP For API Secret Key Activation"
            email_body = "Hi , Your API Secret Key Activation OTP Is : {0}".format(apiKeyObj.email_otp)
        else:
            email_subject = "Yor API Secret Key"
            email_body = "Hi , This Is Your API SecretKey \n{0}".format(apiKeyObj.emailApiKey)
        print email_subject,email_body
        msg = EmailMessage(email_subject , email_body, to= [apiKeyObj.email])
        msg.send()
        return True
    except:
        return False

class generateAPIKEYAPI(APIView):
    permission_classes = (permissions.AllowAny ,)
    def post(self , request , format = None):
        print request.data,'dataaaaaaaaa'
        if 'email' in request.data:
            if 'otp' in request.data:
                try:
                    apiKeyObj = ApiKeyRegistration.objects.get(email=request.data['email'],email_otp=request.data['otp'])
                    apiKeyObj.verified = True
                    try:
                        apiKeyValue = str(make_password(datetime.datetime.now()).split('sha256$')[1]).replace('+','')
                    except:
                        apiKeyValue = str(make_password(datetime.datetime.now())).replace('+','')
                    apiKeyObj.emailApiKey = apiKeyValue
                    apiKeyObj.save()
                    try:
                        superUserObj = User.objects.filter(is_superuser=True)[0]
                        print 'super user existsssss'
                    except:
                        superUserObj = User.objects.all()[0]
                    try:
                        apObj = ApiAccount.objects.get(email=apiKeyObj.email)
                        apObj.apiKey = apiKeyObj.emailApiKey
                        apObj.save()
                        print 'api account already Exists'
                    except:
                        apObj = ApiAccount(email=apiKeyObj.email,apiKey=apiKeyObj.emailApiKey,active=True,remaining=1000,user=superUserObj)
                        apObj.save()
                    emailSendMsg = sendApiKeyEmail(apiKeyObj,'apiKey')
                    if emailSendMsg:
                        return Response({'msg':apiKeyObj.emailApiKey}, status=status.HTTP_200_OK)
                    else:
                        return Response({'msg':'Invalid Email'}, status=status.HTTP_200_OK)
                except:
                    return Response({'msg':'otpError'}, status=status.HTTP_200_OK)
            else:
                try:
                    apiKeyObj = ApiKeyRegistration.objects.get(email=request.data['email'])
                    if apiKeyObj.verified:
                        emailSendMsg = sendApiKeyEmail(apiKeyObj,'apiKey')
                        if emailSendMsg:
                            return Response({'msg':'apiKey_exists'}, status=status.HTTP_200_OK)
                        else:
                            return Response({'msg':'Invalid Email'}, status=status.HTTP_200_OK)
                    else:
                        otp = generateOTPCode()
                        print otp
                        apiKeyObj.email_otp = otp
                        apiKeyObj.save()
                        emailSendMsg = sendApiKeyEmail(apiKeyObj,'otp')
                        if emailSendMsg:
                            return Response({'msg':'otp'}, status=status.HTTP_200_OK)
                        else:
                            return Response({'msg':'Invalid Email'}, status=status.HTTP_200_OK)
                except:
                    pass
                otp = generateOTPCode()
                print otp
                apiKeyObj = ApiKeyRegistration(email=request.data['email'],email_otp=otp)
                apiKeyObj.save()
                emailSendMsg = sendApiKeyEmail(apiKeyObj,'otp')
                if emailSendMsg:
                    return Response({'msg':'otp'}, status=status.HTTP_200_OK)
                else:
                    apiKeyObj.delete()
                    return Response({'msg':'Invalid Email'}, status=status.HTTP_200_OK)
        else:
            raise SuspiciousOperation('Invalid Data')


class ApiAccountPublicApi(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.AllowAny ,)
    def get(self , request , format = None):
        key = request.GET['key']
        aa = get_object_or_404(ApiAccount, apiKey__contains = key)
        if aa.active:
            return Response({'remaining': aa.remaining}, status=status.HTTP_200_OK)
        else:
            return Response({'notActive': "Account not active"}, status=status.HTTP_403_FORBIDDEN)


def getFileInRequest(request):
    try:
        apiKey = request.data["apiKey"]
    except:
        apiKey = request.GET["apiKey"]
    try:
        fileID = request.data["fileID"]
    except:
        fileID = request.GET["fileID"]

    acc =get_object_or_404(ApiAccount, apiKey = apiKey)
    fc = get_object_or_404(FileCache, account = acc , fileID = fileID)
    return fc



class kpmgAuditApi(APIView):

    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.AllowAny ,)

    def get(self , request , format = None):
        # user = self.request.user
        # print request.FILES
        # pdfFile = request.FILES['file']
        # print pdfFile, pdfFile.size
        # res = toolFn(imgFile)
        pth = os.path.join(globalSettings.BASE_DIR , 'tools', 'scripts', 'kpmgPDFExtract')

        pyFile = FileCache.objects.get(fileID = request.GET['py']).attachment
        cyFile = FileCache.objects.get(fileID = request.GET['cy']).attachment
        from scripts.KPMG_PY import kpmgGDC
        from scripts.generateOutput import generatePDF

        print request.GET['py']
        print request.GET['cy']
        # print dir(pyFile)
        # print pyFile.path

        kpmgGDC(pyFile.path , cyFile.path)
        generatePDF(cyFile.path)
        return Response({}, status=status.HTTP_200_OK)


class KNNOcrApi(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.AllowAny ,)

    def post(self , request , format = None):
        user = self.request.user
        print request.FILES
        imgFile = request.FILES['file']
        print imgFile, imgFile.size
        # res = toolFn(imgFile)
        content = {'keyname': 234}
        return Response(content, status=status.HTTP_200_OK)

class PDFEditorApi(APIView):
    renderer_classes = (JSONRenderer, )
    permission_classes = (permissions.AllowAny, PublicAPIAccess, )
    def post(self, request , format = None):
        if 'rpc' not in request.GET:
            return Response("RPC not defined , please use it in the query params", status=status.HTTP_400_BAD_REQUEST)

        action = request.GET['rpc']
        fc = getFileInRequest(request).attachment
        pageNo = int(request.data['pageNo'])
        color = request.data['color']

        if action in ['addText', 'addTextRelative']:
            if action == 'addText':
                x = int(request.data['x'])
                y = int(request.data['y'])
            elif action == 'addTextRelative':
                textRel = request.data['relative']
                relationship = request.data['relation']

            font = request.data['font']
            text = request.data['text']
            fontSize = int(request.data['fontSize'])
        elif action in ['drawLine', 'drawRect']:
            p1x = int(request.data['p1x'])
            p1y = int(request.data['p1y'])
            p2x = int(request.data['p2x'])
            p2y = int(request.data['p2y'])

        if action == 'addText':
            addText(fc.path , pageNo, text, x,y,font,fontSize,color)
        elif action == 'drawLine':
            stroke = int(request.data['stroke'])
            drawLine(fc.path, pageNo, [p1x,p1y], [p2x,p2y], stroke, color)
        elif action == 'addTextRelative':
            addTextRelative(fc.path , pageNo, text, textRel, relationship ,font,fontSize,color)
        elif action == 'drawRect':
            rect = QtCore.QRect(QtCore.QPoint(p1x,p1y), QtCore.QPoint(p2x, p2y))
            drawRect(fc.path, pageNo, rect, color)

        return Response("ok", status=status.HTTP_200_OK)


class PDFReaderApi(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.AllowAny , PublicAPIAccess,)

    def get(self, request , format = None):
        # this is to get the metadata which includes number of pages and other details for a file
        if "fileID" not in request.GET:
            return Response("FileID is not supplied", status=status.HTTP_400_BAD_REQUEST)

        fc = getFileInRequest(request)

        from scripts.PDFReader.reader import getMeta
        res = getMeta(fc.attachment.read())
        return Response(res, status=status.HTTP_200_OK)


    def post(self , request , format = None):
        # user = self.request.user
        if "apiKey" not in request.data or  "fileID" not in request.data or  "pageNo" not in request.data:
            return Response("Either the apikey or fileID or pageNo is not supplied", status=status.HTTP_400_BAD_REQUEST)

        pageNo = int(request.data['pageNo'])

        fc = getFileInRequest(request)

        from scripts.PDFReader.reader import processDoc
        res = processDoc(fc.attachment.read(), pageNo, format_= 'json')
        return Response(res, status=status.HTTP_200_OK)


class NLPParser(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.AllowAny , )

    def post(self , request , format = None):
        user = self.request.user
        line = request.data['sent']
        from scripts.nlp.nlpEngine import parseLine
        # res = toolFn(os.path.join(globalSettings.BASE_DIR , 'tools', 'scripts', 'pdfReader', 'pdfFile.pdf'), 9)
        datafields , words,percents, durations , persons , miscs , locations, cleanedTags, dates, money = parseLine(line)

        dArray = []
        for d in dates:
            dArray.append(str(d))

        res = {'percents': percents , 'persons' : persons , 'locations' : locations ,'dates':dArray, 'money' : money}
        return Response(res, status=status.HTTP_200_OK)

class NLPParserRelation(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.AllowAny ,)

    def post(self , request , format = None):
        user = self.request.user
        line = request.data['line']
        from scripts.kpmgPDFExtract.nlpEngine import getYearRelatedValues
        # res = toolFn(os.path.join(globalSettings.BASE_DIR , 'tools', 'scripts', 'pdfReader', 'pdfFile.pdf'), 9)
        res = getYearRelatedValues(line)
        return Response(res, status=status.HTTP_200_OK)

class FileCacheAPI(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.AllowAny , PublicAPIAccess, )

    def get(self , request , format = None):
        # print request.GET
        if "apiKey" not in request.GET or "fileID" not in request.GET:
            return Response("Either the apikey or fileID is not supplied", status=status.HTTP_400_BAD_REQUEST)
        fc = getFileInRequest(request)

        serializer = FileCacheSerializer(fc , many = False)
        return Response(serializer.data, status=status.HTTP_200_OK)


    def post(self , request , format = None):

        if ("apiKey" not in request.data and 'apiKey' not in request.GET) or "file" not in request.FILES:
            return Response("Either the apikey or file is not supplied", status=status.HTTP_400_BAD_REQUEST)

        try:
            apiKey = request.data['apiKey']
        except:
            apiKey = request.GET['apiKey']
        fileData = request.FILES["file"]

        acc =get_object_or_404(ApiAccount, apiKey = apiKey)
        if not acc.active:
            return Response("API Account not active", status=status.HTTP_402_PAYMENT_REQUIRED)

        fc = FileCache()
        fc.attachment = fileData
        dt = datetime.date.today()
        dt += datetime.timedelta(days = 2)
        fc.expiresOn = dt.strftime('%Y-%m-%d')
        fc.fileID = make_password(datetime.datetime.now()).replace('+','')
        fc.account = acc

        fc.user = acc.user

        fc.save()

        serializer = FileCacheSerializer(fc , many = False)
        return Response(serializer.data, status=status.HTTP_200_OK)



class NLPGetParaByTitle(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.AllowAny ,)

    def post(self , request , format = None):
        user = self.request.user
        line = request.data['line']
        from scripts.kpmgPDFExtract.cli import getParaByTitle
        res = getParaByTitle(line)
        return Response(res, status=status.HTTP_200_OK)

class FileCacheViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isOwner, )
    serializer_class = FileCacheSerializer
    def get_queryset(self):
        qs = FileCache.objects.filter(user = self.request.user)
        return qs

class ApiAccountViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isOwner, )
    serializer_class = ApiAccountSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['email']
    def get_queryset(self):
        qs = ApiAccount.objects.filter(user = self.request.user)
        return qs

class ApiAccountLogViewSet(viewsets.ModelViewSet):
    permission_classes = (readOnly, permissions.IsAuthenticatedOrReadOnly,isAdmin,)
    serializer_class = ApiAccountLogSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['account', 'refID']
    def get_queryset(self):
        qs = ApiAccountLog.objects.filter(actor = self.request.user).order_by('-updated')
        return qs


class ArchivedDocumentViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isOwner, )
    serializer_class = ArchivedDocumentSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['title' , 'created']
    def get_queryset(self):
        qs = ArchivedDocument.objects.all()
        return qs

class DocumentContentViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny, )
    serializer_class = DocumentContentSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['text' , 'category' , 'created']
    def get_queryset(self):
        qs = DocumentContent.objects.all()
        return qs
class DocumentCommenttViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny, )
    serializer_class = DocumentCommentSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['doc' , 'pageNo' ]
    def get_queryset(self):
        qs = DocumentComment.objects.all()
        return qs
