# -*- coding: utf-8 -*-
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
# Create your views here.
from reportlab import *
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm, mm
from reportlab.lib import colors , utils
from reportlab.platypus import Paragraph, Table, TableStyle, Image, Frame, Spacer, PageBreak, BaseDocTemplate, PageTemplate, SimpleDocTemplate, Flowable
from PIL import Image
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet, TA_CENTER
from reportlab.graphics import barcode , renderPDF
from reportlab.graphics.shapes import *
from reportlab.graphics.barcode.qr import QrCodeWidget
from rest_framework.views import APIView
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
import datetime
import json
import pytz
import requests
from django.template.loader import render_to_string, get_template
from django.core.mail import send_mail, EmailMessage
from reportlab.lib.pagesizes import letter,A5,A4,A3
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import ParagraphStyle,getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.lib.colors import *
from reportlab.lib.units import inch, cm
import calendar
# import datetime
from forex_python.converter import CurrencyCodes
from HR.models import payroll
from django.contrib.auth.models import User
from finance.models import ExpenseSheet
from rest_framework.response import Response




class payslipViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = Payslip.objects.all()
    serializer_class = payslipSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['month','year','status']

class payrollReportViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = PayrollReport.objects.all()
    serializer_class = payrollReportSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['month','year','status']


