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
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
import sendgrid
import os


def index(request):
    return render(request, 'index.html', {"home": True , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT , 'brandName' : globalSettings.BRAND_NAME,'seoDetails':{'title':globalSettings.SEO_TITLE,'description':globalSettings.SEO_DESCRIPTION,'image':globalSettings.SEO_IMG,'width':globalSettings.SEO_IMG_WIDTH,'height':globalSettings.SEO_IMG_HEIGHT,'author':globalSettings.SEO_AUTHOR,'twitter_creator':globalSettings.SEO_TWITTER_CREATOR,'twitter_site':globalSettings.SEO_TWITTER_SITE,'site_name':globalSettings.SEO_SITE_NAME,'url':globalSettings.SEO_URL,'publisher':globalSettings.SEO_PUBLISHER}})



def blogDetails(request, blogname):
    blogobj = blogPost.objects.get(shortUrl=blogname)
    us = ''
    blogId = blogobj.pk
    count = 0
    for j in blogobj.users.all():
        if count == 0:
            us = j.first_name + ' ' + j.last_name
        else:
            us += ' , ' + j.first_name + ' ' + j.last_name
        count += 1
    blogobj.created = blogobj.created.replace(microsecond=0)
    return render(request, 'blogdetails.html', {"home": False, "tagsCSV" :  blogobj.tagsCSV.split(',') , 'user': us, 'blogobj' : blogobj , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT,'seoDetails':{'title':globalSettings.SEO_TITLE,'description':globalSettings.SEO_DESCRIPTION,'image':globalSettings.SEO_IMG,'width':globalSettings.SEO_IMG_WIDTH,'height':globalSettings.SEO_IMG_HEIGHT,'author':globalSettings.SEO_AUTHOR,'twitter_creator':globalSettings.SEO_TWITTER_CREATOR,'twitter_site':globalSettings.SEO_TWITTER_SITE,'site_name':globalSettings.SEO_SITE_NAME,'url':globalSettings.SEO_URL,'publisher':globalSettings.SEO_PUBLISHER}})

def blog(request):

    blogObj = blogPost.objects.all().order_by('-created')
    pagesize = 6
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
        data.append({'user':us , 'header' : header , 'title' : title , 'date' : date , 'blogId' : blogId , 'url' : i.shortUrl })
    data = data[(page-1)*pagesize:(page*pagesize)]

    return render(request,"blog.html" , {"home" : False ,'data' : data, 'dataLen' : len(data) ,'pages':pages , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT , 'brandName' : globalSettings.BRAND_NAME,'seoDetails':{'title':globalSettings.SEO_TITLE,'description':globalSettings.SEO_DESCRIPTION,'image':globalSettings.SEO_IMG,'width':globalSettings.SEO_IMG_WIDTH,'height':globalSettings.SEO_IMG_HEIGHT,'author':globalSettings.SEO_AUTHOR,'twitter_creator':globalSettings.SEO_TWITTER_CREATOR,'twitter_site':globalSettings.SEO_TWITTER_SITE,'site_name':globalSettings.SEO_SITE_NAME,'url':globalSettings.SEO_URL,'publisher':globalSettings.SEO_PUBLISHER}})

def news(request):
    return render(request,"newssection.html" , {"home" : False , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT , 'brandName' : globalSettings.BRAND_NAME})

def team(request):
    return render(request,"team.html" , {"home" : False , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT , 'brandName' : globalSettings.BRAND_NAME})

def career(request):
    return render(request,"career.html" , {"home" : False , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT , 'brandName' : globalSettings.BRAND_NAME})

def policy(request):
    return render(request,"policy.html" , {"home" : False , "brandName" : globalSettings.BRAND_NAME , "site" : globalSettings.SITE_ADDRESS , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT , 'brandName' : globalSettings.BRAND_NAME})

def terms(request):
    return render(request,"terms.html" , {"home" : False , "brandName" : globalSettings.BRAND_NAME  , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT , 'brandName' : globalSettings.BRAND_NAME})

def refund(request):
    return render(request,"refund.html" , {"home" : False , "brandName" : globalSettings.BRAND_NAME , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT , 'brandName' : globalSettings.BRAND_NAME})

def contacts(request):
    return render(request,"contacts.html" , {"home" : False , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT , 'brandName' : globalSettings.BRAND_NAME})


def desclaimer(request):
    return render(request,"desclaimer.html" , {"home" : False , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT , 'brandName' : globalSettings.BRAND_NAME})


