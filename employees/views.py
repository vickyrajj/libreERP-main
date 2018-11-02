# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from rest_framework import viewsets , permissions  #serializers
from django.shortcuts import render, redirect , get_object_or_404
from url_filter.integrations.drf import DjangoFilterBackend
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from rest_framework.views import APIView
from django.contrib.auth.models import User , Group
from rest_framework.exceptions import *
# from .serializers import *
from API.permissions import *
from .models import *
import json
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from django.contrib.auth import authenticate , login , logout


class AttendanceViewSet(viewsets.ModelViewSet):
#     # serializer_class = CalendarSerializer
#     # filter_backends = [DjangoFilterBackend]
#     # filter_fields = ['title']
    def get_queryset(self):
        return
#Calendar.objects.all()






##----------Attendance api---
import sys
import time
from zklib import zklib
from datetime import *
from zklib import zkconst
from operator import itemgetter
from performance.models import TimeSheet
import calendar
from dateutil.relativedelta import *
from django.db.models import Q
from HR.models import Leave


class FeatchAttendanceDataApi(APIView):
    renderer_classes = (JSONRenderer,)
    def get(self , request , format = None):
        print 'requestttttttttttt',request.GET
        monthNumber = int(str(request.GET['date']).split('-')[1])
        yearNumber = int(str(request.GET['date']).split('-')[0])
        lastDay = calendar.monthrange(yearNumber,monthNumber)[1]
        fstDay = date(yearNumber,monthNumber,1)
        userObj = User.objects.get(pk=int(request.GET['user']))

        print userObj
        # print usrObj
        toReturn = {'valList':[],'timeList':[],'leavetype':[]}
        for i in range(1,lastDay+1):
            dt = fstDay+relativedelta(days=i-1)

            try:
                timeObj = TimeSheet.objects.get(Q(checkIn__icontains=dt) | Q(checkOut__icontains=dt),user=userObj)





                if timeObj.checkIn and timeObj.checkOut:
                    hrs = timeObj.checkOut - timeObj.checkIn
                    # print str(hrs)[0:-3],'777777777777'
                    toReturn['timeList'].append(str(hrs)[0:-3])
                    hrs = round(hrs.total_seconds()/3600,2)
                    # print hrs
                    toReturn['valList'].append(hrs)

                elif timeObj.checkIn or timeObj.checkOut:
                    # print 'only one timeeeeeeeeeeee'
                    toReturn['valList'].append(0)
                    toReturn['timeList'].append(str(0))

                else:
                    # print 'nothinggggg'
                    toReturn['valList'].append(-1)
                    toReturn['timeList'].append(str(' '))

            except:
                leavObj = Leave.objects.filter(user=userObj,fromDate__lte=dt,toDate__gte=dt)
                # print leavObj,dt
                if leavObj.count()>0:
                    # print leavObj[0].approved
                    if leavObj[0].approved:
                        # print leavObj[0].category
                        # print 'took leaveeee'
                        toReturn['valList'].append(-2)
                        toReturn['timeList'].append(str(' '))
                        toReturn['leavetype'].append(str(leavObj[0].category))
                    else:
                        # print 'asked leave but not approved'
                        toReturn['valList'].append(-1)
                        toReturn['timeList'].append(str(' '))
                else:
                    # print 'absent or holiday'
                    toReturn['valList'].append(-1)
                    toReturn['timeList'].append(str(' '))


        # zk = zklib.ZKLib("192.168.0.201", 4370)
        # ret = zk.connect()
        # attendance = zk.getAttendance()
        # for a in attendance:
        #     u = User.objects.get(pk = a[0])
        #     print a , a[2].date()
        #
        #     ts = TimeSheet.objects.filter(user = u , date = a[2].date())
        #
        #     if ts.count()==0:
        #         timesheet= TimeSheet(user = u , date = a[2].date())
        #         timesheet.save()
        #     else:
        #         timesheet= ts[0]
        #
        #     if timesheet.checkIn is None or int(a[2].strftime("%s"))*1000 < int(timesheet.checkIn.strftime("%s"))*1000 :
        #         timesheet.checkIn = a[2]
        #     if timesheet.checkOut is None or int(a[2].strftime("%s"))*1000   > int(timesheet.checkOut.strftime("%s"))*1000:
        #         timesheet.checkOut= a[2]
        #
        #     timesheet.save()

            # get the TimeSheet object for the date a[2]
            # already exists else create
        print toReturn
        return Response(toReturn,status=status.HTTP_200_OK)

##------------------------------- leave  approval -------------
