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
from ERP.models import application, permission , module ,service
from ERP.views import getApps, getModules
from django.db.models import Q
from django.http import JsonResponse
import random, string
from django.utils import timezone
from rest_framework.views import APIView
from PIM.models import blogPost
from django.utils import translation
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response

def index(request):
    if request.COOKIES.get('lang') == None:
        language = translation.get_language_from_request(request)
    else:
        language = request.COOKIES.get('lang')

    translation.activate(language )
    request.LANGUAGE_CODE = translation.get_language()
    return render(request, 'index.html', {"home": True , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})

def crmHome(request):
    return render(request, 'crm.html', {"home": True , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})

@csrf_exempt
def customerLoginView(request):
    print 'cameeeeeeeeeeeeeeeeeeeeeeeeeeee'
    authStatus = {'status' : 'default' , 'message' : '' }
    def loginRender(authStatus):
        return render(request, 'customerLogin.html', {'authStatus' : authStatus ,'useCDN' : globalSettings.USE_CDN , 'backgroundImage': globalSettings.LOGIN_PAGE_IMAGE , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT} )
    def go_next():
        nxt = request.GET.get('next','/customerhome')
        return redirect(nxt)

    if request.user.is_authenticated:
        return go_next()

    if 'GET' == request.method:
        return loginRender(authStatus)
    elif 'POST' == request.method:
        print request.POST
        userObj = User.objects.filter(username = request.POST['username'])
        if len(userObj)>0:
            sObj = userObj[0].servicesContactPerson.all()
            if len(sObj)>0:
                user = authenticate(username = request.POST['username'] , password = request.POST['password'])
                if user is not None:
                    login(request , user)
                    return go_next()
                else:
                    authStatus = {'status' : 'danger' , 'message' : "Incorrect username or password."}
                    return loginRender(authStatus)
            else:
                authStatus = {'status' : 'danger' , 'message' : "Not A Right Person"}
                return loginRender(authStatus)
        else:
            authStatus = {'status' : 'danger' , 'message' : "You Don't Have An Account"}
            return loginRender(authStatus)

@login_required(login_url = '/customer/login')
def customerHomeView(request):
    return render(request, 'customerHome.html' )


def blogDetails(request, blogname):
    blogobj = blogPost.objects.get(title=blogname)
    title = blogobj.title
    header = blogobj.header
    us = ''
    blogId = blogobj.pk
    count = 0
    for j in blogobj.users.all():
        if count == 0:
            us = j.first_name + ' ' + j.last_name
        else:
            us += ' , ' + j.first_name + ' ' + j.last_name
        count += 1
    date = blogobj.created
    body = blogobj.source
    return render(request, 'blogdetails.html', {"home": False, 'user': us, 'header': header, 'title': title, 'date': date, 'blogId': blogId, 'body': body , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})

def blog(request):

    blogObj = blogPost.objects.all()
    pagesize = 1
    try:
        page = int(request.GET.get('page', 1))
    except ValueError as error:
        page = 1
    total = blogObj.count()
    last = total/pagesize + (1 if total%pagesize !=0 else 0)
    # data = blogObj[(page-1)*pagesize:(page*pagesize)]
    pages = {'first':1,
			'prev':(page-1) if page >1 else 1,
			'next':(page+1) if page !=last else last,
			'last':last,
			'currentpage':page}

    data = [ ]
    for i in blogObj:
        title = i.title
        header = i.header
        us = ''
        blogId = i.pk
        for j in i.users.all():
            us = j.first_name + ' ' + j.last_name
        date = i.created
        # body = i.source
        data.append({'user':us , 'header' : header , 'title' : title , 'date' : date , 'blogId' : blogId})
    data = data[(page-1)*pagesize:(page*pagesize)]
    return render(request,"blog.html" , {"home" : False ,'data' : data ,'pages':pages , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})

def news(request):
    return render(request,"newssection.html" , {"home" : False , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})

def team(request):
    return render(request,"team.html" , {"home" : False , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})

def career(request):
    return render(request,"career.html" , {"home" : False , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})

def policy(request):
    return render(request,"policy.html" , {"home" : False , "brandName" : globalSettings.BRAND_NAME , "site" : globalSettings.SITE_ADDRESS , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})

def terms(request):
    return render(request,"terms.html" , {"home" : False , "brandName" : globalSettings.BRAND_NAME  , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})

def refund(request):
    return render(request,"refund.html" , {"home" : False , "brandName" : globalSettings.BRAND_NAME , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})

def contacts(request):
    return render(request,"contacts.html" , {"home" : False , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})

def registration(request):
    return render(request,"registration.html" , {"home" : False , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})


# class scheduleViewSet(viewsets.ModelViewSet):
#     permission_classes = (permissions.AllowAny , )
#     queryset = Schedule.objects.all()
#     serializer_class = sheduleSerializer
#     # filter_fields = ['name','vendor']
#     # search_fields = ('name','web')
# 
# from ics import Calendar, Event
# from datetime import date
# from email.MIMEBase import MIMEBase
# from datetime import datetime
# import time
# import datetime
# from dateutil import parser
# class InvitationMailApi(APIView):
#     renderer_classes = (JSONRenderer,)
#     permission_classes = (permissions.AllowAny , )
#     def post(self, request, format=None):
#         emailid=[]
#         cc = ['ankita.k@cioc.in']
#         print  request.data,'aaaaaaaaaa'
#         schedule =  Schedule.objects.get(pk = request.data['value'])
#         time = schedule.slot.split(' - ')
#         strttime = int(time[0])
#         endtime = int(time[1])
#         newDate =  datetime.datetime.strptime(str(schedule.dated), '%Y-%m-%d').strftime('%Y%m%d %H:%M:%S')
#         yourDate = parser.parse(newDate)
#
#         begindate = yourDate.replace(hour=strttime, minute=00)
#         enddate = yourDate.replace(hour=endtime, minute=00)
#         emailid.append(schedule.emailId)
#         email_subject ="Meeting as per your request"
#         c = Calendar()
#         e = Event()
#         e.name = "Meeting"
#         e.begin = begindate
#         e.end = enddate
#         e.organizer = 'ankita.k@cioc.in'
#         c.events.add(e)
#         c.attendee =  schedule.emailId
#         with open('my.ics', 'w') as f:
#              f.writelines(c)
#         ctx = {
#             # 'message': msgBody,
#             'dated': schedule.dated,
#             'slot' :  schedule.slot,
#             'linkUrl': 'cioc.co.in',
#             'linkText' : 'View Online',
#             'sendersAddress' : '(C) CIOC FMCG Pvt Ltd',
#             'sendersPhone' : '841101',
#             'linkedinUrl' : 'https://www.linkedin.com/company/13440221/',
#             'fbUrl' : 'facebook.com',
#             'twitterUrl' : 'twitter.com',
#         }
#
#         icspart = MIMEBase('text', 'calendar', **{'method' : 'REQUEST', 'name' : 'my.ics'})
#         icspart.set_payload( open("my.ics","rb").read() )
#         icspart.add_header('Content-Transfer-Encoding', '8bit')
#         icspart.add_header('Content-class', 'urn:content-classes:calendarmessage')
#         email_body = get_template('app.homepage.inviteemail.html').render(ctx)
#         msg = EmailMessage(email_subject, email_body,  to= emailid, cc= cc )
#         msg.attach(icspart)
#         msg.content_subtype = 'html'
#         msg.send()
#
#         return Response({}, status = status.HTTP_200_OK)
