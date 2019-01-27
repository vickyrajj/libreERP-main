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
from ERP.models import application, permission , module
from ERP.views import getApps, getModules
from django.db.models import Q
from django.http import JsonResponse
import random, string
from django.utils import timezone
from rest_framework.views import APIView
from PIM.models import blogPost
from LMS.models import *
import sys, traceback



def index(request):
    subobj = Subject.objects.all().order_by('level')
    return render(request, 'index.html', {"home": True , "subobj":subobj, "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})

def aboutUs(request):
    return render(request, 'aboutUs.html', {})

def contactUs(request):
    return render(request, 'contact.html', {})

def career(request):
    return render(request, 'career.html', {})

def desclaimer(request):
    return render(request, 'desclaimer.html', {})

def policy(request):
    return render(request, 'policy.html', {})

def terms(request):
    return render(request, 'terms.html', {})

def refund(request):
    return render(request, 'refund.html', {})

def testimonials(request):
    return render(request, 'testimonials.html', {})




def blogDetails(request, blogname):
    print '*****************blognameeee',blogname

    if blogname.startswith('class-') :
        print blogname,'-------------------'
        subPart = None
        if '/' in blogname:
            prts = blogname.split('/')
            blogname = prts[0]
            subPart = prts[1]
        level = str(blogname).split('-')[1]
        title = str(blogname).split('-')[2]
        sub = Subject.objects.get(title = title,level = int(level))
        print sub.pk
        print level,title,"------------hhhhh"
        courseobjs = Course.objects.filter(topic__subject__pk=sub.pk)
        booklen = len(Book.objects.filter(subject__pk=sub.pk))
        subobjs = Subject.objects.all().order_by('level')
        books = []
        videoCourse = []
        forum = []
        referenceBook = []
        notes = []
        if subPart == 'Books':
            pass
        if subPart == 'videoCourse':
            pass
        if subPart == 'forum':
            pass
        if subPart == 'referenceBook':
            pass
        if subPart == 'notes':
            pass
        print "sub part" , subPart

        return render(request, 'courses.html', {"courseobj":courseobjs,"subobj":subobjs,"level":level,"title":title , "subPart" : subPart, "booklen":booklen} )
    try:
        blogobj = blogPost.objects.get(shortUrl=blogname)
        print "got blog post"  , blogobj

        if blogobj.contentType == 'article':
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
            return render(request, 'blogdetails.html', {"home": False, "tagsCSV" :  blogobj.tagsCSV.split(',') , 'user': us, 'blogobj' : blogobj , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})
        elif blogobj.contentType == 'book':
            book = Book.objects.get(pk=blogobj.header)
            sectionobj = Section.objects.filter(book = book.pk)
            return render(request, 'book.html', {"home": False, "tagsCSV" :  blogobj.tagsCSV.split(','), 'book' : book ,'sectionobj':sectionobj,'blogobj' : blogobj, "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})
    except:

        traceback.print_exc(file=sys.stdout)
        sectionobj = Section.objects.get(shortUrl=blogname)
        blogobj = blogPost.objects.get(header=sectionobj.book.pk)
        print 'boookkkkkk',sectionobj.book
        sec = sectionobj.book.sections.order_by('sequence')
        prev = False
        nxt = False
        prevobj={}
        nxtvobj={}
        for a,i in enumerate(sec):
            print i.shortUrl , a
            if i.pk == sectionobj.pk:
                if len(sec) > 1:
                    if a == 0:
                        nxt = True
                        nxtvobj = sec[1]
                        print 'nxt',nxtvobj.shortUrl
                    elif a == len(sec)-1:
                        prev = True
                        prevobj = sec[a-1]
                        print 'prev',prevobj.shortUrl
                    else:
                        prev = True
                        nxt = True
                        prevobj = sec[a-1]
                        nxtvobj = sec[a+1]

        return render(request, 'bookContent.html', { "sections" : sec , "home": False, "tagsCSV" :  blogobj.tagsCSV.split(','),'sectionobj':sectionobj, 'book' : sectionobj.book ,'blogobj' : blogobj, "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT,'questions':sectionobj.questions.all(),'bot':{'prev':prev,'nxt':nxt,'prevobj':prevobj,'nxtvobj':nxtvobj}})


def blog(request):

    blogObj = blogPost.objects.filter(contentType='article').order_by('-created')
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

    return render(request,"blog.html" , {"home" : False ,'data' : data, 'dataLen' : len(data) ,'pages':pages , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})

def blogAnotherView(request):
    print
    allBlogs = list(blogPost.objects.filter(contentType='article').order_by('-created').values())
    pagesize = 13
    try:
        page = int(request.GET.get('page', 1))
    except ValueError as error:
        page = 1
    total = len(allBlogs)
    last = total/pagesize + (1 if total%pagesize !=0 else 0)
    pages = {'first':1,
			'prev':(page-1) if page >1 else 1,
			'next':(page+1) if page !=last else last,
			'last':last,
			'currentpage':page}
    firstSection = []
    second_sec1 = []
    second_sec2 = []
    thirdSection = []

    allBlogs = allBlogs[(page-1)*pagesize:(page*pagesize)]
    for idx,val in enumerate(allBlogs):
        if idx < 4 :
            firstSection.append({'pk': val['id'] ,'title' : val['title'] , 'shortUrl' : val['shortUrl'], 'ogimage' : val['ogimage'] })
        if idx >= 4 and idx < 7 :
            second_sec1.append({'pk': val['id'] ,'title' : val['title'] , 'shortUrl' : val['shortUrl'], 'ogimage' : val['ogimage']})
        if idx >= 7 and idx < 10 :
            second_sec2.append({'pk': val['id'] ,'title' : val['title'] , 'shortUrl' : val['shortUrl'], 'ogimage' : val['ogimage']})
        if idx >= 10 and idx < 14 :
            thirdSection.append({'pk': val['id'] ,'title' : val['title'] , 'shortUrl' : val['shortUrl'], 'ogimage' : val['ogimage']})
    return render(request,"blog.html" , {"home" : False,'pages':pages, "firstSection":firstSection , "second_sec1":second_sec1 , "second_sec2":second_sec2 , "thirdSection":thirdSection })

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


def desclaimer(request):
    return render(request,"desclaimer.html" , {"home" : False , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})


def registration(request):
    return render(request,"registration.html" , {"home" : False , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})


class RegistrationViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegistrationSerializer
    queryset = Registration.objects.all()