#code for pdf
def payslip(response ,paySlip,userObj,report, request):
    # print '999999999999999999999999999999999999999',paySlip.hra,userObj.first_name+' '+userObj.last_name
    months = ["","January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    settingsFields = application.objects.get(name = 'app.clientRelationships').settings.all()
    now = datetime.datetime.now()
    monthdays=calendar.monthrange(now.year, now.month)[1]
    currencyType='INR'
    s=CurrencyCodes().get_symbol(currencyType) # currencysymbol
    if currencyType == 'INR':
        s='Rs.'
    absent=3
    daysPresent=monthdays-absent
    paidHolidays=1
    accountNumber=paySlip.accountNumber

    print userObj.designation.department,'aaaaaaaaaaaaaaaaaaaaaaaaa'

    (empCode,name,location,department,grade,designation,pfNo,escisNo,pan,sbs)=(str(paySlip.joiningDate.year)+str(userObj.pk) ,userObj.first_name+' '+userObj.last_name,'Bangalore',userObj.designation.department.dept_name,'E.1',userObj.designation.role.name,userObj.payroll.pfAccNo,userObj.payroll.esic,userObj.payroll.pan,paySlip.basic)
    (days,ml,al,cl,adHocLeaves,balanceSL,balanceCL,balanceCO)=(daysPresent+paidHolidays,paySlip.ml,paySlip.al,0,paySlip.adHocLeaves,0,0,0)
    # (basicSalary,hra,cn,cr,mr,oe)=(sbs,50000,40000,0,40000,0)
    (basic,hra,special,lta,adHoc,amount)=(paySlip.basic,paySlip.hra,paySlip.special,paySlip.lta,paySlip.adHoc,paySlip.amount)
    (spf,pdf,iol,od)=(10000,50000,0,0)
    totalEarnings,deductions=(0,0)
    # for i in (basicSalary,hra,cn,cr,oe):
    for i in (basic,hra,special,lta,adHoc,amount):
        totalEarnings+=i
    for i in (spf,pdf,iol,od):
        deductions+=i
    netpay=totalEarnings-deductions

    styles = getSampleStyleSheet()
    styledict={'center':ParagraphStyle(name='center', parent=styles['Normal'], alignment=TA_CENTER, fontSize=10)}
    doc = SimpleDocTemplate(response,pagesize=A3, topMargin=1*cm,)
    doc.request = request
    # container for the 'Flowable' objects
    elements = []

    a=[Paragraph("<para fontSize=25 alignment='Left' textColor=#6375d4><strong>CIOC</strong></para>",styles['Normal']),
       Paragraph(str(settingsFields.get(name = 'companyName').value )+'<br/><br/>',styledict['center']),
       Paragraph(str(settingsFields.get(name = 'companyAddress').value)+'<br/>',styledict['center']),
        Paragraph('<strong>www.cioc.co.in </strong><br/>' ,styledict['center']),

       Paragraph("<para fontSize=8 alignment='center'><strong>Employee PaySlip For Month Of {0} {1} </strong></para>".format(months[report.month],report.year),styles['Normal'])
       ]
    p1=Paragraph("<para fontSize=8><strong>Bank Details : </strong>Salary Has Been Credited To "+str(userObj.payroll.accountNumber)+' '+str(userObj.payroll.bankName),styles['Normal'])

    data=[[a,'','',''],['','','',''],['Emp Code : %s'%(empCode),'Name : %s'%(name),'',''],['Location : %s'%(location),'Department :%s'%(department),'Grade : %s'%(grade),'Designation : %s'%(designation)],
          ['PF No : %s'%(pfNo),'ESIC No : %s'%(escisNo),'PAN : %s'%(pan),'Standard Basic Salary : %s %d'%(s,sbs)],['Days Paid : %d'%(days),'Days Present : %d'%(daysPresent),'Paid Holidays : %d'%(paidHolidays),'Lwp/Absent : %d'%(absent)],
          ['Sick Leaves : %d'%(ml),'Annual Leaves : %d'%(al),'Compensatory Leaves : %d'%(cl),'AdHoc Leaves : %d'%(adHocLeaves)],['Balance SL : %d'%(balanceSL),'Balance CL : %d'%(balanceCL),'Balance CO : %d'%(balanceCO),''],['Earnings','Amount','Deductions','Amount'],
          ['Basic Salary' ,s+' '+str(basic),'Saturatory Provident Fund',s+' '+str(spf)],['HRA',s+' '+str(hra),'Professional Tax Deduction',s+' '+str(pdf)],['Conveyance',s+' '+str(special),'Interest On Loan',s+' '+str(iol)],['Conveyance Reimbursement',s+' '+str(lta),'Other Deduction ',s+' '+str(od)],['Medical Reimbursement',s+' '+str(adHoc),'',''],['Other Earnings',s+' '+str(amount),'',''],
          ['Total Earnings ',s+' '+str(totalEarnings),'Total Deduction',s+' '+str(deductions)],['','','','Net Pay : %s %d'%(s,netpay)],[p1,'','',''],]

    lines=[('LINEBELOW',(0,1),(-1,1),0.5,black),('LINEBELOW',(0,4),(-1,4),0.5,black),('LINEBELOW',(0,7),(-1,7),0.5,black),('LINEBELOW',(0,8),(-1,8),0.5,black),
           ('LINEBELOW',(0,14),(-1,14),0.5,black),('LINEBELOW',(0,15),(-1,15),0.5,black),('LINEBELOW',(0,16),(-1,16),0.5,black),('LINEBEFORE',(2,8),(2,16),0.5,black)]
    spans=[('SPAN',(0,0),(-1,1)),('SPAN',(1,2),(-1,2)),('SPAN',(0,-1),(-1,-1))]
    aligns=[('ALIGN',(1,8),(1,15),'RIGHT'),('ALIGN',(-1,8),(-1,16),'RIGHT')]
    rheights=18*[0.3*inch]
    rheights[1]=0.5*inch
    t1=Table(data,rowHeights=rheights)
    t1.setStyle(TableStyle([('BOX', (0,0), (-1,-1), 0.75, black),]+lines+spans+aligns))
    elements.append(t1)
    doc.build(elements)


class GetPayslip(APIView):
    def get(self , request , format = None):
        print 'enterrrrrrrrrrrrrrrrrr'
        print request.GET['payslip'],request.GET
        payrol = payroll.objects.get(user = request.GET['payslip'])
        user = User.objects.get(id = request.GET['payslip'])
        report = PayrollReport.objects.get(id = request.GET['report'])
        # payslip(7,request)
        # print 'ttttttttttttt'
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment;filename="payslipdownload.pdf"'
        payslip(response , payrol , user ,report, request)
        return response

#code for excelSheet

from excel_response import ExcelResponse

class PayslipsReport(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    def get(self , request , format = None):
        objs = Payslip.objects.filter(report_id = request.GET['report'])

        toReturn = []

        for o in objs:
            toReturn.append({"Employee Name" : o.user.first_name + ' ' + o.user.last_name , "payslipID" : o.pk , "totalPayable" : o.totalPayable,"tds" : o.tds , "accountNumber" : o.user.payroll.accountNumber ,"bankName" : o.user.payroll.bankName , "ifscCode" : o.user.payroll.ifscCode, "pan" : o.user.payroll.pan , "PFUan" : o.user.payroll.PFUan})




        return ExcelResponse(toReturn)

class GetReimbursement(APIView):
    renderer_classes = (JSONRenderer,)
    # serializer_class = ExpenseSheetSerializer(data=request.data)

    def get(self , request , format = None):
        # expenseObj=ExpenseSheet.objects.all(user_id=request.GET['user'] , approved = 'Yes')

        expenseObj=ExpenseSheet.objects.filter(user_id=request.GET['user'] , approved = 'Yes')
        amt = 0
        for i in expenseObj:
            for j in i.invoices.all():
                if j.approved:
                    amt += j.amount
        tosend = {'amount':amt}
        return JsonResponse(tosend,status = status.HTTP_200_OK)