def registration(request):

    if not globalSettings.LITE_REGISTRATION:
        return render(request,"registration.html" , {"home" : False ,"brand_title":globalSettings.SEO_TITLE,"autoActiveReg":globalSettings.AUTO_ACTIVE_ON_REGISTER , "brandLogo" : globalSettings.BRAND_LOGO ,'icon_logo':globalSettings.ICON_LOGO, "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT , 'brandName' : globalSettings.BRAND_NAME,'regextra':globalSettings.REGISTRATION_EXTRA_FIELD,'verifyMobile':globalSettings.VERIFY_MOBILE,'seoDetails':{'title':globalSettings.SEO_TITLE,'description':globalSettings.SEO_DESCRIPTION,'image':globalSettings.SEO_IMG,'width':globalSettings.SEO_IMG_WIDTH,'height':globalSettings.SEO_IMG_HEIGHT,'author':globalSettings.SEO_AUTHOR,'twitter_creator':globalSettings.SEO_TWITTER_CREATOR,'twitter_site':globalSettings.SEO_TWITTER_SITE,'site_name':globalSettings.SEO_SITE_NAME,'url':globalSettings.SEO_URL,'publisher':globalSettings.SEO_PUBLISHER}})

    else:
        mobile = ''
        if 'mobile' in request.POST:
            mobile = request.POST['mobile']
        return render(request,"registration.lite.html" , {'mobile':mobile,"home" : False ,"autoActiveReg":globalSettings.AUTO_ACTIVE_ON_REGISTER, "brand_title":globalSettings.SEO_TITLE,"brandLogo" : globalSettings.BRAND_LOGO , 'icon_logo':globalSettings.ICON_LOGO, "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT , 'brandName' : globalSettings.BRAND_NAME,'regextra':globalSettings.REGISTRATION_EXTRA_FIELD,'verifyMobile':globalSettings.VERIFY_MOBILE,'seoDetails':{'title':globalSettings.SEO_TITLE,'description':globalSettings.SEO_DESCRIPTION,'image':globalSettings.SEO_IMG,'width':globalSettings.SEO_IMG_WIDTH,'height':globalSettings.SEO_IMG_HEIGHT,'author':globalSettings.SEO_AUTHOR,'twitter_creator':globalSettings.SEO_TWITTER_CREATOR,'twitter_site':globalSettings.SEO_TWITTER_SITE,'site_name':globalSettings.SEO_SITE_NAME,'url':globalSettings.SEO_URL,'publisher':globalSettings.SEO_PUBLISHER}})


class RegistrationViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegistrationSerializer
    queryset = Registration.objects.all()

class EnquiryAndContactsViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny,)
    serializer_class = EnquiryAndContactsSerializer
    queryset = EnquiryAndContacts.objects.all()
from django.contrib.auth import authenticate , login
class UpdateInfoAPI(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.AllowAny ,)
    def post(self , request , format = None):
        print request.data,'%%%%%%%%%%%%%%%%'
        d = request.data
        u = request.user
        print u,'@@@@222'
        u.first_name = d['name']
        u.email = d['email']
        u.set_password(d['password'])
        u.backend = 'django.contrib.auth.backends.ModelBackend'
        u.save()

        try:
            pobj = profile.objects.get(pk=u.profile.pk)
            pObj.details = pObj.details + d
        except :
            pass



        # ctx = {
        #     'userData':d
        # }
        #
        # # Send email with activation key
        # email=d['email']
        # email_subject = 'New account'
        # email_body = get_template('app.ecommerce.newUserEmail.html').render(ctx)
        # if globalSettings.EMAIL_API:
        #     sg = sendgrid.SendGridAPIClient(apikey= globalSettings.G_KEY)
        #     # sg = sendgrid.SendGridAPIClient(apikey=os.environ.get('SENDGRID_API_KEY'))
        #     data = {
        #       "personalizations": [
        #         {
        #           "to": [
        #             {
        #               "email": "bhanubalram5@gmail.com"
        #               # str(orderObj.user.email)
        #             }
        #           ],
        #           "subject": email_subject
        #         }
        #       ],
        #       "from": {
        #         "email": globalSettings.G_FROM,
        #         "name":"BNI India"
        #       },
        #       "content": [
        #         {
        #           "type": "text/html",
        #           "value": email_body
        #         }
        #       ]
        #     }
        #     response = sg.client.mail.send.post(request_body=data)
        #     print(response.body,"bodyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy")
        # else:
        # msg = EmailMessage(email_subject, email_body, to= [email] , from_email= 'pkyisky@gmail.com' )
        # msg.content_subtype = 'html'
        # msg.send()
        login(request , u)
        return Response( status = status.HTTP_200_OK)
