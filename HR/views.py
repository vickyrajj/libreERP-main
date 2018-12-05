from django.contrib.auth.models import User , Group
from django.shortcuts import render, redirect , get_object_or_404
from django.contrib.auth import authenticate , login , logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.urlresolvers import reverse
from django.template import RequestContext
from django.conf import settings as globalSettings
from django.core.exceptions import ObjectDoesNotExist , SuspiciousOperation
from django.views.decorators.csrf import csrf_exempt, csrf_protect
# Related to the REST Framework
from rest_framework import viewsets , permissions , serializers
from rest_framework.exceptions import *
from url_filter.integrations.drf import DjangoFilterBackend
from .serializers import *
from API.permissions import *
from ERP.models import  permission , module , CompanyHolidays , service
from ERP.views import getApps, getModules
from django.db.models import Q,Count ,F
from django.http import JsonResponse
from rest_framework.renderers import JSONRenderer
import random, string
from django.utils import timezone
from rest_framework.views import APIView
from datetime import date,timedelta
from dateutil.relativedelta import relativedelta
import calendar
from rest_framework.response import Response
from django.contrib.auth.models import User, Group
from allauth.socialaccount.models import *
from rest_framework import filters
from openpyxl import load_workbook,Workbook
from openpyxl.writer.excel import save_virtual_workbook
from openpyxl.styles import Font
from openpyxl.utils import get_column_letter
from io import BytesIO
from django.db.models.functions import Extract , ExtractDay, ExtractMonth, ExtractYear
from django.db.models import Sum , Avg
import json
import os
from django.db.models import CharField, Value , Func
import csv
import pandas as pd

# from ERP.models import application , permission


def documentView(request):
    docID = None
    if request.method == 'POST':
        templt = 'documentVerify.external.showDetails.html'
        docID = request.POST['id']
        passKey = request.POST['passkey']

    elif request.method == 'GET':
        if 'id' in request.GET:
            docID = request.GET['id']
            passKey = request.GET['passkey']
            templt = 'documentVerify.external.showDetails.html'
        else:
            templt = 'documentVerify.external.getPassKey.html'

    if docID is not None:
        if len(docID)<5:
            raise ObjectDoesNotExist("Document ID not correct")
        doc = get_object_or_404(Document , pk = int(docID[4:]), passKey = passKey)
        templt = 'documentVerify.external.showDetails.html'
        eml = doc.email
        prts = eml.split('@')
        eml = prts[0][0:4]+ "*******@" + prts[1]
        data = {
            "id":doc.pk,
            "issuedTo" : doc.issuedTo,
            "issuedBy" : doc.issuedBy,
            "created" : doc.created,
            "description" : doc.description,
            "email": eml
        }

    else:
        data = {}

    return render(request , templt, data)

def generateOTPCode():
    length = 4
    chars = string.digits
    rnd = random.SystemRandom()
    return ''.join(rnd.choice(chars) for i in range(length))

def tokenAuthentication(request):

    ak = get_object_or_404(accountsKey, activation_key=request.GET['key'] , keyType='hashed')
    #check if the activation key has expired, if it hase then render confirm_expired.html
    if ak.key_expires < timezone.now():
        raise SuspiciousOperation('Expired')
    #if the key hasn't expired save user and set him as active and render some template to confirm activation
    user = ak.user
    user.is_active = True
    user.save()
    user.accessibleApps.all().delete()
    for a in globalSettings.DEFAULT_APPS_ON_REGISTER:
        app = application.objects.get(name = a)
        p = permission.objects.create(app =  app, user = user , givenBy = User.objects.get(pk=1))
    login(request , user)
    authStatus = {'status' : 'success' , 'message' : 'Account actived, please login.' }
    return render(request , globalSettings.LOGIN_TEMPLATE , {'authStatus' : authStatus ,'useCDN' : globalSettings.USE_CDN})


def generateOTP(request):
    print request.POST
    key_expires = timezone.now() + datetime.timedelta(2)
    otp = generateOTPCode()
    user = get_object_or_404(User, username = request.POST['id'])
    ak = accountsKey(user= user, activation_key= otp,
        key_expires=key_expires , keyType = 'otp')
    ak.save()
    print ak.activation_key
    # send a SMS with the OTP
    return JsonResponse({} ,status =200 )

