
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
from django.utils.encoding import smart_str
# Related to the REST Framework
from rest_framework import viewsets , permissions , serializers
from rest_framework.exceptions import *
from url_filter.integrations.drf import DjangoFilterBackend
from .models import *
from .serializers import *
from API.permissions import *
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
from django.http import HttpResponse
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
from reportlab.lib.pagesizes import letter,A5,A4,A3
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import ParagraphStyle,getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.lib.colors import *
from reportlab.lib.units import inch, cm
from django.template.loader import render_to_string, get_template
from django.core.mail import send_mail, EmailMessage

class ProductsViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny , )
    queryset = Products.objects.all()
    serializer_class = ProductsSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['part_no','parent','created']



class ProductSheetViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny , )
    queryset = ProductSheet.objects.all()
    serializer_class = ProductSheetSerializer



class ProjectsViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny , )
    queryset = Projects.objects.all()
    serializer_class = ProjectsSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['status','title']

class BoMViewSet(viewsets.ModelViewSet):
    permissions_classes  = (permissions.AllowAny , )
    queryset = BoM.objects.all()
    serializer_class = BoMSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['products','project']

class ProductsUploadAPIView(APIView):
    permission_classes = (permissions.IsAuthenticated ,)

    def post(self , request , format = None):

        excelFile = request.FILES['excelFile']

        print 'llllllllllll'
        wb = load_workbook(filename = BytesIO(excelFile.read()) ,  read_only=True)


        for ws in wb.worksheets:
            wsTitle = ws.title
            sheetObj = ProductSheet(file_name = excelFile.name,sheet=wsTitle)
            sheetObj.save()

            for i in range(3,ws.max_row+1):
                try:
                    try:
                        part_no = ws['B' + str(i)].value
                    except:
                        part_no = None



                    print part_no,'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv'

                    try:
                        description_1 = ws['C' + str(i)].value
                    except:
                        description_1 = None


                    try:
                        description_2 = ws['D' + str(i)].value
                    except:
                        description_2 = None


                    try:
                        weight = ws['E' + str(i)].value
                        print weight,'vvvvvvvvvvvvvvvvvvv'
                    except:
                        weight = None


                    try:
                        price = ws['F' + str(i)].value
                    except:
                        price = None


                    try:
                        parent_no = ws['G' + str(i)].value
                        parent = None
                        if parent_no:
                            par = Products.objects.get(part_no=parent_no)
                            print par ,'rrrrrrrrrrrrrr'
                            parent = par
                    except:
                        parent = None


                    try:
                        customs_no = ws['H' + str(i)].value

                    except:
                        customs_no = None

                    print parent
                    Products.objects.get_or_create(part_no=part_no, description_1=description_1,description_2=description_2,weight=weight,parent=parent, price=price,customs_no=customs_no)
                except:
                    pass
        return Response(status=status.HTTP_200_OK)
from reportlab.lib.styles import getSampleStyleSheet

