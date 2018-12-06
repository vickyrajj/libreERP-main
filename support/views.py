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
    filter_fields = ['status']

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
    p7_02 =Paragraph("<para fontSize=8>{0}</para>".format('122345'),styles['Normal'])
    p7_03 =Paragraph("<para fontSize=8>Your Quotation ref</para>",styles['Normal'])
    p7_04 =Paragraph("<para fontSize=8>{0}</para>".format('EX/2018/10136'),styles['Normal'])

    p8_01 =Paragraph("<para fontSize=8>Purchase order date</para>",styles['Normal'])
    p8_02 =Paragraph("<para fontSize=8>{0}</para>".format('01.09.2018'),styles['Normal'])
    p8_03 =Paragraph("<para fontSize=8>Your Quotation Date</para>",styles['Normal'])
    p8_04 =Paragraph("<para fontSize=8>{0}</para>".format('01.08.2018'),styles['Normal'])

    p9_01 =Paragraph("<para fontSize=8>Machine Model</para>",styles['Normal'])
    p9_02 =Paragraph("<para fontSize=8>{0}</para>".format('BSTA 50HL'),styles['Normal'])
    p9_03 =Paragraph("<para fontSize=8>Our GST No.</para>",styles['Normal'])
    p9_04 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])

    p10_01 =Paragraph("<para fontSize=8>Comm Nr</para>",styles['Normal'])
    p10_02 =Paragraph("<para fontSize=8>{0}</para>".format('11111'),styles['Normal'])
    p10_03 =Paragraph("<para fontSize=8></para>",styles['Normal'])
    p10_04 =Paragraph("<para fontSize=8></para>",styles['Normal'])

    p11_01 =Paragraph("<para fontSize=8>Customer ref</para>",styles['Normal'])
    p11_02 =Paragraph("<para fontSize=8>{0}</para>".format('BIND'),styles['Normal'])
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
        id+=1
        part_no = i.products.part_no
        desc = i.products.description_1
        price = i.products.price
        qty = 1
        amnt = price * qty
        grandTotal +=amnt
        p12_01 =Paragraph(str(id),styles['Normal'])
        p12_02 =Paragraph(part_no,styles['Normal'])
        p12_03 =Paragraph(desc,styles['Normal'])
        p12_04 =Paragraph(str(qty),styles['Normal'])
        p12_05 =Paragraph(str(price),styles['Normal'])
        p12_06 =Paragraph(str(amnt),styles['Normal'])
        data2.append([p12_01,p12_02,p12_03,p12_04,p12_05,p12_06])
    print data2,'aaaaaaaaaaaaa'
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





class GetPurchaseAPIView(APIView):
    def get(self , request , format = None):
        project = Projects.objects.get(pk = request.GET['project'])
        purchaselist = BoM.objects.filter(project = request.GET['project'])
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment;filename="payslipdownload.pdf"'
        purchaseOrder(response , project , purchaselist , request)
        return response

class InventoryViewSet(viewsets.ModelViewSet):
    permissions_classes  = (permissions.AllowAny , )
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer
    # filter_backends = [DjangoFilterBackend]
    # filter_fields = ['products','project']

class ProductInventoryAPIView(APIView):
    renderer_classes = (JSONRenderer,)
    def get(self , request , format = None):
        offset = int(request.GET['offset'])
        limit = offset + int(request.GET['limit'])
        print offset,limit
        toReturn = []
        if request.GET['search']!='undefined':
            productlist = Inventory.objects.filter(product__part_no__icontains=request.GET['search'])
        else:
            productlist = Inventory.objects.all()
        productsList = list(productlist.values('product').distinct().values('product__pk','product__description_1','product__part_no','product__description_2','product__weight','product__price'))
        for i in productsList:
            totalprice = 0
            totalqty = 0
            data = list(productlist.filter(product=i['product__pk']).values())
            # print  len(data) - 1 ,'aaaaaaaaaaaaa'
            for k in data:
                totalprice += k['rate']
                totalqty += k['qty']
            toReturn.append({'productPk':i['product__pk'],'productDesc':i['product__description_1'],'productPartno':i['product__part_no'],'productDesc2':i['product__description_2'],'weight':i['product__weight'],'price':i['product__price'],'data':data,'totalprice':totalprice,'totalqty':totalqty})
        return Response(toReturn[offset : limit],status=status.HTTP_200_OK)