import json


@csrf_exempt
def loginView(request):
    if globalSettings.LOGIN_URL != 'login':
        return redirect(reverse(globalSettings.LOGIN_URL))
    authStatus = {'status' : 'default' , 'message' : '' }
    statusCode = 200
    if request.user.is_authenticated():
        if 'next' in request.GET:
            return redirect(request.GET['next'])
        else:
            return redirect(reverse(globalSettings.LOGIN_REDIRECT))
    if request.method == 'POST':
        print request.POST
    	usernameOrEmail = request.POST['username']
        otpMode = False
        if 'otp' in request.POST:
            print "otp"
            otp = request.POST['otp']
            otpMode = True
        else:
            password = request.POST['password']
        if '@' in usernameOrEmail and '.' in usernameOrEmail:
            u = User.objects.get(email = usernameOrEmail)
            username = u.username
        else:
            username = usernameOrEmail
            try:
                u = User.objects.get(username = username)
            except:
                statusCode = 404
        if not otpMode:
            user = authenticate(username = username , password = password)
        else:
            print "OTP Mode"
            ak = None
            try:
                aks = accountsKey.objects.filter(activation_key=otp , keyType='otp')
                ak = aks[len(aks)-1]
                print "Aks", aks,ak
            except:
                pass
            print ak
            if ak is not None:
                #check if the activation key has expired, if it has then render confirm_expired.html
                if ak.key_expires > timezone.now():
                    user = ak.user
                    user.backend = 'django.contrib.auth.backends.ModelBackend'
                else:
                    user = None
            else:
                authStatus = {'status' : 'danger' , 'message' : 'Incorrect OTP'}
                statusCode = 401

    	if user is not None:
            login(request , user)
            if request.GET and 'next' in request.GET:
                return redirect(request.GET['next'])
            else:
                if 'mode' in request.GET and request.GET['mode'] == 'api':
                    return JsonResponse({} , status = 200)
                else:
                    return redirect(reverse(globalSettings.LOGIN_REDIRECT))
        else:
            if statusCode == 200 and not u.is_active:
                authStatus = {'status' : 'warning' , 'message' : 'Your account is not active.'}
                statusCode = 423
            else:
                authStatus = {'status' : 'danger' , 'message' : 'Incorrect username or password.'}
                statusCode = 401

    if 'mode' in request.GET and request.GET['mode'] == 'api':
        return JsonResponse(authStatus , status = statusCode)


    return render(request , globalSettings.LOGIN_TEMPLATE , {'authStatus' : authStatus ,'useCDN' : globalSettings.USE_CDN , 'backgroundImage': globalSettings.LOGIN_PAGE_IMAGE , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT}, status=statusCode)

def registerView(request):
    if globalSettings.REGISTER_URL != 'register':
        return redirect(reverse(globalSettings.REGISTER_URL))
    msg = {'status' : 'default' , 'message' : '' }
    if request.method == 'POST':
    	name = request.POST['name']
    	email = request.POST['email']
    	password = request.POST['password']
        if User.objects.filter(email = email).exists():
            msg = {'status' : 'danger' , 'message' : 'Email ID already exists' }
        else:
            user = User.objects.create(username = email.replace('@' , '').replace('.' ,''))
            user.first_name = name
            user.email = email
            user.set_password(password)
            user.save()
            user = authenticate(username = email.replace('@' , '').replace('.' ,'') , password = password)
            login(request , user)
            if request.GET:
                return redirect(request.GET['next'])
            else:
                return redirect(globalSettings.LOGIN_REDIRECT)
    return render(request , 'register.simple.html' , {'msg' : msg})


def logoutView(request):
    logout(request)
    return redirect(globalSettings.LOGOUT_REDIRECT)

def root(request):
    return redirect(globalSettings.ROOT_APP)