def purchaseOrder(response , project , purchaselist , request):

    styles = getSampleStyleSheet()
    doc = SimpleDocTemplate(response,pagesize=letter, topMargin=0.2*cm,leftMargin=0.1*cm,rightMargin=0.1*cm)
    doc.request = request
    elements = []

    p1 = Paragraph("<para alignment='center'fontSize=15  ><b> PURCHASE ORDER </b></para>",styles['Normal'])

    elements.append(p1)

    p2 = Paragraph("<para fontSize=10 ><b> BRUDERER AG </b></para>",styles['Normal'])
    p3 = Paragraph("<para fontSize=8  >Egnacherstrasse 44,</para>",styles['Normal'])
    p4 =  Paragraph("<para fontSize=8 >CH-9320</para>",styles['Normal'])
    p5 = Paragraph("<para fontSize=8 >Frasnacht</para>",styles['Normal'])
    p6 = Paragraph("<para fontSize=8 >Switzerland</para>",styles['Normal'])

    elements.append(Spacer(1, 10))
    elements.append(p2)
    elements.append(p3)
    elements.append(p4)
    elements.append(p5)
    elements.append(p6)
    elements.append(Spacer(1,10))

    p7_01 =Paragraph("<para fontSize=8>Purchase order ref</para>",styles['Normal'])
    p7_02 =Paragraph("<para fontSize=8>{0}</para>".format(project.pk),styles['Normal'])
    p7_03 =Paragraph("<para fontSize=8>Your Quotation ref</para>",styles['Normal'])
    p7_04 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])

    p8_01 =Paragraph("<para fontSize=8>Purchase order date</para>",styles['Normal'])
    p8_02 =Paragraph("<para fontSize=8>{0}</para>".format(project.date),styles['Normal'])
    p8_03 =Paragraph("<para fontSize=8>Your Quotation Date</para>",styles['Normal'])
    p8_04 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])

    p9_01 =Paragraph("<para fontSize=8>Machine Model</para>",styles['Normal'])
    p9_02 =Paragraph("<para fontSize=8>{0}</para>".format(project.machinemodel),styles['Normal'])
    p9_03 =Paragraph("<para fontSize=8>Our GST No.</para>",styles['Normal'])
    p9_04 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])

    p10_01 =Paragraph("<para fontSize=8>Comm Nr</para>",styles['Normal'])
    p10_02 =Paragraph("<para fontSize=8>{0}</para>".format(project.comm_nr),styles['Normal'])
    p10_03 =Paragraph("<para fontSize=8></para>",styles['Normal'])
    p10_04 =Paragraph("<para fontSize=8></para>",styles['Normal'])

    p11_01 =Paragraph("<para fontSize=8>Customer ref</para>",styles['Normal'])
    p11_02 =Paragraph("<para fontSize=8>{0}</para>".format(project.customer_ref),styles['Normal'])
    p11_03 =Paragraph("<para fontSize=8></para>",styles['Normal'])
    p11_04 =Paragraph("<para fontSize=8></para>",styles['Normal'])


    data1=[[p7_01,p7_02,p7_03,p7_04],[p8_01,p8_02,p8_03,p8_04],[p9_01,p9_02,p9_03,p9_04],[p10_01,p10_02,p10_03,p10_04],[p11_01,p11_02,p11_03,p11_04]]
    rheights=0.2*inch,0.2*inch,0.4*inch,0.2*inch,0.2*inch #[1.1*inch,1.1*inch]
    cwidths=2*inch,2.4*inch,2*inch,2*inch
    t1=Table(data1,rowHeights=rheights,colWidths=cwidths)

    elements.append(t1)
    elements.append(Spacer(1,10))
    elements.append(Paragraph("<para fontSize=8>Dear Sir,</para>",styles['Normal']))
    elements.append(Spacer(1,10))
    elements.append(Paragraph("<para fontSize=8>We are pleased to order the following items:</para>",styles['Normal']))

    # tableStyle = styles['Normal'].clone['tableBodyStyle']
    # tableStyle.fontSize = 8
    p101_01 =Paragraph("<para fontSize=8>Sl. no</para>",styles['Normal'])
    p101_02 =Paragraph("<para fontSize=8>Part Number</para>",styles['Normal'])
    p101_03 =Paragraph("<para fontSize=8>Part Desc</para>",styles['Normal'])
    p101_04 =Paragraph("<para fontSize=8>Qty</para>",styles['Normal'])
    p101_05 =Paragraph("<para fontSize=8>Unit price</para>",styles['Normal'])
    p101_06 =Paragraph("<para fontSize=8>Total Amount</para>",styles['Normal'])

    data5=[[p101_01,p101_02,p101_03,p101_04,p101_05,p101_06]]
    t5=Table(data5,6*[1.4*inch],1*[0.2*inch])
    t5.setStyle(TableStyle([('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),black),('ALIGN',(0,0),(-1,-1),'LEFT'),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))
    grandTotal = 0
    data2 = []
    id=0
    for i in purchaselist:
        # if project.status == 'created':
        id+=1
        part_no = i.products.part_no
        desc = i.products.description_1
        price = i.products.price
        qty = i.quantity1
        amnt = price * qty
        grandTotal +=amnt
        # else:
        #     id+=1
        #     part_no = i.products.part_no
        #     desc = i.products.description_1
        #     price = i.price
        #     qty = i.quantity2
        #     amnt = price * qty
        #     grandTotal +=amnt

        p12_01 = Paragraph("<para fontSize=8>{0}</para>".format(id),styles['Normal'])
        p12_02 =Paragraph("<para fontSize=8>{0}</para>".format(part_no),styles['Normal'])
        p12_03 =Paragraph("<para fontSize=8>{0}</para>".format(smart_str(desc)),styles['Normal'])
        p12_04 =Paragraph("<para fontSize=8>{0}</para>".format(qty),styles['Normal'])
        p12_05 =Paragraph("<para fontSize=8>{0}</para>".format(price),styles['Normal'])
        p12_06 =Paragraph("<para fontSize=8>{0}</para>".format(amnt),styles['Normal'])
        data2.append([p12_01,p12_02,p12_03,p12_04,p12_05,p12_06])



    #
    # p13_01 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
    # p13_02 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
    # p13_03 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
    # p13_04 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
    # p13_05 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
    # p13_06 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
    #
    # p14_01 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
    # p14_02 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
    # p14_03 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
    # p14_04 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
    # p14_05 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
    # p14_06 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
    #
    # p15_01 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
    # p15_02 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
    # p15_03 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
    # p15_04 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
    # p15_05 =Paragraph("<para fontSize=8>Total</para>",styles['Normal'])
    # p15_06 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
    #
    # print purchaselist ,'hhhhhhhhh'
    t2=Table(data2,6*[1.4*inch],id*[0.4*inch])
    t2.setStyle(TableStyle([('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),black),('ALIGN',(0,0),(-1,-1),'LEFT'),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))

    p13_01 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
    p13_02 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
    p13_03 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
    p13_04 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
    p13_05 =Paragraph("<para fontSize=8>Total</para>",styles['Normal'])
    p13_06 =Paragraph(str(grandTotal),styles['Normal'])

    data3=[[p13_01,p13_02,p13_03,p13_04,p13_05,p13_06]]
    t3=Table(data3,6*[1.4*inch],1*[0.2*inch])
    t3.setStyle(TableStyle([('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),black),('ALIGN',(0,0),(-1,-1),'LEFT'),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))
    elements.append(t5)
    elements.append(t2)
    elements.append(t3)
    # elements.append(t3)
    elements.append(Spacer(1,8))
    elements.append(Paragraph("<para fontSize=8>Notes:</para>",styles['Normal']))
    elements.append(Spacer(1,8))
    elements.append(Paragraph("<para fontSize=8>Yours faithfully</para>",styles['Normal']))

    doc.build(elements)



def quotation(response , project , purchaselist , request):

    styles = getSampleStyleSheet()
    doc = SimpleDocTemplate(response,pagesize=letter, topMargin=0.2*cm,leftMargin=0.1*cm,rightMargin=0.1*cm)
    doc.request = request
    elements = []

    p1 = Paragraph("<para alignment='center'fontSize=15  ><b> QUOTATION </b></para>",styles['Normal'])

    elements.append(p1)

    p2 = Paragraph("<para fontSize=10 ><b> MOLEX India Pvt Ltd., </b></para>",styles['Normal'])
    p3 = Paragraph("<para fontSize=8  >Sadaramangala Industrial Area</para>",styles['Normal'])
    p4 =  Paragraph("<para fontSize=8 >CH-9320</para>",styles['Normal'])
    p5 = Paragraph("<para fontSize=8 >Whitefield</para>",styles['Normal'])
    p6 = Paragraph("<para fontSize=8 >Bangalore</para>",styles['Normal'])

    elements.append(Spacer(1, 10))
    elements.append(p2)
    elements.append(p3)
    elements.append(p4)
    elements.append(p5)
    elements.append(p6)
    elements.append(Spacer(1,10))

    p7_01 =Paragraph("<para fontSize=8>Quotation</para>",styles['Normal'])
    p7_02 =Paragraph("<para fontSize=8>{0}</para>".format(project.pk),styles['Normal'])
    p7_03 =Paragraph("<para fontSize=8>Your Enquiry Ref</para>",styles['Normal'])
    p7_04 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])

    p8_01 =Paragraph("<para fontSize=8>Quotation date</para>",styles['Normal'])
    p8_02 =Paragraph("<para fontSize=8>{0}</para>".format(project.date),styles['Normal'])
    p8_03 =Paragraph("<para fontSize=8>Your Enquiry Date</para>",styles['Normal'])
    p8_04 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])

    p9_11 =Paragraph("<para fontSize=8>Revision</para>",styles['Normal'])
    p9_12 =Paragraph("<para fontSize=8>{0}</para>".format(project.revision),styles['Normal'])
    p9_13 =Paragraph("<para fontSize=8></para>",styles['Normal'])
    p9_14 =Paragraph("<para fontSize=8></para>",styles['Normal'])

    p9_01 =Paragraph("<para fontSize=8>Machine Model</para>",styles['Normal'])
    p9_02 =Paragraph("<para fontSize=8>{0}</para>".format(project.machinemodel),styles['Normal'])
    p9_03 =Paragraph("<para fontSize=8>Our GST No.</para>",styles['Normal'])
    p9_04 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])

    p10_01 =Paragraph("<para fontSize=8>Comm Nr</para>",styles['Normal'])
    p10_02 =Paragraph("<para fontSize=8>{0}</para>".format(project.comm_nr),styles['Normal'])
    p10_03 =Paragraph("<para fontSize=8></para>",styles['Normal'])
    p10_04 =Paragraph("<para fontSize=8></para>",styles['Normal'])

    # p11_01 =Paragraph("<para fontSize=8>Customer ref</para>",styles['Normal'])
    # p11_02 =Paragraph("<para fontSize=8>{0}</para>".format(project.customer_ref),styles['Normal'])
    # p11_03 =Paragraph("<para fontSize=8></para>",styles['Normal'])
    # p11_04 =Paragraph("<para fontSize=8></para>",styles['Normal'])


    data1=[[p7_01,p7_02,p7_03,p7_04],[p8_01,p8_02,p8_03,p8_04],[p9_11,p9_12,p9_13,p9_14],[p9_01,p9_02,p9_03,p9_04],[p10_01,p10_02,p10_03,p10_04]]
    rheights=0.2*inch,0.2*inch,0.2*inch,0.4*inch,0.2*inch#[1.1*inch,1.1*inch]
    cwidths=2*inch,2.4*inch,2*inch,2*inch
    t1=Table(data1,rowHeights=rheights,colWidths=cwidths)

    elements.append(t1)
    elements.append(Spacer(1,10))
    elements.append(Paragraph("<para fontSize=8>Dear Sir,</para>",styles['Normal']))
    elements.append(Spacer(1,10))
    elements.append(Paragraph("<para fontSize=8>We are pleased to order the following items:</para>",styles['Normal']))

    # tableStyle = styles['Normal'].clone['tableBodyStyle']
    # tableStyle.fontSize = 8
    p101_01 =Paragraph("<para fontSize=8>Sl. no</para>",styles['Normal'])
    p101_02 =Paragraph("<para fontSize=8>Part Number</para>",styles['Normal'])
    p101_03 =Paragraph("<para fontSize=8>Part Desc</para>",styles['Normal'])
    p101_04 =Paragraph("<para fontSize=8>Qty</para>",styles['Normal'])
    p101_05 =Paragraph("<para fontSize=8>Unit price</para>",styles['Normal'])
    p101_06 =Paragraph("<para fontSize=8>Total Amount</para>",styles['Normal'])

    data5=[[p101_01,p101_02,p101_03,p101_04,p101_05,p101_06]]
    t5=Table(data5,6*[1.4*inch],1*[0.2*inch])
    t5.setStyle(TableStyle([('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),black),('ALIGN',(0,0),(-1,-1),'LEFT'),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))
    grandTotal = 0
    data2 = []
    id=0
    for i in purchaselist:

        id+=1
        part_no = i.products.part_no
        desc = i.products.description_1
        price = i.customer_price
        qty = i.quantity1
        amnt = price * qty
        grandTotal +=amnt

        p12_01 = Paragraph("<para fontSize=8>{0}</para>".format(id),styles['Normal'])
        p12_02 =Paragraph("<para fontSize=8>{0}</para>".format(part_no),styles['Normal'])
        p12_03 =Paragraph("<para fontSize=8>{0}</para>".format(smart_str(desc)),styles['Normal'])
        p12_04 =Paragraph("<para fontSize=8>{0}</para>".format(qty),styles['Normal'])
        p12_05 =Paragraph("<para fontSize=8>{0}</para>".format(price),styles['Normal'])
        p12_06 =Paragraph("<para fontSize=8>{0}</para>".format(amnt),styles['Normal'])
        data2.append([p12_01,p12_02,p12_03,p12_04,p12_05,p12_06])




    t2=Table(data2,6*[1.4*inch],id*[0.4*inch])
    t2.setStyle(TableStyle([('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),black),('ALIGN',(0,0),(-1,-1),'LEFT'),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))

    p13_01 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
    p13_02 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
    p13_03 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
    p13_04 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
    p13_05 =Paragraph("<para fontSize=8>Total</para>",styles['Normal'])
    p13_06 =Paragraph(str(grandTotal),styles['Normal'])

    data3=[[p13_01,p13_02,p13_03,p13_04,p13_05,p13_06]]
    t3=Table(data3,6*[1.4*inch],1*[0.2*inch])
    t3.setStyle(TableStyle([('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),black),('ALIGN',(0,0),(-1,-1),'LEFT'),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))
    elements.append(t5)
    elements.append(t2)
    elements.append(t3)
    # elements.append(t3)
    elements.append(Spacer(1,8))
    elements.append(Paragraph("<para fontSize=8>Notes:</para>",styles['Normal']))
    elements.append(Paragraph("<para fontSize=8><b> Prices:</b></para>",styles['Normal']))
    elements.append(Paragraph("<para fontSize=8>The price is exclusive of packing, freight, Insurance and GST.</para>",styles['Normal']))
    elements.append(Spacer(1,8))
    elements.append(Paragraph("<para fontSize=8><b>Validity:</b></para>",styles['Normal']))
    elements.append(Paragraph("<para fontSize=8>One Month</para>",styles['Normal']))

    doc.build(elements)

def grn(response , project , purchaselist , request):

    styles = getSampleStyleSheet()
    doc = SimpleDocTemplate(response,pagesize=letter, topMargin=0.2*cm,leftMargin=0.1*cm,rightMargin=0.1*cm)
    doc.request = request
    elements = []

    p1 = Paragraph("<para alignment='center'fontSize=15  ><b> Goods Received Note </b></para>",styles['Normal'])
    elements.append(p1)

    p2 = Paragraph("<para fontSize=10 ><b> MOLEX India Pvt Ltd., </b></para>",styles['Normal'])
    p3 = Paragraph("<para fontSize=8  >Sadaramangala Industrial Area</para>",styles['Normal'])
    p4 =  Paragraph("<para fontSize=8 >CH-9320</para>",styles['Normal'])
    p5 = Paragraph("<para fontSize=8 >Whitefield</para>",styles['Normal'])
    p6 = Paragraph("<para fontSize=8 >Bangalore</para>",styles['Normal'])

    elements.append(Spacer(1, 10))
    elements.append(p2)
    elements.append(p3)
    elements.append(p4)
    elements.append(p5)
    elements.append(p6)
    elements.append(Spacer(1,10))

    p7_01 =Paragraph("<para fontSize=8>Name</para>",styles['Normal'])
    p7_02 =Paragraph("<para fontSize=8>{0}</para>".format(project.title),styles['Normal'])
    p7_03 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
    p7_04 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])

    p8_01 =Paragraph("<para fontSize=8>Date</para>",styles['Normal'])
    p8_02 =Paragraph("<para fontSize=8>{0}</para>".format(project.approved2_date),styles['Normal'])
    p8_03 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
    p8_04 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])

    data1=[[p7_01,p7_02,p7_03,p7_04],[p8_01,p8_02,p8_03,p8_04]]
    t1=Table(data1,4*[2.1*inch],2*[0.2*inch])
    # t1.setStyle(TableStyle([('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),black),('ALIGN',(0,0),(-1,-1),'LEFT'),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))

    elements.append(t1)
    elements.append(Spacer(1,10))
    p9_01 =Paragraph("<para fontSize=8>Sl. no</para>",styles['Normal'])
    p9_02 =Paragraph("<para fontSize=8>Part Number</para>",styles['Normal'])
    p9_03 =Paragraph("<para fontSize=8>Quantity</para>",styles['Normal'])
    data2=[[p9_01,p9_02,p9_03]]
    t2=Table(data2,3*[2.8*inch],1*[0.2*inch])
    t2.setStyle(TableStyle([('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),black),('ALIGN',(0,0),(-1,-1),'LEFT'),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))
    data3 = []
    id=0
    for i in purchaselist:
        id+=1
        part_no = i.products.part_no
        quanty = i.quantity2
        p10_01 =Paragraph("<para fontSize=8>{0}</para>".format(id),styles['Normal'])
        p10_02 =Paragraph("<para fontSize=8>{0}</para>".format(part_no),styles['Normal'])
        p10_03 =Paragraph("<para fontSize=8>{0}</para>".format(quanty),styles['Normal'])
        data3.append([p10_01,p10_02,p10_03])

    t3=Table(data3,3*[2.8*inch],id*[0.2*inch])
    t3.setStyle(TableStyle([('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),black),('ALIGN',(0,0),(-1,-1),'LEFT'),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))
    elements.append(t2)
    elements.append(t3)

    doc.build(elements)



class GetPurchaseAPIView(APIView):
    def get(self , request , format = None):
        project = Projects.objects.get(pk = request.GET['project'])
        purchaselist = BoM.objects.filter(project = request.GET['project'])
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment;filename="PurchaseOrderdownload.pdf"'
        purchaseOrder(response , project , purchaselist , request)
        return response

class GrnAPIView(APIView):
    def get(self , request , format = None):
        project = Projects.objects.get(pk = request.GET['project'])
        purchaselist = BoM.objects.filter(project = request.GET['project'])
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment;filename="Grndownload.pdf"'
        grn(response , project , purchaselist , request)
        return response

class QuotationAPIView(APIView):
    def get(self , request , format = None):
        project = Projects.objects.get(pk = request.GET['project'])
        purchaselist = BoM.objects.filter(project = request.GET['project'])
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment;filename="Quotationdownload.pdf"'
        quotation(response , project , purchaselist , request)
        return response
from reportlab.platypus.flowables import HRFlowable

def materialIssued(response , value , request):

    invdata = MaterialIssueMain.objects.get(pk = request.GET['value'])
    styles = getSampleStyleSheet()
    doc = SimpleDocTemplate(response,pagesize=letter, topMargin=0.2*cm,leftMargin=0.1*cm,rightMargin=0.1*cm)
    doc.request = request
    elements = []

    p1 = Paragraph("<para alignment='center' fontSize=15  ><b> MATERIAL ISSUE NOTE </b></para>",styles['Normal'])

    elements.append(p1)
    elements.append(Spacer(1,15))
    cuss_no = invdata.project.comm_nr
    customer = invdata.user.first_name
    dated = invdata.created.date()
    p1_01 =Paragraph("<para fontSize=10>Comm nr</para>",styles['Normal'])
    p1_02 =Paragraph(str(cuss_no),styles['Normal'])

    p2_01 =Paragraph("<para fontSize=10>Customer</para>",styles['Normal'])
    p2_02 =Paragraph(str(customer),styles['Normal'])

    p3_01 =Paragraph("<para fontSize=10>Date of issue</para>",styles['Normal'])
    p3_02 =Paragraph(str(dated),styles['Normal'])



    data1=[[p1_01,p1_02],[p2_01,p2_02],[p3_01,p3_02]]
    rheights=3*[0.2*inch] #[1.1*inch,1.1*inch]
    cwidths=2*inch,6.5*inch
    t1=Table(data1,rowHeights=rheights,colWidths=cwidths)

    elements.append(t1)
    elements.append(Spacer(1,40))


    p4_01 =Paragraph("<para fontSize=6 align=center><b>Part number<br/>(A)</b></para>",styles['Normal'])
    p4_02 =Paragraph("<para fontSize=6 align=center><b>Part description <br/>(B)</b></para>",styles['Normal'])
    p4_03 =Paragraph("<para fontSize=6 align=center><b>Qty<br/>(AC) </b></para>",styles['Normal'])
    p4_04 =Paragraph("<para fontSize=6 align=center><b>Stock value / unit<br/>(Z) </b></para>",styles['Normal'])
    p4_05 =Paragraph("<para fontSize=6 align=center><b>Stock value consumed for the comm nr<br/>(AD = ACxZ)</b></para>",styles['Normal'])
    data2= [[p4_01,p4_02,p4_03,p4_04,p4_05]]

    grandtotal = 0
    for i in list(invdata.materialIssue.values()):

        product = Products.objects.get(pk = i['product_id'])
        partno = product.part_no
        description = product.description_1
        qty = i['qty']
        qdata = str(qty)
        price = i['price']
        pdata = str(price)
        total = qty*price
        tdata = str(total)
        grandtotal+=total
        print str(total),'aaaaaaaaaaaaa'
        gtotal = str(grandtotal)
        # p5_01 =Paragraph(partno,styles['Normal'])
        # p5_02 =Paragraph(str(description),styles['Normal'])
        # p5_03 =Paragraph(str(qty),styles['Normal'])
        # p5_04 =Paragraph("<para fontSize=8 ></para>",styles['Normal'])
        # p5_05 =Paragraph("<para fontSize=8 ></para>",styles['Normal'])

        p6_01 =Paragraph(partno,styles['Normal'])
        p6_02 =Paragraph(description,styles['Normal'])
        p6_03 =Paragraph(qdata,styles['Normal'])
        p6_04 =Paragraph(pdata,styles['Normal'])
        p6_05 =Paragraph(tdata,styles['Normal'])
        data2+=[[p6_01,p6_02,p6_03,p6_04,p6_05]]

    p7_01 =Paragraph("<para fontSize=8 ></para>",styles['Normal'])
    p7_02 =Paragraph("<para fontSize=8 ></para>",styles['Normal'])
    p7_03 =Paragraph("<para fontSize=8 ></para>",styles['Normal'])
    p7_04 =Paragraph("<para fontSize=8 >Total</para>",styles['Normal'])
    p7_05 =Paragraph(gtotal,styles['Normal'])
    data2+=[[p7_01,p7_02,p7_03,p7_04,p7_05]]

    rheight=0.4*inch #[1.1*inch,1.1*inch]
    cwidth=1.6*inch,1.6*inch,1.6*inch,1.6*inch,1.8*inch
    t2=Table(data2,rowHeights=rheight,colWidths=cwidth)
    t2.setStyle(TableStyle([('ALIGN',(0,0),(-1,-1),'CENTER'),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))

    elements.append(t2)


    # ('TEXTFONT', (0, 0), (-1, -1),'Times-Bold'),


    # elements.append(Spacer(1, 50))
    #
    # elements.append(HRFlowable(width="100%", thickness=1, color=darkblue))
    #
    # elements.append(Spacer(1, 12))



    doc.build(elements)






# def invoice(response , projects , request):
#     styles = getSampleStyleSheet()
#     doc = SimpleDocTemplate(response,pagesize=letter, topMargin=0.2*cm,leftMargin=0.1*cm,rightMargin=0.1*cm)
#     doc.request = request
#     elements = []
#
#     elements.append(Paragraph("<para alignment='center'fontSize=12  ><b> BRUDERER PRESSES INDIA PVT.LTD.</b></para>",styles['Normal']))
#     elements.append(Spacer(1,8))
#     elements.append(Paragraph("<para alignment='center'fontSize=8  >No. 17p, Sadaramangala Industrial Area, Whitefield Road,</para>",styles['Normal']))
#     elements.append(Paragraph("<para alignment='center'fontSize=8 >Kadugodi, BANGALORE-560048, KARNATAKA</para>",styles['Normal']))
#     elements.append(Paragraph("<para alignment='center'fontSize=8  >Phone : 080-28411049</para>",styles['Normal']))
#     elements.append(Paragraph("<para alignment='center'fontSize=8  ><b>GSTIN NO.29QWDSCB56E</b></para>",styles['Normal']))
#
#     elements.append(Spacer(1,12))
#     elements.append(HRFlowable(width="100%", thickness=1, color=black))
#     elements.append(Spacer(1,4))
#     elements.append(HRFlowable(width="100%", thickness=1, color=black))
#     elements.append(Spacer(1,3))
#
#     elements.append(Paragraph("<para alignment='center'fontSize=15  ><b> TAX INVOICE</b></para>",styles['Normal']))
#     elements.append(Spacer(1,12))
#
#
#     p1 = Paragraph("<para fontSize=6><b>Invoice No:</b></para>",styles['Normal'])
#     p01 = Paragraph("<para fontSize=6><b>BP/09/HG</b></para>",styles['Normal'])
#
#     p2 = Paragraph("<para fontSize=6><b>Invoice date:</b></para>",styles['Normal'])
#     p02 = Paragraph("<para fontSize=6><b>14.07.4018</b></para>",styles['Normal'])
#
#     p3 = Paragraph("<para fontSize=6><b>Customer Po ref.</b></para>",styles['Normal'])
#     p4 = Paragraph("<para fontSize=6><b></b></para>",styles['Normal'])
#     p5 = Paragraph("<para fontSize=6><b>Insurance</b></para>",styles['Normal'])
#     p6 = Paragraph("<para fontSize=6><b>NA</b></para>",styles['Normal'])
#     p7 = Paragraph("<para fontSize=6><b>Transporter Name:</b></para>",styles['Normal'])
#     p8 = Paragraph("<para fontSize=6><b></b></para>",styles['Normal'])
#     p9 = Paragraph("<para fontSize=6><b>LR No.</b></para>",styles['Normal'])
#     p10 = Paragraph("<para fontSize=6><b>NA</b></para>",styles['Normal'])
#     p11 = Paragraph("<para fontSize=6 alignment='center'><b>Bill to Party</b></para>",styles['Normal'])
#     p12 = Paragraph("<para fontSize=6 alignment='center'><b>Ship to Party</b></para>",styles['Normal'])
#
#     p13 = Paragraph("<para fontSize=6><b>Name:</b></para>",styles['Normal'])
#     p14 = Paragraph("<para fontSize=6><b>SHRUJANA Enterprises</b></para>",styles['Normal'])
#     p15 = Paragraph("<para fontSize=6><b>Name:</b></para>",styles['Normal'])
#     p16 = Paragraph("<para fontSize=6><b>SHRUJANA Enterprises</b></para>",styles['Normal'])
#     p17 = Paragraph("<para fontSize=6><b>Adderess : <br/> #no 14,btm ist stage ,Madiwala Bangalore</b></para>",styles['Normal'])
#     p18 = Paragraph("<para fontSize=6><b>Adderess : <br/> #no 14,btm ist stage ,Madiwala Bangalore</b></para>",styles['Normal'])
#
#     p19 = Paragraph("<para fontSize=6><b>GSTIN:</b></para>",styles['Normal'])
#     p20 = Paragraph("<para fontSize=6><b>49HJKDF76</b></para>",styles['Normal'])
#     p21 = Paragraph("<para fontSize=6><b>GSTIN:</b></para>",styles['Normal'])
#     p22 = Paragraph("<para fontSize=6><b>49HJKDF76</b></para>",styles['Normal'])
#
#     p23 = Paragraph("<para fontSize=6><b>STATE</b></para>",styles['Normal'])
#     p24 = Paragraph("<para fontSize=6><b>KARNATAKA</b></para>",styles['Normal'])
#     p25 = Paragraph("<para fontSize=6><b>code</b></para>",styles['Normal'])
#     p26 = Paragraph("<para fontSize=6><b>49</b></para>",styles['Normal'])
#     p27 = Paragraph("<para fontSize=6><b>STATE</b></para>",styles['Normal'])
#     p28 = Paragraph("<para fontSize=6><b>KARNATAKA</b></para>",styles['Normal'])
#     p29 = Paragraph("<para fontSize=6><b>code</b></para>",styles['Normal'])
#     p30 = Paragraph("<para fontSize=6><b>29</b></para>",styles['Normal'])
#
#
#
#     data1 = [[p1,p01,'','',p2,p02,'',''],[p3,'',p4,'',p5,p6,'',''],[p7,'',p8,'',p9,p10,'',''],[p11,'','','',p12,'','',''],
#              [p13,'',p14,'',p15,p16,'',''],[p17,'','','',p18,'','',''],[p19,p20,'','',p21,p22,'',''],[p23,p24,p25,p26,p27,p28,p29,p30]]
#     rheight=0.2*inch,0.2*inch,0.2*inch,0.2*inch,0.2*inch,0.4*inch,0.2*inch,0.2*inch #[1.1*inch,1.1*inch]
#     cwidth=8*[1.04*inch]
#     t1=Table(data1,rowHeights=rheight,colWidths=cwidth)
#     t1.setStyle(TableStyle([('TEXTCOLOR',(0,0),(-1,-1),black),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black),('SPAN',(0,0),(3,0)),
#                            ('SPAN',(4,0),(7,0)),('SPAN',(1,0),(3,0)),('SPAN',(5,0),(7,0)),('SPAN',(0,1),(1,1)),('SPAN',(2,1),(3,1)),('SPAN',(5,1),(7,1)),('SPAN',(0,2),(1,2)),
#                            ('SPAN',(5,2),(7,2)),('SPAN',(2,2),(3,2)),('SPAN',(0,3),(3,3)), ('SPAN',(4,3),(7,3)),('SPAN',(0,4),(1,4)),('SPAN',(2,4),(3,4)),('SPAN',(5,4),(7,4)),
#                            ('SPAN',(0,5),(3,5)),('SPAN',(4,5),(7,5)),('SPAN',(0,6),(3,6)),('SPAN',(4,6),(7,6)),('BACKGROUND', (0, 3), (7, 3), colors.lavender),('SPAN',(1,6),(3,6)),
#                            ('SPAN',(5,6),(7,6)),('VALIGN',(0,0),(-1,-1),'TOP'),]))
#
#     elements.append(t1)
#     elements.append(Spacer(1,15))
#
#     q1 = Paragraph("<para fontSize=6><b>S.No</b></para>",styles['Normal'])
#     q01 = Paragraph("<para fontSize=6><b>Product Description</b></para>",styles['Normal'])
#
#     q2 = Paragraph("<para fontSize=6><b>HSN/SAC<br/>Code</b></para>",styles['Normal'])
#     q02 = Paragraph("<para fontSize=6><b>Qty</b></para>",styles['Normal'])
#
#     q3 = Paragraph("<para fontSize=6><b>UOM</b></para>",styles['Normal'])
#     q4 = Paragraph("<para fontSize=6><b>Rate</b></para>",styles['Normal'])
#     q5 = Paragraph("<para fontSize=6><b>Taxable Value</b></para>",styles['Normal'])
#
#     q6 = Paragraph("<para fontSize=6><b>CGST</b></para>",styles['Normal'])
#     q6_1 = Paragraph("<para fontSize=6><b>Rate</b></para>",styles['Normal'])
#     q6_2 = Paragraph("<para fontSize=6><b>Amount</b></para>",styles['Normal'])
#
#
#     q7 = Paragraph("<para fontSize=6><b>SGST</b></para>",styles['Normal'])
#     q7_1 = Paragraph("<para fontSize=6><b>Rate</b></para>",styles['Normal'])
#     q7_2 = Paragraph("<para fontSize=6><b>Amount</b></para>",styles['Normal'])
#
#     q8 = Paragraph("<para fontSize=6><b>IGST</b></para>",styles['Normal'])
#     q8_1 = Paragraph("<para fontSize=6><b>Rate</b></para>",styles['Normal'])
#     q8_2 = Paragraph("<para fontSize=6><b>Amount</b></para>",styles['Normal'])
#
#     q9 = Paragraph("<para fontSize=6 alignment='center'><b>Total</b></para>",styles['Normal'])
#     q10 = Paragraph("<para fontSize=8 alignment='center'><b>Total</b></para>",styles['Normal'])
#
#     data2 = [[q1,q01,q2,q02,q3,q4,q5,'','','','','','',q9],['','','','','','','',q6_1,q6_2,q7_1,q7_2,q8_1,q8_2,''],['','','','','','','','','','','','','',''],
#              ['','','','','','','','','','','','','',''],[q10,'','','','','','','','','','','','','']]
#
#     rheights=5*[0.4*inch]
#     rheights[0]=0.19*inch
#     rheights[1]=0.19*inch
#     cwidths=14*[0.45*inch]
#     cwidths[0]=0.4*inch
#     cwidths[1]=1*inch
#     cwidths[2]=0.7*inch
#     cwidths[3]=0.4*inch
#     cwidths[6]=1*inch
#     cwidths[5]=0.7*inch
#     cwidths[13]=0.81*inch
#     cwidths[7]=0.4*inch
#     cwidths[9]=0.4*inch
#     cwidths[11]=0.4*inch
#     cwidths[8]=0.55*inch
#     cwidths[10]=0.55*inch
#     cwidths[12]=0.55*inch
#     t2=Table(data2,rowHeights=rheights,colWidths=cwidths)
#     t2.setStyle(TableStyle([('TEXTCOLOR',(0,0),(-1,-1),black),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black),('SPAN',(0,0),(0,1)),
#                              ('SPAN',(1,0),(1,1)),('SPAN',(2,0),(2,1)),('SPAN',(3,0),(3,1)),('SPAN',(4,0),(4,1)),('SPAN',(5,0),(5,1)),('SPAN',(6,0),(6,1)),('SPAN',(7,0),(8,0)),
#                              ('SPAN',(9,0),(10,0)),('SPAN',(11,0),(12,0)),('SPAN',(13,0),(13,1)),('SPAN',(0,4),(2,4)),('VALIGN',(0,0),(-1,-1),'MIDDLE')]))
#
#     elements.append(t2)
#     elements.append(Spacer(1,4))
#     elements.append(Paragraph("<para fontSize=6 > Rupees Two Lakh Thirty thosand </para>",styles['Normal']))
#
#     r1 = Paragraph("<para fontSize=6><b>Payment Terms:</b>{0}</para>".format('100% against delivery'),styles['Normal'])
#
#
#     r3 = [Paragraph("<para fontSize=6 alignment='center'>{0}<br/></para>".format('Certificate that the particulars given above are true and correct'),styles['Normal']),
#            Paragraph("<para fontSize=8 alignment='center'><b>{0}</b></para>".format('BRUDERER PRESSES INDIA PVT.LTD.'),styles['Normal'])]
#
#     r4 = [Paragraph("<para fontSize=6><b>Bank Details :{0}</b></para>".format('IDBI Bank LTD.'),styles['Normal']),
#           Paragraph("<para fontSize=6><b>{0}</b><br/></para>".format('BANGALORE-560048, KARNATAKA'),styles['Normal']),
#           Paragraph("<para fontSize=6><b>Account No : {0}</b><br/></para>".format('9845201345657'),styles['Normal']),
#           Paragraph("<para fontSize=6><b>IFSC code : {0}</b><br/></para>".format('BFGN87'),styles['Normal'])]
#
#
#     data3 = [[r1,'',r3],[r4,'','']]
#     rheightss=2*[0.8*inch]
#     cwidthss=3*[2.24*inch]
#     cwidthss[2]=3*inch
#     cwidthss[0]=3.1*inch
#     t3=Table(data3,rowHeights=rheightss,colWidths=cwidthss)
#     t3.setStyle(TableStyle([('TEXTCOLOR',(0,0),(-1,-1),black),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black),('SPAN',(2,0),(2,1)),
#                              ('SPAN',(1,0),(1,1)),('VALIGN',(0,0),(-1,-1),'TOP')]))
#     elements.append(t3)
#
#
#     doc.build(elements)

class InventoryViewSet(viewsets.ModelViewSet):
    permissions_classes  = (permissions.AllowAny , )
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer
    # filter_backends = [DjangoFilterBackend]
    # filter_fields = ['products','project']

class MaterialIssueViewSet(viewsets.ModelViewSet):
    permissions_classes  = (permissions.AllowAny , )
    queryset = MaterialIssue.objects.all()
    serializer_class = MaterialIssueSerializer
    # filter_backends = [DjangoFilterBackend]
    # filter_fields = ['products','project']

class MaterialIssueMainViewSet(viewsets.ModelViewSet):
    permissions_classes  = (permissions.AllowAny , )
    # queryset = MaterialIssueMain.objects.all()
    serializer_class = MaterialIssueMainSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['project']
    def get_queryset(self):
        if 'search' in self.request.GET:
            return MaterialIssueMain.objects.filter(project__title__icontains=self.request.GET['search'])
        else:
            return MaterialIssueMain.objects.all()


class MaterialIssuedNoteAPIView(APIView):
    def get(self , request , format = None):
        value = request.GET['value']
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment;filename="Quotationdownload.pdf"'
        materialIssued(response , value , request)
        return response

class ProductInventoryAPIView(APIView):
    renderer_classes = (JSONRenderer,)
    def get(self , request , format = None):
        offset = int(request.GET['offset'])
        limit = offset + int(request.GET['limit'])
        print offset,limit
        total = 0
        toReturn = []
        if request.GET['search']!='undefined':
            productlist = Inventory.objects.filter( Q(product__part_no__icontains=request.GET['search']) | Q(product__description_1__icontains=request.GET['search']))
        else:
            productlist = Inventory.objects.all()
        productsList = list(productlist.values('product').distinct().values('product__pk','product__description_1','product__part_no','product__description_2','product__weight','product__price'))
        for i in productsList:
            totalprice = 0
            totalqty = 0
            totalVal =0
            totalSum = 0
            data = list(productlist.filter(product=i['product__pk']).values())
            for k in data:
                print k['rate'] ,k['qty']
                print type(k['rate']) ,type(k['qty'])
                totalVal = k['rate'] * k['qty']
                totalprice += k['rate']
                totalqty += k['qty']
                totalSum+=totalVal
            toReturn.append({'productPk':i['product__pk'],'productDesc':i['product__description_1'],'productPartno':i['product__part_no'],'productDesc2':i['product__description_2'],'weight':i['product__weight'],'price':i['product__price'],'data':data,'totalprice':totalprice,'totalqty':totalqty,'totalVal':totalSum})
            total+=totalSum
        returnData ={'data' :toReturn[offset : limit],'total':total }
        return Response(returnData,status=status.HTTP_200_OK)


class OrderAPIView(APIView):
    renderer_classes = (JSONRenderer,)
    def post(self , request , format = None):
        user =  User.objects.get(pk=request.data["user"])
        project = Projects.objects.get(pk=request.data["project"])
        prodList = request.data["products"]
        orderlist =[]
        for i in prodList:
            prodListQty = i['prodQty']
            invlist = Inventory.objects.filter(product=i['pk'])
            list = []
            stockList = []
            price = 0
            for p in invlist:
                if p.qty>0:
                    if p.rate>=price:
                        price = p.rate
                    else:
                        price=price
                    if prodListQty!=0:
                        if prodListQty>=p.qty:
                            stockList.append({'part_no':p.product.part_no,'qty': p.qty})
                            prodListQty = prodListQty - p.qty
                            p.qty = 0
                            p.save()
                        elif prodListQty<p.qty:
                            stockList.append({'part_no':p.product.part_no,'qty': p.qty})
                            p.qty = p.qty - prodListQty
                            prodListQty = 0
                            p.save()
                    if prodListQty==0:
                        print stockList
                        data = {
                        'qty': i['prodQty'],
                        'product' :Products.objects.get(pk=i['pk']),
                        'price' : price,
                        'stock': stockList
                        }
                        orderObj = MaterialIssue.objects.create(**data)
                        orderObj.save()
                        orderlist.append(orderObj.pk)
            dataVal = {
                "user" : user,
                "project" : project,
            }
            materialIssueObj = MaterialIssueMain.objects.create(**dataVal)
            materialIssueObj.save()
            for i in orderlist:
                print i
                inv = MaterialIssue.objects.get(pk=i)
                materialIssueObj.materialIssue.add(inv)
                materialIssueObj.save()

        return Response(materialIssueObj.pk,status=status.HTTP_200_OK)


import requests
class EmailApi(APIView):
    permission_classes = (permissions.AllowAny ,)
    def post(self, request, format=None):
        email=[]
        projectPk = request.data['pkValue']
        link = request.data['link']
        linkUrl = link['origin'] + '/approve/?project=' + str(projectPk)
        print linkUrl,'aaaaaaaaaaaaaaaaa'
        project = Projects.objects.get(pk=projectPk)
        productDetails = BoM.objects.filter(project__id = projectPk)
        totalprice = 0
        totalqty = 0
        totalcustomerPrice = 0
        for i in productDetails:
            totalprice+=i.price
            totalqty+=i.quantity1
            totalcustomerPrice+=i.customer_price
        ctx = {
            'recieverName' : 'admin',
            'productDetails' : productDetails,
            'project':project,
            'link':linkUrl,
            'totalPrice':totalprice,
            'totalQty' : totalqty,
            'totalCustomerPrice' : totalcustomerPrice,
            'message' : 'Please click on the below link to change the status'

        }
        email.append('ankita.k@cioc.in')
        email_subject = 'Approval'
        email_body = get_template('app.approval.email.html').render(ctx)
        msg = EmailMessage(email_subject, email_body, to= email , from_email= 'ankita.k@cioc.in' )
        msg.content_subtype = 'html'
        msg.send()
        return Response(status = status.HTTP_200_OK)

class CalculateAPIView(APIView):
    renderer_classes = (JSONRenderer,)
    def post(self , request , format = None):
        project = Projects.objects.get(pk=request.data['projectPK'])
        invoiceValue = request.data['invoiceValue']
        packing = request.data['packing']
        insurance = request.data['insurance']
        freight = request.data['freight']
        assessableValue = request.data['assessableValue']
        gst1 = request.data['gst1']
        gst2 = request.data['gst2']
        clearingCharges1 = request.data['clearingCharges1']
        clearingCharges2 = request.data['clearingCharges2']
        if packing > 0:
            packingPer = packing*100 / invoiceValue
        else:
            packingPer = 0
        return Response(status = status.HTTP_200_OK)