@login_required(login_url = globalSettings.LOGIN_URL)
def home(request):
    u = request.user


    # permissions = permission.objects.filter(user = u)
    # print '####################################',permissions


    if u.is_superuser:
        apps = application.objects.all()
        modules = module.objects.filter(~Q(name='public'))
    else:
        apps = getApps(u)
        modules = getModules(u)
    apps = apps.filter(~Q(name__startswith='configure.' )).filter(~Q(name='app.users')).filter(~Q(name__endswith='.public'))
    try:
        accountObj = SocialAccount.objects.filter(user=request.user)
        if len(accountObj)>0:
            page = 'customerIndex.html'
        else:
            page = 'ngBase.html'
    except:
        page = 'ngBase.html'
    return render(request , page , {'wampServer' : globalSettings.WAMP_SERVER, 'appsWithJs' : apps.filter(haveJs=True) \
    ,'appsWithCss' : apps.filter(haveCss=True) , 'modules' : modules , 'useCDN' : globalSettings.USE_CDN , 'BRAND_LOGO' : globalSettings.BRAND_LOGO \
    ,'BRAND_NAME' :  globalSettings.BRAND_NAME})

class userProfileViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = userProfileSerializer
    queryset = profile.objects.all()

class userProfileAdminModeViewSet(viewsets.ModelViewSet):
    permission_classes = (isAdmin ,)
    serializer_class = userProfileAdminModeSerializer
    queryset = profile.objects.all()

# # class userDesignationViewSet(viewsets.ModelViewSet):
# #     permission_classes = (permissions.IsAuthenticated,)
# #     serializer_class = userDesignationSerializer
# #     queryset = designation.objects.all()
# #     def get_queryset(self):
# #         if 'user' in self.request.GET:
# #             return designation.objects.filter(user = self.request.GET['user'])
# #         else:
# #             return designation.objects.all()
#

class userAdminViewSet(viewsets.ModelViewSet):
    permission_classes = (isAdmin ,)
    queryset = User.objects.all()
    serializer_class = userAdminSerializer


class UserViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated ,)
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['username']
    serializer_class = userSerializer
    def get_queryset(self):

        if 'getCustomers' in self.request.GET:
            # a = list(permission.objects.filter(app = application.objects.get(name = "app.customer.access")).values_list('user', flat=True).distinct())
            usersList = list(SocialAccount.objects.all().values_list('user',flat=True).distinct())
            if int(self.request.GET['getCustomers']) == 1:
                return User.objects.filter(pk__in=usersList)
            else:
                return User.objects.filter(~Q(pk__in=usersList))


        if 'mode' in self.request.GET:
            if self.request.GET['mode']=="mySelf":
                if self.request.user.is_authenticated:
                    return User.objects.filter(username = self.request.user.username)
                else:
                    raise PermissionDenied()
            else :
                return User.objects.all().order_by('-date_joined')
        else:
            return User.objects.all().order_by('-date_joined')

class UserSearchViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated ,)
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['username']
    serializer_class = userSearchSerializer
    queryset = User.objects.all()
    def get_queryset(self):
        if 'mode' in self.request.GET:
            if self.request.GET['mode']=="mySelf":
                if self.request.user.is_authenticated:
                    return User.objects.filter(username = self.request.user.username)
                else:
                    raise PermissionDenied()
            else :
                return User.objects.all().order_by('-date_joined')
        else:
            # if 'getCustomers' in self.request.GET:
            #     a = list(permission.objects.filter(app = application.objects.get(name = "app.customer.access")).values_list('user', flat=True).distinct())
            #     return User.objects.filter(pk__in=a)
            return User.objects.all().order_by('-date_joined')

class GroupViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = Group.objects.all()
    serializer_class = groupSerializer

class rankViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = rank.objects.all()
    serializer_class = rankSerializer

class payrollViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = payroll.objects.all()
    serializer_class = payrollSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['user' ]

#
# # class leaveViewSet(viewsets.ModelViewSet):
# #     permission_classes = (permissions.IsAuthenticated,)
# #     serializer_class = leaveSerializer
# #     filter_backends = [DjangoFilterBackend]
# #     filter_fields = ['user']
# #     def get_queryset(self):
# #         if self.request.user.is_superuser:
# #             return Leave.objects.all()
# #         desigs = self.request.user.managing.all()
# #         reportees = []
# #         for d in desigs:
# #             reportees.append(d.user)
# #         return Leave.objects.filter(user__in = reportees )
#
#
# class LeavesCalAPI(APIView):
#     def get(self , request , format = None):
#         payrollObj = payroll.objects.get(user = self.request.user.pk)
#         print payrollObj,payrollObj.off
#         fromDate = self.request.GET['fromDate'].split('-')
#         toDate = self.request.GET['toDate'].split('-')
#         fd = date(int(fromDate[0]), int(fromDate[1]), int(fromDate[2]))
#         td = date(int(toDate[0]), int(toDate[1]), int(toDate[2]))
#         fromDate = fd + relativedelta(days=1)
#         toDate = td + relativedelta(days=1)
#         chObj = CompanyHolidays.objects.filter(date__range=(str(fromDate),str(toDate)))
#         print fromDate,toDate
#         total = (toDate-fromDate).days + 1
#         if toDate<fromDate:
#             total = 0
#         holidays = []
#         sundays = []
#         saturdays = []
#         leaves = 0
#
#         if total > 0:
#             daysList = [fromDate + relativedelta(days=i) for i in range(total)]
#             print daysList
#             for i in daysList:
#                 print i,i.weekday()
#                 if i.weekday() < 5:
#                     print 'holidays',holidays
#                     for j in chObj:
#                         if j.date == i:
#                             holidays.append({'date':i,'name':j.name})
#                 elif payrollObj.off and i.weekday() == 5:
#                     print 'saturday'
#                     saturdays.append(i)
#                 elif i.weekday() == 6:
#                     print 'sunday'
#                     sundays.append(i)
#             leaves = total - (len(holidays) + len(sundays) + len(saturdays))
#         print total
#         print holidays
#         print sundays
#         print saturdays
#         print leaves
#         toSend = {'total':total,'holidays':holidays,'sundays':sundays,'saturdays':saturdays,'leaves':leaves,'fromDate':fromDate,'toDate':toDate}
#         return Response({'data':toSend}, status = status.HTTP_200_OK)
#
# # class ProfileOrgChartsViewSet(viewsets.ModelViewSet):
# #     permission_classes = (permissions.IsAuthenticated,)
# #     queryset = designation.objects.all()
# #     serializer_class = ProfileOrgChartsSerializer
#
# def findChild(d, pk = None):
#     toReturn = []
#     sameLevel = False
#     for des in  d.user.managing.all():
#         try:
#             dp = des.user.profile.displayPicture.url
#             if dp == None:
#                 dp = '/static/images/userIcon.png'
#         except:
#             dp = '/static/images/userIcon.png'
#
#         if des.role:
#             role = des.role.name
#         else:
#             role = ''
#
#         if str(des.user.pk) == pk:
#             for tr in toReturn:
#                 tr['className'] = 'rd-dept'
#
#             clsName = 'middle-level'
#             sameLevel = True
#         else:
#             clsName = 'product-dept'
#             if sameLevel:
#                 clsName = 'rd-dept'
#
#         print des.user , clsName
#
#         toReturn.append({
#             "id" : des.user.pk,
#             "name" : des.user.first_name + ' ' +  des.user.last_name,
#             "dp" : dp,
#             "children" : findChild(des),
#             "role" : role,
#             "className" :  clsName
#         })
#
#     return toReturn
#
#
# #
# # class OrgChartAPI(APIView):
# #     def get(self , request , format = None):
# #         d = User.objects.get(pk = request.GET['user']).designation
# #         print d.role,d.reportingTo
# #         if d.reportingTo is not None:
# #             d = d.reportingTo.designation
# #         try:
# #             dp = d.user.profile.displayPicture.url
# #             if dp == None:
# #                 dp = '/static/images/userIcon.png'
# #
# #         except:
# #             dp = '/static/images/userIcon.png'
# #
# #         if d.role:
# #             role = d.role.name
# #         else:
# #             role = ''
# #
# #
# #         if str(d.user.pk) == request.GET['user']:
# #             clsName = 'middle-level'
# #         else:
# #             clsName = 'product-dept'
# #
# #
# #         toReturn = {
# #             "id" : d.user.pk,
# #             "name" : d.user.first_name + ' ' +  d.user.last_name,
# #             "dp" : dp,
# #             "children" : findChild(d , pk = request.GET['user']),
# #             "role" : role,
# #             "className" :  clsName
# #         }
# #
# #         return Response(toReturn )
#
# class SMSViewSet(viewsets.ModelViewSet):
#     permission_classes = (permissions.AllowAny,)
#     # queryset = SMS.objects.all()
#     serializer_class = SMSSerializer
#     filter_backends = [DjangoFilterBackend]
#     filter_fields = ['frm','user']
#     def get_queryset(self):
#         return SMS.objects.all().order_by('dated')
#
# class callViewSet(viewsets.ModelViewSet):
#     permission_classes = (permissions.AllowAny,)
#     # queryset = Call.objects.all()
#     serializer_class = CallSerializer
#     filter_backends = [DjangoFilterBackend]
#     filter_fields = ['frmOrTo','user','typ' ]
#     def get_queryset(self):
#         return Call.objects.all().order_by('-dated')
#
# class locationViewSet(viewsets.ModelViewSet):
#     permission_classes = (permissions.AllowAny,)
#     # queryset = Location.objects.all()
#     serializer_class = LocationSerializer
#     filter_backends = [DjangoFilterBackend]
#     filter_fields = ['lat','user' ]
#     def get_queryset(self):
#         return Location.objects.all().order_by('-created')
#
# class MobileContactViewSet(viewsets.ModelViewSet):
#     permission_classes = (permissions.AllowAny,)
#     queryset = MobileContact.objects.all()
#     serializer_class = MobileContactSerializer
#     filter_backends = [DjangoFilterBackend]
#     filter_fields = ['name','user','mobile' ]
#
# class EmailViewSet(viewsets.ModelViewSet):
#     permission_classes = (permissions.AllowAny,)
#     # queryset = Email.objects.all()
#     serializer_class = EmailSerializer
#     filter_backends = [DjangoFilterBackend, filters.SearchFilter]
#     filter_fields = ['messageId','user','subject']
#     search_fields = ('subject', 'frm')
#     def get_queryset(self):
#         print self.request.GET
#         ret = Email.objects.all().order_by('-dated')
#         if 'user' in self.request.GET:
#             if 'Inbox' in self.request.GET and 'Sent' in self.request.GET:
#                 userEmail = User.objects.get(pk=int(self.request.GET['user'])).email
#                 userEmail = '<'+str(userEmail)+'>'
#                 print userEmail
#                 if int(self.request.GET['Inbox']) and not int(self.request.GET['Sent']):
#                     print 'onlyyy inboxxxxxxxxxx'
#                     ret = ret.exclude(frm__endswith=userEmail)
#                 if int(self.request.GET['Sent']) and not int(self.request.GET['Inbox']):
#                     print 'onlyyyyyyy senttttttttttt'
#                     ret = ret.filter(frm__endswith=userEmail)
#                 if not int(self.request.GET['Sent']) and not int(self.request.GET['Inbox']):
#                     print 'nothingggggggggggg'
#                     ret = Email.objects.none()
#         return ret
#
# class UserCallHistoryGraphAPI(APIView):
#     def get(self , request , format = None):
#         user = request.GET['user']
#         print user
#         userObj = User.objects.get(pk=int(user))
#         userCallObj = userObj.callAuthored.all()
#         incObj = list(userCallObj.filter(typ='INCOMING').values('frmOrTo').annotate(cout=Count('frmOrTo')).order_by('-cout'))[:10]
#         outObj = list(userCallObj.filter(typ='OUTGOING').values('frmOrTo').annotate(cout=Count('frmOrTo')).order_by('-cout'))[:10]
#         msdObj = list(userCallObj.filter(typ='MISSED').values('frmOrTo').annotate(cout=Count('frmOrTo')).order_by('-cout'))[:10]
#         incCount = []
#         incNumber = []
#         outCount = []
#         outNumber = []
#         msdCount = []
#         msdNumber = []
#         for i in incObj:
#             incCount.append(i['cout'])
#             try:
#                 mobj = MobileContact.objects.filter(mobile__icontains=str(i['frmOrTo']))
#                 if mobj.count()>0 and mobj[0].name:
#                     incNumber.append(mobj[0].name)
#                 else:
#                     incNumber.append(i['frmOrTo'])
#             except:
#                 incNumber.append(i['frmOrTo'])
#         for i in outObj:
#             outCount.append(i['cout'])
#             try:
#                 mobj = MobileContact.objects.filter(mobile__icontains=str(i['frmOrTo']))
#                 if mobj.count()>0 and mobj[0].name:
#                     outNumber.append(mobj[0].name)
#                 else:
#                     outNumber.append(i['frmOrTo'])
#             except:
#                 outNumber.append(i['frmOrTo'])
#         for i in msdObj:
#             msdCount.append(i['cout'])
#             try:
#                 mobj = MobileContact.objects.filter(mobile__icontains=str(i['frmOrTo']))
#                 if mobj.count()>0 and mobj[0].name:
#                     msdNumber.append(mobj[0].name)
#                 else:
#                     msdNumber.append(i['frmOrTo'])
#             except:
#                 msdNumber.append(i['frmOrTo'])
#
#         # try:
#         #     bankRawYearsList = sorted(list(RawData.objects.filter(bankstatement__bankAct__user=userObj).annotate(year=ExtractYear('dat')).values_list('year',flat=True).distinct()))
#         # except:
#         #     bankRawYearsList = []
#         toReturn = {'incCount':incCount,'incNumber':incNumber,'outCount':outCount,'outNumber':outNumber,'msdCount':msdCount,'msdNumber':msdNumber}
#
#         return JsonResponse(toReturn ,status =200 )
#
# class FetchGraphDataAPI(APIView):
#     def get(self , request , format = None):
#         print request.GET
#         yer = request.GET['year']
#         userObj = User.objects.get(pk=int(request.GET['user']))
#         rawObj = RawData.objects.filter(bankstatement__bankAct__user=userObj)
#         debList = []
#         cdtList = []
#         for i in range(1,13):
#             start = datetime.date(int(yer),i,1) + relativedelta(months=-1)
#             end = start + relativedelta(months=1,days=-1)
#             deb = rawObj.filter(dat__range=(start,end)).aggregate(total=Sum('debit')).values()
#             deb = round(deb[0],2) if deb[0] else 0
#             cdt = rawObj.filter(dat__range=(start,end)).aggregate(total=Sum('credit')).values()
#             cdt = round(cdt[0],2) if cdt[0] else 0
#             debList.append(deb)
#             cdtList.append(cdt)
#         return JsonResponse({'debList':debList,'cdtList':cdtList} ,status =200 )
#
# class SmsClassifierAPI(APIView):
#     permission_classes = (permissions.IsAuthenticated ,)
#     def get(self , request , format = None):
#         print request.GET
#         nullSms = SMS.objects.filter(typ__isnull=True)
#         if nullSms.count()>0:
#             smsData = list(nullSms.values('pk').annotate(category=Value('credit_card', output_field=CharField()),message=F('body')).order_by('pk'))
#             print len(smsData)
#             smsData =  json.dumps(smsData)
#             filName = os.path.join(os.path.dirname(globalSettings.BASE_DIR) , 'classifier' , 'data' , 'small_samples.json')
#             with open(filName, 'w+') as fp:
#                 fp.write(smsData)
#             classifierDir = os.path.dirname(globalSettings.BASE_DIR) + '/classifier/'
#             cmdExecute = classifierDir + 'predict.py ' + classifierDir + 'trained_model_{0}/ '.format(globalSettings.SMS_TRAINED_MODEL) + classifierDir + 'data/small_samples.json'
#             print cmdExecute
#             os.system('python3 {0}'.format(cmdExecute))
#             with open(classifierDir + 'data/small_samples_prediction.json','r+') as json_file:
#                 jsonData = json.load(json_file)
#                 print len(jsonData)
#                 # json_file.close()
#             for i in jsonData:
#                 try:
#                     print i['pk'],'****************'
#                     smsObj = SMS.objects.get(pk=int(i['pk']))
#                     smsObj.typ = i['new_prediction']
#                     smsObj.save()
#                 except:
#                     pass
#         return JsonResponse({} ,status=status.HTTP_200_OK,safe=False)
#
# class SmsTrainClassifierAPI(APIView):
#     permission_classes = (permissions.IsAuthenticated ,)
#     def get(self , request , format = None):
#         print request.GET
#         smaObj = SMS.objects.filter(typ__isnull=False)
#         print smaObj.count()
#         if smaObj.count()>0:
#             # smsData = list(smaObj.values('pk').annotate(category=F('typ'),message=Func(F('body'),Value('\n'), Value(' '),function='replace',)).order_by('pk'))
#             smsData = list(smaObj.values('pk').annotate(category=F('typ'),message=F('body')).order_by('pk'))
#             smsData =  json.dumps(smsData)
#             filName = os.path.join(os.path.dirname(globalSettings.BASE_DIR) , 'classifier' , 'data' , 'sms_consumer_complaints.json')
#             with open(filName, 'w+') as fp:
#                 fp.write(smsData)
#             classifierDir = os.path.dirname(globalSettings.BASE_DIR) + '/classifier/'
#             cmdExecute = classifierDir + 'train.py ' + classifierDir + 'data/sms_consumer_complaints.json ' + classifierDir + 'parameters.json'
#             print cmdExecute
#             os.system('python3 {0}'.format(cmdExecute))
#
#
#         return JsonResponse({} ,status=status.HTTP_200_OK,safe=False)
#
# class EmailsTrainAPI(APIView):
#     permission_classes = (permissions.IsAuthenticated ,)
#     def get(self , request , format = None):
#         print request.GET
#         emailObj = Email.objects.exclude(category='na')
#         print emailObj.count()
#         if emailObj.count()>0:
#             emailData = list(emailObj.values('pk','category').annotate(message=F('bodyTxt')).order_by('pk'))
#             print len(emailData)
#             keys = emailData[0].keys()
#             filName = os.path.join(os.path.dirname(globalSettings.BASE_DIR) , 'classifier' , 'data' , 'email_consumer_complaints.csv')
#             with open(filName, 'wb') as output_file:
#                 dict_writer = csv.DictWriter(output_file, keys)
#                 dict_writer.writeheader()
#                 dict_writer.writerows(emailData)
#             df = pd.read_csv(filName)
#             df.to_csv(filName)
#             classifierDir = os.path.dirname(globalSettings.BASE_DIR) + '/classifier/'
#             cmdExecute = classifierDir + 'train.py ' + classifierDir + 'data/email_consumer_complaints.csv ' + classifierDir + 'parameters.json'
#             print cmdExecute
#             os.system('python3 {0}'.format(cmdExecute))
#
#
#         return JsonResponse({} ,status=status.HTTP_200_OK,safe=False)
#
#
# class emailSaveAPI(APIView):
#     def get(self , request , format = None):
#         socialAcc = SocialAccount.objects.get(user=request.GET['userId'])
#         print socialAcc
#         tokens = SocialToken.objects.get(pk = socialAcc.pk)
#         with open('HR/storage.json','r+') as json_file:
#             data = json.load(json_file)
#             data['token_response']['access_token'] = tokens.token
#             data['access_token'] = tokens.token
#             data['refresh_token'] = tokens.token_secret
#             json.dumps(data)
#             json_file.close()
#             jsonFile = open("HR/storage.json", "w+")
#             jsonFile.write(json.dumps(data))
#             jsonFile.close()
#         return JsonResponse({} ,status =200 )
# import gmailread
# class emailDataSaveAPI(APIView):
#     def get(self , request , format = None):
#         print request.GET
#         typ = request.GET['typ']
#         u = User.objects.get(pk  = request.GET['userId'])
#         print "Age : ", u.profile.gmailAge
#         # if u.profile.gmailAge is None:
#         # gmailread.calculateAge(u)
#
#         a = gmailread.allData(u,typ)
#
#         return JsonResponse({} ,status =200 )
#
# class BankAccountViewSet(viewsets.ModelViewSet):
#     permission_classes = (permissions.AllowAny,)
#     queryset = BankAccount.objects.all()
#     serializer_class = BankAccountSerializer
#     filter_backends = [DjangoFilterBackend]
#     filter_fields = ['user' ]
#
# class BankStatementViewSet(viewsets.ModelViewSet):
#     permission_classes = (permissions.AllowAny,)
#     queryset = BankStatement.objects.all()
#     serializer_class = BankStatementSerializer
#     filter_backends = [DjangoFilterBackend]
#     filter_fields = ['bankAct' ]
#
# class RawDataViewSet(viewsets.ModelViewSet):
#     permission_classes = (permissions.AllowAny,)
#     # queryset = RawData.objects.all()
#     serializer_class = RawDataSerializer
#     filter_backends = [DjangoFilterBackend]
#     filter_fields = ['bankstatement' ]
#     def get_queryset(self):
#         return RawData.objects.all().order_by('dat')
#
# class SettingTypesViewSet(viewsets.ModelViewSet):
#     permission_classes = (permissions.AllowAny,)
#     queryset = SettingTypes.objects.all()
#     serializer_class = SettingTypesSerializer
#     filter_backends = [DjangoFilterBackend]
#     filter_fields = ['typ','name' ]
#
# class BankStatementUploadAPI(APIView):
#     permission_classes = (permissions.IsAuthenticated ,)
#
#     def post(self , request , format = None):
#         res = []
#         excelFile = request.FILES['excelFile']
#         userObj = User.objects.get(pk=int(request.POST['user']))
#         wb = load_workbook(filename = BytesIO(excelFile.read()) ,  read_only=True)
#
#         bStatementObj = ''
#         for ws in wb.worksheets:
#             wsTitle = ws.title
#             if wsTitle.lower() == 'analysis':
#                 print 'analysissssssssssss'
#                 try:
#                     bAccountObj = BankAccount.objects.get(accNumber=str(ws['B4'].value),bankName=str(ws['B5'].value),user=userObj)
#                     print 'thereeeeeee'
#                 except:
#                     print 'newwwwwwwww'
#                     data = {'user':userObj,'accNumber':str(ws['B4'].value),'bankName':str(ws['B5'].value),'typ':str(ws['B6'].value).upper()}
#                     if str(ws['B7'].value)!='null':
#                         data['ifscCode'] = str(ws['B7'].value)
#                     bAccountObj = BankAccount.objects.create(**data)
#
#                 data = {'bankAct':bAccountObj,'attachment':excelFile}
#                 bStatementObj = BankStatement.objects.create(**data)
#
#             elif  wsTitle.lower() == 'raw data':
#                 print 'raw Dataaaaaaaaaa',bStatementObj
#                 dt = ''
#                 desc = ''
#                 flc = ''
#                 slc = ''
#                 dbt = ''
#                 cdt = ''
#                 bal = ''
#                 try:
#                     first_row = list(ws.rows)[0]
#                     for idx,cell in enumerate(first_row):
#                         if str(cell.value).lower() == 'date':
#                             dt = str(get_column_letter(idx+1))
#                         elif str(cell.value).lower() == 'description':
#                             desc = str(get_column_letter(idx+1))
#                         elif str(cell.value).lower() == 'first level category':
#                             flc = str(get_column_letter(idx+1))
#                         elif str(cell.value).lower() == 'second level category':
#                             slc = str(get_column_letter(idx+1))
#                         elif str(cell.value).lower() == 'debit':
#                             dbt = str(get_column_letter(idx+1))
#                         elif str(cell.value).lower() == 'credit':
#                             cdt = str(get_column_letter(idx+1))
#                         elif str(cell.value).lower() == 'balance':
#                             bal = str(get_column_letter(idx+1))
#                     print dt,desc,flc,slc,dbt,cdt,bal
#                 except:
#                     pass
#                 for i in range(2,ws.max_row+1):
#                     data = {}
#                     try:
#                         data['bankstatement'] = bStatementObj
#                         try:
#                             data['dat'] = ws[dt+str(i)].value.date()
#                         except:
#                             print 'dateeeeeeee is not addedddddddddd'
#                         try:
#                             data['description'] = str(ws[desc+str(i)].value)
#                         except:
#                             data['description'] = ws[desc+str(i)].value
#                         try:
#                             data['firstLCat'] = str(ws[flc+str(i)].value)
#                         except:
#                             data['firstLCat'] = ws[flc+str(i)].value
#                         try:
#                             data['secondLCat'] = str(ws[slc+str(i)].value)
#                         except:
#                             data['secondLCat'] = ws[slc+str(i)].value
#                         try:
#                             data['debit'] = float(ws[dbt+str(i)].value)
#                         except:
#                             data['debit'] = ws[dbt+str(i)].value
#                         try:
#                             data['credit'] = float(ws[cdt+str(i)].value)
#                         except:
#                             data['credit'] = ws[cdt+str(i)].value
#                         try:
#                             data['balance'] = float(ws[bal+str(i)].value)
#                         except:
#                             data['balance'] = ws[bal+str(i)].value
#
#                         rawObj = RawData.objects.create(**data)
#
#                     except:
#                         print 'row numberrrrrrrrrrrrr {0} in rawData - {1} is not created'.format(i,wsTitle)
#
#         return Response(res, status=status.HTTP_200_OK)
