
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
from django.db.models import Q,Count ,F,Sum
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
from django.db.models import CharField,FloatField, Value , Func
import csv
import pandas as pd
from django.http import HttpResponse
from reportlab import *
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.units import cm, mm
from reportlab.lib import colors , utils
from reportlab.platypus import Paragraph, Table, TableStyle, Image, Frame, Spacer, PageBreak, BaseDocTemplate, PageTemplate, SimpleDocTemplate, Flowable,ListItem,ListFlowable
from PIL import Image
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet, TA_CENTER
from reportlab.graphics import barcode , renderPDF
from reportlab.graphics.shapes import *
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.lib.pagesizes import letter,A5,A4,A3,A2
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import ParagraphStyle,getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.lib.colors import *
from reportlab.lib.units import inch, cm
from django.template.loader import render_to_string, get_template
from django.core.mail import send_mail, EmailMessage
from excel_response import ExcelResponse

class ProductsViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny , )
    # queryset = Products.objects.all()
    serializer_class = ProductsSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['part_no','parent','created' , 'bar_code']
    def get_queryset(self):
        if 'search' in self.request.GET:
            print 'herrrrrrrrrrreeeee'
            objs = Products.objects.all()
            product = objs.filter(part_no__contains=str(self.request.GET['search']))
            product1  = objs.filter(replaced__icontains=str(self.request.GET['search']))
            return product | product1
        elif 'searchContains' in self.request.GET:
            productList = list(Inventory.objects.filter(product__part_no__icontains = self.request.GET['searchContains']).distinct().values_list('product',flat=True))
            return Products.objects.filter(pk__in=productList)
        else:
            return Products.objects.all()



class ProductSheetViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny , )
    queryset = ProductSheet.objects.all()
    serializer_class = ProductSheetSerializer



class ProjectsViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny , )
    # queryset = Projects.objects.all().order_by('-created')
    serializer_class = ProjectsSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['status','title','savedStatus','junkStatus','comm_nr']
    def get_queryset(self):
        if 'searchContains' in self.request.GET:
            objs = Projects.objects.all()
            product = objs.filter(title__contains=str(self.request.GET['searchContains']))
            product1  = objs.filter(comm_nr__icontains=str(self.request.GET['searchContains']))
            return product | product1
        else:
            return Projects.objects.all().order_by('-created')

class VendorViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny , )
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name']

class BoMViewSet(viewsets.ModelViewSet):
    permissions_classes  = (permissions.AllowAny , )
    queryset = BoM.objects.all()
    serializer_class = BoMSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['products','project']

class StockCheckViewSet(viewsets.ModelViewSet):
    permissions_classes  = (permissions.AllowAny , )
    queryset = StockCheck.objects.all()
    serializer_class = StockCheckSerializer
    # filter_backends = [DjangoFilterBackend]
    # filter_fields = ['products','project']

class StockCheckLogViewSet(viewsets.ModelViewSet):
    permissions_classes  = (permissions.AllowAny , )
    queryset = StockCheckLog.objects.all()
    serializer_class = StockCheckLogSerializer
    # filter_backends = [DjangoFilterBackend]
    # filter_fields = ['products','project']

class StockSummaryReportViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny , )
    queryset = StockSummaryReport.objects.all()
    serializer_class = StockSummaryReportSerializer

class ProjectStockSummaryViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny , )
    queryset = ProjectStockSummary.objects.all()
    serializer_class = ProjectStockSummarySerializer

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
            unSaved = []
            count = 0
            for i in range(2,ws.max_row+1):
                try:
                    print 'aaaaaaaaaaa'
                    try:
                        part_no = ws['A' + str(i)].value
                    except:
                        part_no = None



                    try:
                        description_1 = ws['B' + str(i)].value
                    except:
                        description_1 = None


                    try:
                        description_2 = ws['C' + str(i)].value
                    except:
                        description_2 = None


                    try:
                        weight = ws['D' + str(i)].value
                    except:
                        weight = None


                    try:
                        price = ws['E' + str(i)].value
                    except:
                        price = None


                    try:
                        parent_no = ws['F' + str(i)].value
                        parent = None
                        if parent_no:
                            par = Products.objects.get(part_no=parent_no)
                            print par ,'rrrrrrrrrrrrrr'
                            parent = par
                    except:
                        parent = None

                    try:
                        replaced = ws['F' + str(i)].value
                    except:
                        replaced = None


                    try:
                        customs_no = ws['G' + str(i)].value

                    except:
                        customs_no = None

                    try:
                        custom = ws['H' + str(i)].value
                    except:
                        custom = 7.5
                    try:
                        gst = ws['I' + str(i)].value
                    except:
                        gst = 18


                    Products.objects.get_or_create(part_no=part_no, description_1=description_1,description_2=description_2,replaced=replaced,parent=parent,weight=weight, price=price,customs_no=customs_no,custom=custom,gst=gst)
                    count+=1
                except:
                    unSaved.append(part_no)
        data = {"count":count,"no":part_no}
        return Response(data,status=status.HTTP_200_OK)
from reportlab.lib.styles import getSampleStyleSheet
from svglib.svglib import svg2rlg
from reportlab.lib.enums import TA_RIGHT, TA_CENTER
def purchaseOrder(response , project , purchaselist, multNumber,currencyTyp, request):
    styles = getSampleStyleSheet()
    doc = SimpleDocTemplate(response,pagesize=letter, topMargin=0.2*cm,leftMargin=0.1*cm,rightMargin=0.1*cm)
    doc.request = request
    elements = []
    elements.append(Spacer(1,30))
    logo = svg2rlg(os.path.join(globalSettings.BASE_DIR , 'static_shared','images' , 'Bruderer_Logo_svg.svg'))
    sx=sy=0.1
    logo.width,logo.height = logo.minWidth()*sx, logo.height*sy
    logo.scale(sx,sy)
    elements.append(logo)
    elements.append(Spacer(1,10))
    style_right = ParagraphStyle(name='right', parent=styles['Normal'], alignment=TA_RIGHT)


    drawing = svg2rlg(os.path.join(globalSettings.BASE_DIR , 'static_shared','images' , 'anchor_icon.svg'))

    summryHeader = Paragraph("""
    <para >
    <font size='14'>
    PURCHASE ORDER
    <br/>
    <br/>
    </font>
    </para>
    """ %(),styles['Normal'])


    summryHeader1 = Paragraph("""
    <para leftIndent = 10>
    <font size ='10'>
    <b>Purchase Order Ref No :</b> %s <br/>
    <b>Purchase Order Ref Date :</b> %s <br/>
    </font></para>
    """ %(project.poNumber , project.poDate),styles['Normal'])


    tdheader=[[summryHeader,' ',summryHeader1]]
    theader=Table(tdheader,colWidths=[3*inch , 1*inch , 3*inch])
    theader.hAlign = 'LEFT'
    elements.append(theader)


    summryParaSrc = Paragraph("""
    <para >
    <font size='10'>
    <b>%s</b> <br/>
    %s <br/>
    %s - %s<br/>
    %s <br/>
    %s<br/>
    </font>
    </para>
    """ %(project.vendor.name,project.vendor.street ,project.vendor.city,project.vendor.pincode,project.vendor.state , project.vendor.country),styles['Normal'])


    summryParaSrc1 = Paragraph("""
    <para leftIndent = 10>
    <font size ='10'>
    <b>Kind attn :</b> %s <br/>
    <b>Your Quote Ref :</b> %s <br/><br/><br/><br/>
    </font></para>
    """ %(project.vendor.personName,project.quote_ref),styles['Normal'])


    td=[[summryParaSrc,' ',summryParaSrc1]]
    t=Table(td,colWidths=[3*inch , 1*inch , 3*inch])
    t.hAlign = 'LEFT'
    elements.append(t)

    details = Paragraph("""
    <para >
    <font size='10'>
    <b>BILL TO AND SHIP TO : </b> <br/>
    <b>BRUDERER PRESSES INDIA PRIVATE LTD </b> <br/>
    #17P Sadaramangala Industrial Area, <br/>
    Whitefield Road, Kadugodi. <br/>
    <b>GST Number :  AABCB6326Q1Z6 </b> <br/>
    Contact no. : +91 9999999999 <br/>
    E-Mail id:
    </font>
    </para>
    """ %(),styles['Normal'])

    details1 = Paragraph("""
    <para >
    <font size='10'>
    <b>Machine Type :</b> %s <br/>
    <b>Comm Nr :</b> %s<br/>
     <br/><br/><br/><br/><br/>
    </font>
    </para>
    """ %(project.machinemodel, project.comm_nr),styles['Normal'])


    td1=[[details,'',details1]]
    t=Table(td1,colWidths=[3.2*inch , 1*inch , 3*inch])
    t.hAlign = 'LEFT'
    elements.append(t)

    elements.append(Spacer(1,16))

    p14_02 =Paragraph("<para fontSize=8>INCO TERMS</para>",styles['Normal'])
    p14_03 =Paragraph("<para fontSize=8>SPECIAL INSTRUCTIONS</para>",styles['Normal'])
    p14_04 =Paragraph("<para fontSize=8>PAYMENT TERMS</para>",styles['Normal'])
    data6=[[p14_02,p14_03,p14_04]]
    # t6=Table(data6)
    # t6.hAlign = 'LEFT'
    # t6.setStyle(TableStyle([('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),black),('ALIGN',(0,0),(-1,-1),'LEFT'),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))
    # elements.append(t6)

    # if currencyTyp=='CHF':
    #     paymentterms1 = "50% advance along with order"
    #     paymentterms2 = "30% within 1 week from the date of invoice"
    #     special2 = "Shipment mode - Road"
    #     special3 = "Freight forwarder - "
    # else:
    #     paymentterms1 = "50% advance along with order"
    #     paymentterms2 = "30% within 1 week from the date of invoice"
    #     special2 = "Shipment mode - Air"
    #     special3 = "Freight forwarder - NATCO"
    # paymentterms3 = "Balance plus GST within 1 month from date of receipt of goods"
    special1 = "Delivery - " + str(project.date)
    special2 = "Shipment mode - " + project.shipmentMode
    special3 = project.shipmentDetails
    p15_02 =Paragraph("<para fontSize=8>{0}</para>".format(project.terms),styles['Normal'])
    p15_03 =Paragraph("<para fontSize=8>{0}<br/>{1}<br/><b>{2}</b></para>".format(special1,special2,special3),styles['Normal'])
    p15_04 =Paragraph("<para fontSize=8>{0}</para>".format(project.paymentTerms1),styles['Normal'])
    data6+=[[p15_02,p15_03,p15_04]]
    t6=Table(data6)
    t6.hAlign = 'LEFT'
    t6.setStyle(TableStyle([('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),black),('ALIGN',(0,0),(-1,-1),'LEFT'),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))
    elements.append(t6)


    elements.append(Spacer(1,10))
    if currencyTyp == 'CHF':
        priceTitle = 'Unit price in CHF'
        amountTitle = 'Amount in CHF'
        totalTitle = 'Total in CHF'
    elif currencyTyp == 'INR':
        priceTitle = 'Unit price in INR'
        amountTitle = 'Amount in INR'
        totalTitle = 'Total in INR'
    else:
        priceTitle = 'Unit price'
        amountTitle = 'Amount'
        totalTitle = 'Total'
    p101_01 =Paragraph("<para fontSize=8>Sl. no</para>",styles['Normal'])
    p101_02 =Paragraph("<para fontSize=8>Part Number</para>",styles['Normal'])
    p101_03 =Paragraph("<para fontSize=8>Part Desc</para>",styles['Normal'])
    p101_07 =Paragraph("<para fontSize=8>HS Code</para>",styles['Normal'])
    p101_04 =Paragraph("<para fontSize=8>Qty</para>",styles['Normal'])
    p101_05 =Paragraph("<para fontSize=8>{0}</para>".format(priceTitle),styles['Normal'])
    p101_06 =Paragraph("<para fontSize=8>{0}</para>".format(amountTitle),styles['Normal'])


    data5=[[p101_01,p101_02,p101_03,p101_07,p101_04,p101_05,p101_06]]

    grandTotal = 0
    data2 = []
    id=0
    for i in purchaselist:
        id+=1
        part_no = i.products.part_no
        desc = i.products.description_1
        hs = i.products.customs_no

        price = i.price * multNumber
        qty = i.quantity1
        amnt = round((price * qty),2)
        grandTotal +=amnt
        grandTotal = round(grandTotal,2)

        p12_01 = Paragraph("<para fontSize=8>{0}</para>".format(id),styles['Normal'])
        p12_02 =Paragraph("<para fontSize=8>{0}</para>".format(part_no),styles['Normal'])
        p12_03 =Paragraph("<para fontSize=8>{0}</para>".format(smart_str(desc)),styles['Normal'])
        p12_07 =Paragraph("<para fontSize=8>{0}</para>".format(smart_str(hs)),styles['Normal'])
        p12_04 =Paragraph("<para fontSize=8>{0}</para>".format(qty),styles['Normal'])
        p12_05 =Paragraph("<para fontSize=8> {:,}</para>".format(price),style_right)
        p12_06 =Paragraph("<para fontSize=8> {:,}</para>".format(amnt),style_right)
        data5.append([p12_01,p12_02,p12_03,p12_07,p12_04,p12_05,p12_06])


    grandTotal = round(grandTotal,2)
    p13_01 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
    p13_02 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
    p13_03 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
    p13_04 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
    p13_05 =Paragraph("<para fontSize=8></para>",styles['Normal'])
    p13_06 =Paragraph("<para fontSize=8> {0}</para>".format(totalTitle),styles['Normal'])
    p13_07 =Paragraph("<para fontSize=8> {:,}</para>".format(grandTotal),style_right)

    data5+=[[p13_01,p13_02,p13_03,p13_04,p13_05,p13_06,p13_07]]
    t3=Table(data5,colWidths=(10*mm,None, 50*mm, None, None, None, None))
    t3.setStyle(TableStyle([('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),black),('ALIGN',(0,0),(-1,-1),'LEFT'),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))

    elements.append(t3)
    # else:
    #     p101_01 =Paragraph("<para fontSize=8>Sl. no</para>",styles['Normal'])
    #     p101_02 =Paragraph("<para fontSize=8>Part Number</para>",styles['Normal'])
    #     p101_03 =Paragraph("<para fontSize=8>Part Desc</para>",styles['Normal'])
    #     p101_07 =Paragraph("<para fontSize=8>HS Code</para>",styles['Normal'])
    #     p101_04 =Paragraph("<para fontSize=8>Qty</para>",styles['Normal'])
    #     p101_05 =Paragraph("<para fontSize=8>Unit price in INR</para>",styles['Normal'])
    #     p101_06 =Paragraph("<para fontSize=8>Amount in INR</para>",styles['Normal'])
    #     p101_08 =Paragraph("<para fontSize=8>GST</para>",styles['Normal'])
    #     p101_09 =Paragraph("<para fontSize=8>Total with GST</para>",styles['Normal'])
    #
    #
    #     data2=[[p101_01,p101_02,p101_03,p101_07,p101_04,p101_05,p101_06,p101_08,p101_09]]
    #     grandTotal = 0
    #     id=0
    #     amnt =0
    #     gstValTotal=0
    #     for i in purchaselist:
    #         id+=1
    #         part_no = i.products.part_no
    #         desc = i.products.description_1
    #         hs = i.customs_no
    #         price = i.landed_price
    #         qty = i.quantity1
    #         amnt = round((price * qty),2)
    #         print amnt,'kkkkkk'
    #         grandTotal +=amnt
    #         gst = i.gst
    #         gstVal = round(((((amnt *gst)/100)+amnt)),2)
    #         gstValTotal += gstVal
    #
    #
    #         p12_01 = Paragraph("<para fontSize=8>{0}</para>".format(id),styles['Normal'])
    #         p12_02 =Paragraph("<para fontSize=8>{0}</para>".format(part_no),styles['Normal'])
    #         p12_03 =Paragraph("<para fontSize=8>{0}</para>".format(smart_str(desc)),styles['Normal'])
    #         p12_07 =Paragraph("<para fontSize=8>{0}</para>".format(smart_str(hs)),styles['Normal'])
    #         p12_04 =Paragraph("<para fontSize=8>{0}</para>".format(qty),styles['Normal'])
    #         p12_05 =Paragraph("<para fontSize=8>{0}</para>".format(price),styles['Normal'])
    #         p12_06 =Paragraph("<para fontSize=8>{0}</para>".format(amnt),styles['Normal'])
    #         p12_08 =Paragraph("<para fontSize=8>{0}%</para>".format(gst),styles['Normal'])
    #         p12_09 =Paragraph("<para fontSize=8>{0}</para>".format(gstVal),styles['Normal'])
    #         data2.append([p12_01,p12_02,p12_03,p12_07,p12_04,p12_05,p12_06,p12_08,p12_09])
    #
    #
    #     grandTotal = round(grandTotal,2)
    #     gstValTotal = round(gstValTotal,2)
    #     p13_01 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
    #     p13_02 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
    #     p13_03 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
    #     p13_04 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
    #     p13_05 =Paragraph("<para fontSize=8></para>",styles['Normal'])
    #     p13_06 =Paragraph("<para fontSize=8>Total in INR</para>",styles['Normal'])
    #     p13_07 =Paragraph("<para fontSize=8>{0}</para>".format(grandTotal),styles['Normal'])
    #     p13_08 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
    #     p13_09 =Paragraph("<para fontSize=8>{0}</para>".format(gstValTotal),styles['Normal'])
    #
    #     data2+=[[p13_01,p13_02,p13_03,p13_04,p13_05,p13_06,p13_07,p13_08,p13_09]]
    #     t3=Table(data2,colWidths=(10*mm,None, 50*mm, None, None, None, None, None, None))
    #     t3.setStyle(TableStyle([('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),black),('ALIGN',(0,0),(-1,-1),'LEFT'),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))
    #
    #     elements.append(t3)
    elements.append(Spacer(1,8))

    elements.append(Paragraph("<para fontSize=8>Notes:</para>",styles['Normal']))
    print project.poNotes
    try:
        datanotes = project.poNotes.replace('\n', '<br />')
    except:
        datanotes = project.poNotes

    elements.append(Paragraph("<para fontSize=8>{0} </para>".format(datanotes),styles['Normal']))
    # elements.append(abc)

    # elements.append(Paragraph("<para fontSize=8>{0} </para>".format(project.poNotes),styles['Normal']))
    # elements.append(Paragraph("<para fontSize=8> 2. Indicate our PO number on all order related documents. </para>",styles['Normal']))
    # elements.append(Paragraph("<para fontSize=8> 3. Send us your order confirmation within 3 days from the date of receipt of our PO. </para>",styles['Normal']))
    elements.append(Spacer(1,8))
    elements.append(Paragraph("<para fontSize=8>With Best Regards </para>",styles['Normal']))
    elements.append(Spacer(1,8))
    elements.append(Paragraph("<para fontSize=8>For BRUDERER PRESSES INDIA PVT LTD.,</para>",styles['Normal']))
    elements.append(Spacer(1,8))
    elements.append(Paragraph("<para fontSize=8>Authorised Signatory.</para>",styles['Normal']))
    doc.build(elements)



def landingDetails(response , project , purchaselist, request):
    styles = getSampleStyleSheet()
    doc = SimpleDocTemplate(response,pagesize=A2, topMargin=0.2*cm,leftMargin=0.1*cm,rightMargin=0.1*cm)
    doc.request = request
    elements = []
    elements.append(Spacer(1,30))
    logo = svg2rlg(os.path.join(globalSettings.BASE_DIR , 'static_shared','images' , 'Bruderer_Logo_svg.svg'))
    sx=sy=0.1
    logo.width,logo.height = logo.minWidth()*sx, logo.height*sy
    logo.scale(sx,sy)
    elements.append(logo)
    elements.append(Spacer(1,10))
    drawing = svg2rlg(os.path.join(globalSettings.BASE_DIR , 'static_shared','images' , 'anchor_icon.svg'))
    headerDetails = Paragraph("""
    <para>
    <font size ='14'>
    <b> LANDING DETAILS</b><br/>
    </font></para>
    """ %(),styles['Normal'])
    tdheader=[[headerDetails]]
    theader=Table(tdheader,colWidths=[3*inch])
    theader.hAlign = 'LEFT'
    elements.append(theader)
    elements.append(Spacer(1,10))
    details = Paragraph("""
    <para >
    <font size='10'>
    <b>Project Name - </b> %s<br/><br/>
    <b>Comm nr - </b> %s<br/><br/>
    <b>PO ref no - </b> %s <b>Date - </b> %s<br/><br/>
    <b>Invoice ref no - </b> %s <br/><br/>
    <b>BOE ref no - </b> %s </font>
    </para>
    """ %(project.title,project.comm_nr,project.poNumber,project.poDate,project.invoiceNumber,project.boeRefNumber),styles['Normal'])
    tdheader=[[details]]
    theader=Table(tdheader,colWidths=[3*inch])
    theader.hAlign = 'LEFT'
    elements.append(theader)
    elements.append(Spacer(1,10))
    data = []
    p1 =Paragraph("<para fontSize=8></para>",styles['Normal'])
    p2 =Paragraph("<para fontSize=8>Ex works value in CHF</para>",styles['Normal'])
    p3 =Paragraph("<para fontSize=8>Value in INR</para>",styles['Normal'])
    p4 =Paragraph("<para fontSize=8>Factor</para>",styles['Normal'])
    data += [[p1,p2,p3,p4]]
    p01 =Paragraph("<para fontSize=8>Ex Works price </para>",styles['Normal'])
    p02 =Paragraph("<para fontSize=8>{0}</para>".format(round(project.invoiceValue,2)),styles['Normal'])
    p03 =Paragraph("<para fontSize=8>{0}</para>".format(round(project.invoiceValue*project.exRate,2)),styles['Normal'])
    p04 =Paragraph("<para fontSize=8></para>",styles['Normal'])
    data += [[p01,p02,p03,p04]]
    p11 =Paragraph("<para fontSize=8>Packing </para>",styles['Normal'])
    p12 =Paragraph("<para fontSize=8>{0}</para>".format(round(project.packing,2)),styles['Normal'])
    p13 =Paragraph("<para fontSize=8>{0}</para>".format(round(project.packing*project.exRate,2)),styles['Normal'])
    p14 =Paragraph("<para fontSize=8>{0}%</para>".format(round((project.packing*100 / project.invoiceValue),2)),styles['Normal'])
    data += [[p11,p12,p13,p14]]
    p21 =Paragraph("<para fontSize=8>Insurance </para>",styles['Normal'])
    p22 =Paragraph("<para fontSize=8>{0}</para>".format(round(project.insurance,2)),styles['Normal'])
    p23 =Paragraph("<para fontSize=8>{0}</para>".format(round(project.insurance*project.exRate,2)),styles['Normal'])
    p24 =Paragraph("<para fontSize=8>{0}%</para>".format(round((project.insurance*100 / project.invoiceValue),2)),styles['Normal'])
    data += [[p21,p22,p23,p24]]
    p31 =Paragraph("<para fontSize=8>Freight </para>",styles['Normal'])
    p32 =Paragraph("<para fontSize=8>{0}</para>".format(round(project.freight,2)),styles['Normal'])
    p33 =Paragraph("<para fontSize=8>{0}</para>".format(round(project.freight*project.exRate,2)),styles['Normal'])
    p34 =Paragraph("<para fontSize=8>{0}%</para>".format(round((project.freight*100 / project.invoiceValue),2)),styles['Normal'])
    data += [[p31,p32,p33,p34]]
    p41 =Paragraph("<para fontSize=8>Assessable Value </para>",styles['Normal'])
    p42 =Paragraph("<para fontSize=8></para>",styles['Normal'])
    p43 =Paragraph("<para fontSize=8></para>",styles['Normal'])
    p44 =Paragraph("<para fontSize=8>{0}%</para>".format(round(project.assessableValue,2)),styles['Normal'])
    data += [[p41,p42,p43,p44]]
    p51 =Paragraph("<para fontSize=8>GST </para>",styles['Normal'])
    p52 =Paragraph("<para fontSize=8></para>",styles['Normal'])
    p53 =Paragraph("<para fontSize=8></para>",styles['Normal'])
    p54 =Paragraph("<para fontSize=8>18%</para>",styles['Normal'])
    data += [[p51,p52,p53,p54]]
    p61 =Paragraph("<para fontSize=8>GST </para>",styles['Normal'])
    p62 =Paragraph("<para fontSize=8></para>",styles['Normal'])
    p63 =Paragraph("<para fontSize=8></para>",styles['Normal'])
    p64 =Paragraph("<para fontSize=8>28%</para>",styles['Normal'])
    data += [[p61,p62,p63,p64]]
    p71 =Paragraph("<para fontSize=8>Clearing charges - 1 </para>",styles['Normal'])
    p72 =Paragraph("<para fontSize=8></para>",styles['Normal'])
    p73 =Paragraph("<para fontSize=8> {:,}</para>".format(round(project.clearingCharges1,2)),styles['Normal'])
    p74 =Paragraph("<para fontSize=8>{0}%</para>".format(round((project.clearingCharges1*100/(project.invoiceValue* project.exRate)),2)),styles['Normal'])
    data += [[p71,p72,p73,p74]]
    p81 =Paragraph("<para fontSize=8>Clearing charges - 2 </para>",styles['Normal'])
    p82 =Paragraph("<para fontSize=8></para>",styles['Normal'])
    p83 =Paragraph("<para fontSize=8> {:,}</para>".format(round(project.clearingCharges2,2)),styles['Normal'])
    p84 =Paragraph("<para fontSize=8>{0}%</para>".format(round((project.clearingCharges2*100/(project.invoiceValue* project.exRate)),2)),styles['Normal'])
    data += [[p81,p82,p83,p84]]
    p91 =Paragraph("<para fontSize=8>Profit margin </para>",styles['Normal'])
    p92 =Paragraph("<para fontSize=8></para>",styles['Normal'])
    p93 =Paragraph("<para fontSize=8></para>",styles['Normal'])
    p94 =Paragraph("<para fontSize=8>{0}%</para>".format(round(project.profitMargin,2)),styles['Normal'])
    data += [[p91,p92,p93,p94]]
    t=Table(data,colWidths=(40*mm,35*mm,  35*mm, 35*mm))
    t.hAlign = 'LEFT'
    t.setStyle(TableStyle([('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),black),('ALIGN',(0,0),(-1,-1),'RIGHT'),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))
    elements.append(t)
    elements.append(Spacer(1,30))
    print project.exRate,'aaaaaa'
    p101 =Paragraph("<para fontSize=8>Ex rate  </para>",styles['Normal'])
    p102 =Paragraph("<para fontSize=8>{0}</para>".format(project.exRate),styles['Normal'])
    data1 = [[p101,p102]]
    t1=Table(data1,colWidths=(40*mm,30*mm))
    t1.hAlign = 'LEFT'
    t1.setStyle(TableStyle([('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),black),('ALIGN',(0,0),(-1,-1),'RIGHT'),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))
    elements.append(t1)
    elements.append(Spacer(1,30))
    data2=[]
    s01 =Paragraph("<para fontSize=8>S.No </para>",styles['Normal'])
    s02 =Paragraph("<para fontSize=8>Part No </para>",styles['Normal'])
    s03 =Paragraph("<para fontSize=8>Products </para>",styles['Normal'])
    s04 =Paragraph("<para fontSize=8>Weight </para>",styles['Normal'])
    s05 =Paragraph("<para fontSize=8>Price(CHF) </para>",styles['Normal'])
    s06 =Paragraph("<para fontSize=8>Qty </para>",styles['Normal'])
    s07 =Paragraph("<para fontSize=8>HSN </para>",styles['Normal'])
    s08 =Paragraph("<para fontSize=8>QP(CHF) </para>",styles['Normal'])
    s09 =Paragraph("<para fontSize=8>X-Work Price(INR) </para>",styles['Normal'])
    s10 =Paragraph("<para fontSize=8>Packing </para>",styles['Normal'])
    s11 =Paragraph("<para fontSize=8>Insurance </para>",styles['Normal'])
    s12 =Paragraph("<para fontSize=8>Freight </para>",styles['Normal'])
    s13 =Paragraph("<para fontSize=8>CIF/Pc </para>",styles['Normal'])
    s14 =Paragraph("<para fontSize=8>Total CIF </para>",styles['Normal'])
    s1c5 =Paragraph("<para fontSize=8>CD % </para>",styles['Normal'])
    s15 =Paragraph("<para fontSize=8>CD Value </para>",styles['Normal'])
    s16 =Paragraph("<para fontSize=8>SWE </para>",styles['Normal'])
    s1g7 =Paragraph("<para fontSize=8>GST% </para>",styles['Normal'])
    s17 =Paragraph("<para fontSize=8>GST </para>",styles['Normal'])
    s18 =Paragraph("<para fontSize=8>CC 1 </para>",styles['Normal'])
    s19 =Paragraph("<para fontSize=8>CC 2 </para>",styles['Normal'])
    s20 =Paragraph("<para fontSize=8>Landing/Pc </para>",styles['Normal'])
    data2 += [[s01,s02,s03,s04,s05,s06,s07,s08,s09,s10,s11,s12,s13,s14,s1c5,s15,s16,s1g7,s17,s18,s19,s20]]
    id = 0
    totprice = 0
    totquote = 0
    totinr = 0
    totpack = 0
    inspack = 0
    frepack = 0
    landtot = 0
    ciftot = 0
    cifroundtot = 0
    totcustomVal = 0
    totsocialVal = 0
    totgstVal = 0
    totcharge1Val = 0
    totcharge2Val = 0
    for i in purchaselist:
        id+=1
        pricetot = i.price*i.quantity1
        totprice+=pricetot
        quotePrice = round(((project.profitMargin * i.price) / 100 + i.price),2)
        quotetot = quotePrice*i.quantity1
        totquote+=quotetot
        inrPrice = round((i.price * project.exRate),2)
        inrtot = inrPrice*i.quantity1
        totinr+=inrtot
        packing = round(((project.packing/ project.invoiceValue) * inrPrice),2)
        packingtot = packing*i.quantity1
        totpack+=packingtot
        insurance = round((((project.insurance  / project.invoiceValue) * inrPrice)),2)
        insurancetot = insurance*i.quantity1
        inspack+=insurancetot
        freight = round((((project.freight / project.invoiceValue) * inrPrice)),2)
        freighttot = freight*i.quantity1
        frepack+=freighttot
        cif = round((inrPrice + packing + insurance + freight),2)
        ciftot+=cif
        cifround = cif * i.quantity1
        cifroundtot+=cifround
        customVal = round(((cif +((cif * project.assessableValue)/100))*(i.custom)/100),2)
        customtot = customVal * i.quantity1
        totcustomVal +=customtot
        socialVal = round((customVal *0.1),2)
        socialtot = socialVal * i.quantity1
        totsocialVal +=socialtot
        gstVal = round(((cif+customVal+socialVal)*(i.gst)/100),2)
        gsttot = gstVal * i.quantity1
        totgstVal +=gsttot
        charge1 = round((inrPrice * (project.clearingCharges1 / (project.invoiceValue * project.exRate))),2)
        charge1tot = charge1 * i.quantity1
        totcharge1Val +=charge1tot
        charge2 = round((inrPrice * (project.clearingCharges2 / (project.invoiceValue * project.exRate))),2)
        charge2tot = charge2 * i.quantity1
        totcharge2Val +=charge2tot
        landng=i.landed_price*i.quantity1
        landtot+=landng
        # landed_price = ((cif + customVal + socialVal + charge1 + charge2),2)
        s21 =Paragraph("<para fontSize=8>{0} </para>".format(id),styles['Normal'])
        s22 =Paragraph("<para fontSize=8>{0} </para>".format(i.products.part_no),styles['Normal'])
        s23 =Paragraph("<para fontSize=8>{0} </para>".format(smart_str(i.products.description_1)),styles['Normal'])
        s24 =Paragraph("<para fontSize=8>{0} </para>".format(i.products.weight),styles['Normal'])
        s25 =Paragraph("<para fontSize=8> {:,}</para>".format(round(i.price,2)),styles['Normal'])
        s26 =Paragraph("<para fontSize=8>{0} </para>".format(i.quantity1),styles['Normal'])
        s27 =Paragraph("<para fontSize=8>{0} </para>".format(i.products.customs_no),styles['Normal'])
        s28 =Paragraph("<para fontSize=8> {:,} </para>".format(round(quotePrice,2)),styles['Normal'])
        s29 =Paragraph("<para fontSize=8> {:,} </para>".format(round(inrPrice,2)),styles['Normal'])
        s30 =Paragraph("<para fontSize=8> {:,} </para>".format(round(packing,2)),styles['Normal'])
        s31 =Paragraph("<para fontSize=8> {:,}</para>".format(round(insurance,2)),styles['Normal'])
        s32 =Paragraph("<para fontSize=8> {:,} </para>".format(round(freight,2)),styles['Normal'])
        s33 =Paragraph("<para fontSize=8> {:,}</para>".format(round(cif,2)),styles['Normal'])
        s34 =Paragraph("<para fontSize=8> {:,} </para>".format(round(cif*i.quantity1,2)),styles['Normal'])
        s3c5 =Paragraph("<para fontSize=8>{0} </para>".format(round(i.custom,2)),styles['Normal'])
        s35 =Paragraph("<para fontSize=8> {:,} </para>".format(round(customVal,2)),styles['Normal'])
        s36 =Paragraph("<para fontSize=8> {:,} </para>".format(round(socialVal,2)),styles['Normal'])
        s3g7 =Paragraph("<para fontSize=8>{0} </para>".format(i.gst),styles['Normal'])
        s37 =Paragraph("<para fontSize=8> {:,} </para>".format(round(gstVal,2)),styles['Normal'])
        s38 =Paragraph("<para fontSize=8> {:,}</para>".format(round(charge1,2)),styles['Normal'])
        s39 =Paragraph("<para fontSize=8> {:,} </para>".format(round(charge2,2)),styles['Normal'])
        s40 =Paragraph("<para fontSize=8> {:,} </para>".format(i.landed_price),styles['Normal'])
        data2.append([s21,s22,s23,s24,s25,s26,s27,s28,s29,s30,s31,s32,s33,s34,s3c5,s35,s36,s3g7,s37,s38,s39,s40])
    s21 =Paragraph("<para fontSize=8> </para>",styles['Normal'])
    s22 =Paragraph("<para fontSize=8> </para>",styles['Normal'])
    s23 =Paragraph("<para fontSize=8> </para>",styles['Normal'])
    s24 =Paragraph("<para fontSize=8> </para>",styles['Normal'])
    s25 =Paragraph("<para fontSize=8>{:,}</para>".format(round(totprice,2)),styles['Normal'])
    s26 =Paragraph("<para fontSize=8> </para>",styles['Normal'])
    s27 =Paragraph("<para fontSize=8> </para>",styles['Normal'])
    s28 =Paragraph("<para fontSize=8> {:,} </para>".format(round(totquote,2)),styles['Normal'])
    s29 =Paragraph("<para fontSize=8> {:,}  </para>".format(round(totinr,2)),styles['Normal'])
    s30 =Paragraph("<para fontSize=8> {:,} </para>".format(round(totpack,2)),styles['Normal'])
    s31 =Paragraph("<para fontSize=8> {:,}</para>".format(round(inspack,2)),styles['Normal'])
    s32 =Paragraph("<para fontSize=8> {:,} </para>".format(round(frepack,2)),styles['Normal'])
    s33 =Paragraph("<para fontSize=8> {:,} </para>".format(round(ciftot,2)),styles['Normal'])
    s34 =Paragraph("<para fontSize=8> {:,} </para>".format(round(cifroundtot,2)),styles['Normal'])
    s3c5 =Paragraph("<para fontSize=8> </para>",styles['Normal'])
    s35 =Paragraph("<para fontSize=8> {:,}  </para>".format(round(totcustomVal,2)),styles['Normal'])
    s36 =Paragraph("<para fontSize=8> {:,} </para>".format(round(totsocialVal,2)),styles['Normal'])
    s3g7 =Paragraph("<para fontSize=8></para>",styles['Normal'])
    s37 =Paragraph("<para fontSize=8>{:,}</para>".format(round(totgstVal,2)),styles['Normal'])
    s38 =Paragraph("<para fontSize=8>{:,}</para>".format(round(totcharge1Val,2)),styles['Normal'])
    s39 =Paragraph("<para fontSize=8> {:,}</para>".format(round(totcharge2Val,2)),styles['Normal'])
    s40 =Paragraph("<para fontSize=8> {:,} </para>".format(round(landtot,2)),styles['Normal'])
    data2.append([s21,s22,s23,s24,s25,s26,s27,s28,s29,s30,s31,s32,s33,s34,s3c5,s35,s36,s3g7,s37,s38,s39,s40])
    t2=Table(data2,colWidths=(11*mm,23*mm, 37*mm, 20*mm, 20*mm, 10*mm, 20*mm,20*mm,20*mm,20*mm,20*mm,20*mm,20*mm,20*mm,10*mm,20*mm,15*mm,10*mm,20*mm,20*mm,20*mm,20*mm))
    t2.hAlign = 'LEFT'
    t2.setStyle(TableStyle([('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),black),('ALIGN',(0,0),(-1,-1),'RIGHT'),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))
    elements.append(t2)
    doc.build(elements)




def quotation(response , project , purchaselist , multNumber,typ,request):
    styles = getSampleStyleSheet()
    doc = SimpleDocTemplate(response,pagesize=letter, topMargin=0.2*cm,leftMargin=0.1*cm,rightMargin=0.1*cm)
    doc.request = request
    elements = []
    style_right = ParagraphStyle(name='right', parent=styles['Normal'], alignment=TA_RIGHT)
    elements.append(Spacer(1,30))
    logo = svg2rlg(os.path.join(globalSettings.BASE_DIR , 'static_shared','images' , 'Bruderer_Logo_svg.svg'))
    sx=sy=0.1
    logo.width,logo.height = logo.minWidth()*sx, logo.height*sy
    logo.scale(sx,sy)
    elements.append(logo)
    elements.append(Spacer(1,10))

    if typ == 'Invoice':
        summryHeader = Paragraph("""
        <para >
        <font size='14'>
        INVOICE
        <br/>
        <br/>
        </font>
        </para>
        """ %(),styles['Normal'])
    else :
        summryHeader = Paragraph("""
        <para >
        <font size='14'>
        QUOTATION
        <br/>
        <br/>
        </font>
        </para>
        """ %(),styles['Normal'])



    summryHeader1 = Paragraph("""
    <para leftIndent = 10>
    <font size ='10'>
    <b>Quote Ref No :</b> %s <br/>
    <b>Quote Ref Date :</b> %s <br/>
    </font></para>
    """ %(project.quoteRefNumber , project.quoteDate),styles['Normal'])
    tdheader=[[summryHeader,' ',summryHeader1]]
    theader=Table(tdheader,colWidths=[3*inch , 1*inch , 3*inch])
    theader.hAlign = 'LEFT'
    elements.append(theader)
    summryParaSrc = Paragraph("""
    <para >
    <font size='10'>
    <b>%s</b> <br/>
    %s <br/>
    %s - %s<br/>
    %s <br/>
    %s<br/>
    </font>
    </para>
    """ %(project.service.name,project.service.address.street ,project.service.address.city,project.service.address.pincode,project.service.address.state , project.service.address.country),styles['Normal'])
    summryParaSrc1 = Paragraph("""
    <para leftIndent = 10>
    <font size ='10'>
    <b>Kind attn :</b> %s <br/>
    <b>Contact no :</b> %s <br/>
    <b>E-Mail ID :</b> %s <br/>
    <b>Your Enquiry Ref :</b> %s <br/><br/>
    </font></para>
    """ %(project.service.customerName , project.service.mobile , project.service.email,project.enquiry_ref),styles['Normal'])
    td=[[summryParaSrc,' ',summryParaSrc1]]
    t=Table(td,colWidths=[3*inch , 1*inch , 3*inch])
    t.hAlign = 'LEFT'
    elements.append(t)
    summrymachineDetails = Paragraph("""
    <para >
    <font size='10'>
    <b>Machine Type :</b> %s <br/>
    <b>Comm Nr :</b> %s
    </font>
    </para>
    """ %(project.machinemodel, project.comm_nr),styles['Normal'])
    tmachine=[[summrymachineDetails,' ','']]
    tdmachine=Table(tmachine,colWidths=[3*inch , 1*inch , 3*inch])
    tdmachine.hAlign = 'LEFT'
    elements.append(tdmachine)
    elements.append(Spacer(1,10))
    if typ != 'Invoice':
        elements.append(Paragraph("<para fontSize=8>Dear Sir,</para>",styles['Normal']))
        elements.append(Spacer(1,10))
        elements.append(Paragraph("<para fontSize=8>We thank you for your enquiry and take pleasure in quoting as follows:</para>",styles['Normal']))
    if typ == 'INR'or typ == 'Invoice':
        data5 = []
        priceFormat = 'Unit price in INR'
        amountFormat = 'Amount in INR'
        p101_01 =Paragraph("<para fontSize=8>Sl. no</para>",styles['Normal'])
        p101_02 =Paragraph("<para fontSize=8>Part Number</para>",styles['Normal'])
        p101_03 =Paragraph("<para fontSize=8>Part Desc</para>",styles['Normal'])
        # p101_09 =Paragraph("<para fontSize=8>Weight</para>",styles['Normal'])
        p101_04 =Paragraph("<para fontSize=8>Qty</para>",styles['Normal'])
        p101_05 =Paragraph("<para fontSize=8>{0}</para>".format(priceFormat),styles['Normal'])
        p101_06 =Paragraph("<para fontSize=8>{0}</para>".format(amountFormat),styles['Normal'])
        p101_07 =Paragraph("<para fontSize=8>GST</para>",styles['Normal'])
        p101_08 =Paragraph("<para fontSize=8>Total With GST</para>",styles['Normal'])

        data5+=[[p101_01,p101_02,p101_03,p101_04,p101_05,p101_06,p101_07,p101_08]]
        # cwidths = 8*[1*inch]
        # t5=Table(data5,colWidths=(12*mm, None,  None, None, None, None, None, None, None))
        # t5.setStyle(TableStyle([('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),black),('ALIGN',(0,0),(-1,-1),'LEFT'),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))
        # t5.hAlign = 'LEFT'
        # t5.setStyle(TableStyle([('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),black),('ALIGN',(0,0),(-1,-1),'LEFT'),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))
        # elements.append(t5)
        gstValTotal = 0
        grandTotal = 0
        data2 = []
        id=0
        grandtotWeight=0
        for i in purchaselist:
            id+=1
            part_no = i.products.part_no
            desc = i.products.description_1
            weight = i.products.weight
            basicprice = i.price
            landingPrice = i.landed_price
            pricesum =round((i.landed_price+(i.price*multNumber*project.profitMargin)/100),2)
            # price = round((pricesum * multNumber),2)
            qty = i.quantity1
            amnt = round((pricesum * qty),2)
            grandTotal +=amnt
            gst = i.gst
            gstVal = round((((amnt *gst)/100)+amnt),2)
            if weight is not None:
                totweight = round((i.products.weight * qty),2)
                grandtotWeight+=totweight
            gstValTotal += gstVal

            p12_01 = Paragraph("<para fontSize=8>{0}</para>".format(id),styles['Normal'])
            p12_02 =Paragraph("<para fontSize=8>{0}</para>".format(part_no),styles['Normal'])
            p12_03 =Paragraph("<para fontSize=8>{0}</para>".format(smart_str(desc)),styles['Normal'])
            # if weight is not None:
            #     p12_09 =Paragraph("<para fontSize=8>{0}</para>".format(round(weight,2)),styles['Normal'])
            # else:
            #     p12_09 =Paragraph("<para fontSize=8>{0}</para>".format(weight),styles['Normal'])
            p12_04 =Paragraph("<para fontSize=8>{0}</para>".format(qty),styles['Normal'])
            p12_05 =Paragraph("<para fontSize=8>{:,}</para>".format(round(pricesum,2)),style_right)
            p12_06 =Paragraph("<para fontSize=8>{:,}</para>".format(round(amnt,2)),style_right)
            p12_07 =Paragraph("<para fontSize=8>{0}%</para>".format(gst),styles['Normal'])
            p12_08 =Paragraph("<para fontSize=8>{:,}</para>".format(round(gstVal,2)),style_right)
            data5.append([p12_01,p12_02,p12_03,p12_04,p12_05,p12_06,p12_07,p12_08])
        # rheights = 6*[1.4*inch],1*[0.4*inch]
        # cwidths = 8*[1*inch]
        # t2=Table(data2,colWidths=(12*mm, None,  None, None, None, None, None, None, None))

        # t2.hAlign = 'LEFT'
        # t2.setStyle(TableStyle([('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),black),('ALIGN',(0,0),(-1,-1),'LEFT'),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))
        grandTotal = round(grandTotal,2)
        gstValTotal = round(gstValTotal,2)
        p13_01 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
        p13_02 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
        p13_03 =Paragraph("<para fontSize=8></para>",styles['Normal'])
        # p13_09 =Paragraph("<para fontSize=8>{0}</para>".format(round(grandtotWeight,2)),styles['Normal'])
        p13_04 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
        p13_05 =Paragraph("<para fontSize=8>Total in INR</para>",styles['Normal'])
        p13_06 =Paragraph("<para fontSize=8>{:,}</para>".format(round(grandTotal,2)),style_right)

        p13_07 =Paragraph("<para fontSize=8></para>",styles['Normal'])
        p13_08 =Paragraph("<para fontSize=8>{:,}</para>".format(round(gstValTotal,2)),style_right)
        data5+=[[p13_01,p13_02,p13_03,p13_04,p13_05,p13_06,p13_07,p13_08]]
        # cwidths = 8*[1*inch]
        t3=Table(data5,colWidths=(12*mm, None,  50*mm, 10*mm, None, None, None, None))
        t3.setStyle(TableStyle([('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),black),('ALIGN',(0,0),(-1,-1),'LEFT'),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))
        # elements.append(t2)
        elements.append(t3)
    else:
        data5 = []
        priceFormat = 'Unit price in CHF'
        amountFormat = 'Amount in CHF'

        p101_01 =Paragraph("<para fontSize=8>Sl. no</para>",styles['Normal'])
        p101_02 =Paragraph("<para fontSize=8>Part Number</para>",styles['Normal'])
        p101_03 =Paragraph("<para fontSize=8>Part Desc</para>",styles['Normal'])
        # p101_07 =Paragraph("<para fontSize=8>Weight</para>",styles['Normal'])
        p101_04 =Paragraph("<para fontSize=8>Qty</para>",styles['Normal'])
        p101_05 =Paragraph("<para fontSize=8>{0}</para>".format(priceFormat),styles['Normal'])
        p101_06 =Paragraph("<para fontSize=8>{0}</para>".format(amountFormat),styles['Normal'])

        data5+=[[p101_01,p101_02,p101_03,p101_04,p101_05,p101_06]]
        # t5=Table(data5,colWidths=(10*mm,None,  None, None, None, None,None))
        # t5.hAlign = 'LEFT'
        # t5.setStyle(TableStyle([('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),black),('ALIGN',(0,0),(-1,-1),'LEFT'),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))
        # elements.append(t5)
        grandTotal = 0
        data2 = []
        id=0
        grandtotWeight = 0
        for i in purchaselist:
            id+=1
            part_no = i.products.part_no
            desc = i.products.description_1
            weight = i.products.weight
            basicprice = i.price
            pricesum = round((((i.price*project.profitMargin)/100)+i.price),2)
            price = round((pricesum * multNumber),2)
            qty = i.quantity1
            amnt = round((price * qty),2)
            if weight is not None:
                totweight = round((i.products.weight * qty),2)
                grandtotWeight+=totweight
            grandTotal +=amnt

            p12_01 = Paragraph("<para fontSize=8>{0}</para>".format(id),styles['Normal'])
            p12_02 =Paragraph("<para fontSize=8>{0}</para>".format(part_no),styles['Normal'])
            p12_03 =Paragraph("<para fontSize=8>{0}</para>".format(smart_str(desc)),styles['Normal'])
            # if weight is not None:
            #     p12_07 =Paragraph("<para fontSize=8>{0}</para>".format(round(weight,2)),styles['Normal'])
            # else:
            #     p12_07 =Paragraph("<para fontSize=8>{0}</para>".format(weight),styles['Normal'])
            # p12_07 =Paragraph("<para fontSize=8>{0}</para>".format(round(weight,2)),styles['Normal'])
            p12_04 =Paragraph("<para fontSize=8>{0}</para>".format(qty),styles['Normal'])
            p12_05 =Paragraph("<para fontSize=8> {:,}</para>".format(round(price,2)),style_right)
            p12_06 =Paragraph("<para fontSize=8>{:,}</para>".format(amnt),style_right)
            data5.append([p12_01,p12_02,p12_03,p12_04,p12_05,p12_06])
            # t2=Table(data2,colWidths=(10*mm,None,  None, None, None, None,None))
            # t2.hAlign = 'LEFT'
            # t2.setStyle(TableStyle([('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),black),('ALIGN',(0,0),(-1,-1),'LEFT'),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))
        grandTotal = round(grandTotal,2)
        p13_01 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
        p13_02 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
        p13_03 =Paragraph("<para fontSize=8></para>",styles['Normal'])
        p13_07 =Paragraph("<para fontSize=8></para>",styles['Normal'])
        p13_04 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
        p13_05 =Paragraph("<para fontSize=8>Total in CHF</para>",styles['Normal'])
        p13_06 =Paragraph("<para fontSize=8>{:,}</para>".format(round(grandTotal,2)),style_right)
        # p13_06 =Paragraph(str(grandTotal),styles['Normal'])

        data5+=[[p13_01,p13_02,p13_03,p13_04,p13_05,p13_06]]
        t3=Table(data5,colWidths=(10*mm,None,  60*mm, 10*mm, None, None))
        t3.hAlign = 'LEFT'
        t3.setStyle(TableStyle([('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),black),('ALIGN',(0,0),(-1,-1),'LEFT'),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))

            # elements.append(t2)
        elements.append(t3)

    elements.append(Spacer(1,16))
    p14_01 =Paragraph("<para fontSize=8>QUOTATION VALIDITY</para>",styles['Normal'])
    p14_02 =Paragraph("<para fontSize=8>INCO TERMS</para>",styles['Normal'])
    p14_03 =Paragraph("<para fontSize=8>DELIVERY</para>",styles['Normal'])
    p14_04 =Paragraph("<para fontSize=8>PAYMENT TERMS</para>",styles['Normal'])
    data6=[[p14_01,p14_02,p14_03,p14_04]]
    # t6=Table(data6)
    # t6.hAlign = 'LEFT'
    # t6.setStyle(TableStyle([('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),black),('ALIGN',(0,0),(-1,-1),'LEFT'),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))
    # elements.append(t6)

    # if typ == 'CHF':
    #     incodetails = format(project.terms)
    # else:
    #     incodetails = "EX-WORKS, BRUDERER India"
    # paymentterms1 = str(project.paymentTerms)

    p15_01 =Paragraph("<para fontSize=8>{0}</para>".format(project.quoteValidity),styles['Normal'])
    p15_02 =Paragraph("<para fontSize=8>{0}</para>".format(project.terms),styles['Normal'])
    p15_03 =Paragraph("<para fontSize=8>{0}</para>".format(project.delivery),styles['Normal'])
    p15_04 =Paragraph("<para fontSize=8>{0}</para>".format(project.paymentTerms),styles['Normal'])
    data6+=[[p15_01,p15_02,p15_03,p15_04]]
    t6=Table(data6)
    t6.hAlign = 'LEFT'
    t6.setStyle(TableStyle([('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),black),('ALIGN',(0,0),(-1,-1),'LEFT'),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))
    elements.append(t6)

    elements.append(Spacer(1,8))
    if typ == 'INR':
        p16_02 =Paragraph("<para fontSize=8>BANK DETAILS</para>",styles['Normal'])
        data8=[[p16_02]]
        p17_01 =Paragraph("<para fontSize=8>IDBI Bank Ltd<br/>Whitefield Branch<br/>Bangalore 560 066, Karnataka<br/>Account No. 1545102000003858 <br/>IFSC Code : IBKL0001545</para>",styles['Normal'])
        data8 +=[[p17_01]]
        t9=Table(data8,6*[3*inch])
        t9.hAlign = 'LEFT'
        t9.setStyle(TableStyle([('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),black),('ALIGN',(0,0),(-1,-1),'LEFT'),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))
        elements.append(t9)
        elements.append(Spacer(1,8))
        p77_01 =Paragraph("<para fontSize=8>PAN NO. </para>",styles['Normal'])
        p77_02 =Paragraph("<para fontSize=8>GST NO. </para>",styles['Normal'])

        data8=[[p77_01,p77_02]]
        p78_01 =Paragraph("<para fontSize=8>AABCB6326Q</para>",styles['Normal'])
        p78_01 =Paragraph("<para fontSize=8>AABCB6326Q</para>",styles['Normal'])
        data8 +=[[p78_01,p78_01]]
        t9=Table(data8,6*[1.5*inch])
        t9.hAlign = 'LEFT'
        t9.setStyle(TableStyle([('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),black),('ALIGN',(0,0),(-1,-1),'LEFT'),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))
        elements.append(t9)
        elements.append(Spacer(1,8))
        elements.append(Paragraph("<para fontSize=8>Notes:</para>",styles['Normal']))
        try:
            datanotes = project.poNotes.replace('\n', '<br />')
        except:
            datanotes = project.poNotes
        elements.append(Paragraph("<para fontSize=8>{0} </para>".format(datanotes),styles['Normal']))
        # elements.append(Paragraph("<para fontSize=8> 1. Indicate your GST number, HSN Code and PAN number in your PO. </para>",styles['Normal']))
        # elements.append(Paragraph("<para fontSize=8> 2. Indicate our Quote ref in your PO. </para>",styles['Normal']))
        # elements.append(Paragraph("<para fontSize=8> 3. Freight & Insurance  : To be organised by buyer </para>",styles['Normal']))
        # elements.append(Paragraph("<para fontSize=8> 4. Freight & Insurance  : To be organised by buyer </para>",styles['Normal']))
        # elements.append(Paragraph("<para fontSize=8> 5. P & F  : Extra </para>",styles['Normal']))
        # elements.append(Paragraph("<para fontSize=8> 6.Warranty :Twelve months - Only on spares fixed by Burderer India engineer</para>",styles['Normal']))
        elements.append(Spacer(1,8))


    else:
        p16_01 =Paragraph("<para fontSize=8>PO to raised on</para>",styles['Normal'])
        p16_02 =Paragraph("<para fontSize=8>BANK DETAILS</para>",styles['Normal'])
        data8=[[p16_01,p16_02]]
        t8=Table(data8,6*[1.4*inch],1*[0.2*inch])
        t8.hAlign = 'LEFT'
        t8.setStyle(TableStyle([('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),black),('ALIGN',(0,0),(-1,-1),'LEFT'),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))
        elements.append(t8)

        p17_01 =Paragraph("<para fontSize=8><b>BRUDERER AG</b><br/>Stanzautomaten<br/>Egnacherstrasse<br/>9320 FRASNACHT <br/>SWITZERLAND</para>",styles['Normal'])
        p17_02 =Paragraph("<para fontSize=8></para>",styles['Normal'])
        data9=[[p17_01,p17_02]]
        t9=Table(data9,6*[1.4*inch],1*[0.9*inch])
        t9.hAlign = 'LEFT'
        t9.setStyle(TableStyle([('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),black),('ALIGN',(0,0),(-1,-1),'LEFT'),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))
        elements.append(t9)

        elements.append(Spacer(1,8))

        elements.append(Paragraph("<para fontSize=8>Notes:</para>",styles['Normal']))
        try:
            datanotes = project.poNotes.replace('\n', '<br />')
        except:
            datanotes = project.poNotes
        elements.append(Paragraph("<para fontSize=8>{0} </para>".format(datanotes),styles['Normal']))
        # elements.append(Paragraph("<para fontSize=8> 2. P & F  : Extra </para>",styles['Normal']))
        # elements.append(Paragraph("<para fontSize=8> 3.Warranty :Twelve months - Only on spares fixed by Burderer India engineer</para>",styles['Normal']))
        elements.append(Spacer(1,8))

    if typ != 'Invoice':
        elements.append(Paragraph("<para fontSize=8>We hope that this quotation will meet your requirement and would be glad to receive your firm order. For further information please do not hesitate to cotnact us any time. </para>",styles['Normal']))
        elements.append(Spacer(1,8))
    elements.append(Spacer(1,8))
    elements.append(Paragraph("<para fontSize=8>For BRUDERER PRESSES INDIA PVT LTD.,</para>",styles['Normal']))
    elements.append(Spacer(1,8))
    elements.append(Paragraph("<para fontSize=8>Authorised Signatory.</para>",styles['Normal']))

    doc.build(elements)

def grn(response , project , purchaselist , request):

    styles = getSampleStyleSheet()
    doc = SimpleDocTemplate(response,pagesize=letter, topMargin=0.2*cm,leftMargin=0.1*cm,rightMargin=0.1*cm)
    doc.request = request
    elements = []

    p1 = Paragraph("<para alignment='center'fontSize=15  ><b> Goods Received Note </b></para>",styles['Normal'])
    elements.append(p1)
    elements.append(Spacer(1, 10))
    # p2 = Paragraph("<para fontSize=10 ><b> {0} </b></para>".format(project.vendor.name),styles['Normal'])
    # p3 = Paragraph("<para fontSize=8  >{0}</para>".format(project.vendor.street),styles['Normal'])
    # p4 =  Paragraph("<para fontSize=8 >{0}</para>".format(project.vendor.city),styles['Normal'])
    # p5 = Paragraph("<para fontSize=8 >{0}</para>".format(project.vendor.pincode),styles['Normal'])
    # p6 = Paragraph("<para fontSize=8 >{0} - {1}</para>".format(project.vendor.state, project.vendor.country),styles['Normal'])
    #
    # elements.append(Spacer(1, 10))
    # elements.append(p2)
    # elements.append(p3)
    # elements.append(p4)
    # elements.append(p5)
    # elements.append(p6)

    addrdetails = Paragraph("""
    <para >
    <b>%s</b><br/>
    %s %s - %s<br/>
    %s - %s<br/>
    </para>
    """ %(project.vendor.name ,project.vendor.street,project.vendor.city,project.vendor.pincode,project.vendor.state,project.vendor.country),styles['Normal'])
    td=[[addrdetails]]
    t=Table(td,colWidths=[4*inch])
    t.hAlign = 'LEFT'
    elements.append(t)

    elements.append(Spacer(1,10))

    details = Paragraph("""
    <para >
    <b>Project Title - </b>%s<br/>
    <b>Comm nr - </b>%s <br/>
    <b>PO ref no - </b>%s<br/>
    </para>
    """ %(project.title,project.comm_nr ,project.poNumber),styles['Normal'])
    td=[[details]]
    t=Table(td,colWidths=[4*inch])
    t.hAlign = 'LEFT'
    elements.append(t)

    # p7_01 =Paragraph("<para fontSize=8>Name</para>",styles['Normal'])
    # p7_02 =Paragraph("<para fontSize=8>{0}</para>".format(project.title),styles['Normal'])
    # p7_03 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
    # p7_04 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
    #
    # p8_01 =Paragraph("<para fontSize=8>Date</para>",styles['Normal'])
    # p8_02 =Paragraph("<para fontSize=8>{0}</para>".format(project.approved2_date),styles['Normal'])
    # p8_03 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
    # p8_04 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
    #
    # data1=[[p7_01,p7_02,p7_03,p7_04],[p8_01,p8_02,p8_03,p8_04]]
    # t1=Table(data1,4*[2.1*inch],2*[0.2*inch])
    # elements.append(t1)
    # elements.append(Spacer(1,10))
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
        try:
            if 'typ' in request.GET:
                currencyTyp = request.GET['typ']
                if currencyTyp == 'INR':
                    multNumber = float(project.exRate)
                    # if request.GET['exRate'] =='':
                    #     print project.exRate,'aaaaaaaaaaaaa'
                    #     multNumber = int(project.exRate)
                    # else:
                    #     multNumber = int(request.GET['exRate'])
                else:
                    multNumber = 1
                    currencyTyp = request.GET['typ']
            else:
                multNumber = 1
                currencyTyp = request.GET['typ']
        except:
            multNumber = 1
            currencyTyp = ''

        print multNumber,'aaaaaaaaaaaaa'
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment;filename="PurchaseOrderdownload.pdf"'
        purchaseOrder(response , project , purchaselist,multNumber,currencyTyp, request)
        return response

class GetLandingAPIView(APIView):
    def get(self , request , format = None):
        project = Projects.objects.get(pk = request.GET['project'])
        purchaselist = BoM.objects.filter(project = request.GET['project'])
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment;filename="Landingdownload.pdf"'
        landingDetails(response , project , purchaselist, request)
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
        try:
            if 'typ' in request.GET:
                currencyTyp = request.GET['typ']
                if currencyTyp == 'INR':
                    multNumber = float(project.exRate)
                    # if request.GET['exRate'] =='':
                    #     print project.exRate,'aaaaaaaaaaaaa'
                    #     multNumber = int(project.exRate)
                    # else:
                    #     multNumber = int(request.GET['exRate'])
                else:
                    multNumber = 1
                    currencyTyp = request.GET['typ']
            else:
                multNumber = 1
                currencyTyp = request.GET['typ']
        except:
            multNumber = 1
            currencyTyp = ''

        print multNumber,'aaaaaaaaaaaaa'

        purchaselist = BoM.objects.filter(project = request.GET['project'])
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment;filename="Quotationdownload.pdf"'
        quotation(response , project , purchaselist  ,multNumber,currencyTyp,request)
        return response
from reportlab.platypus.flowables import HRFlowable

def materialIssued(response , value ,projectPk, request):
    if value !='':
        invdata = MaterialIssueMain.objects.get(pk = request.GET['value'])
    elif projectPk!='':
        data = MaterialIssueMain.objects.filter(project__id = request.GET['projectPk'])
        invdata = data[0]

    styles = getSampleStyleSheet()
    style_right = ParagraphStyle(name='right', parent=styles['Normal'], alignment=TA_RIGHT)
    doc = SimpleDocTemplate(response,pagesize=letter, topMargin=0.2*cm,leftMargin=0.1*cm,rightMargin=0.1*cm)
    doc.request = request
    elements = []

    p1 = Paragraph("<para alignment='center' fontSize=15  ><b> MATERIAL ISSUE NOTE </b></para>",styles['Normal'])

    elements.append(p1)
    elements.append(Spacer(1,15))
    cuss_no = invdata.project.comm_nr
    projecttitle =invdata.project.title
    customer =invdata.project.service.name
    dated = invdata.created.date()
    p0_01 =Paragraph("<para fontSize=10>Comm nr</para>",styles['Normal'])
    p0_02 =Paragraph(str(cuss_no),styles['Normal'])

    p1_01 =Paragraph("<para fontSize=10>Project title</para>",styles['Normal'])
    p1_02 =Paragraph(str(projecttitle),styles['Normal'])

    p2_01 =Paragraph("<para fontSize=10>Customer</para>",styles['Normal'])
    p2_02 =Paragraph(str(customer),styles['Normal'])

    p3_01 =Paragraph("<para fontSize=10>Date of issue</para>",styles['Normal'])
    p3_02 =Paragraph(str(dated),styles['Normal'])



    data1=[[p0_01,p0_02],[p1_01,p1_02],[p2_01,p2_02],[p3_01,p3_02]]
    rheights=4*[0.2*inch] #[1.1*inch,1.1*inch]
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
    if value !='':
        for i in list(invdata.materialIssue.values()):
            product = Products.objects.get(pk = i['product_id'])
            partno = product.part_no
            description = product.description_1
            qty = i['qty']
            qdata = qty
            price = i['price']
            pdata = price
            total = qty*price
            tdata = total
            grandtotal+=total
            gtotal = grandtotal
            p6_01 =Paragraph(partno,styles['Normal'])
            p6_02 =Paragraph(description,styles['Normal'])
            p6_03 =Paragraph("{:,}".format(qdata),styles['Normal'])
            p6_04 =Paragraph("{:,}".format(round(pdata,2)),style_right)
            p6_05 =Paragraph("{:,}".format(round(tdata,2)),style_right)
            data2+=[[p6_01,p6_02,p6_03,p6_04,p6_05]]
    else:
        print data,'aaaaaaaaaaaaaaaa'
        for i in data:
            print i.materialIssue,'aaaaaaaaaaaaaaaaafffffffffffff'
            for j in list(i.materialIssue.values()):
                product = Products.objects.get(pk = j['product_id'])
                partno = product.part_no
                description = product.description_1
                qty = j['qty']
                qdata = qty
                price = j['price']
                pdata = price
                total = qty*price
                tdata = total
                grandtotal+=total
                gtotal = grandtotal
                p6_01 =Paragraph(partno,styles['Normal'])
                p6_02 =Paragraph(description,styles['Normal'])
                p6_03 =Paragraph("{:,}".format(qdata),styles['Normal'])
                p6_04 =Paragraph("{:,}".format(round(pdata,2)),style_right)
                p6_05 =Paragraph("{:,}".format(round(tdata,2)),style_right)
                data2+=[[p6_01,p6_02,p6_03,p6_04,p6_05]]

            # for j in list(invdata[i].materialIssue):
            #     product = Products.objects.get(pk = j['product_id'])
            #     partno = product.part_no
            #     description = product.description_1
            #     qty = j['qty']
            #     qdata = str(qty)
            #     price = j['price']
            #     pdata = str(price)
            #     total = qty*price
            #     tdata = str(total)
            #     grandtotal+=total
            #     gtotal = str(grandtotal)
            #     p6_01 =Paragraph(partno,styles['Normal'])
            #     p6_02 =Paragraph(description,styles['Normal'])
            #     p6_03 =Paragraph(qdata,styles['Normal'])
            #     p6_04 =Paragraph(pdata,styles['Normal'])
            #     p6_05 =Paragraph(tdata,styles['Normal'])
            #     data2+=[[p6_01,p6_02,p6_03,p6_04,p6_05]]

    p7_01 =Paragraph("<para fontSize=8 ></para>",styles['Normal'])
    p7_02 =Paragraph("<para fontSize=8 ></para>",styles['Normal'])
    p7_03 =Paragraph("<para fontSize=8 ></para>",styles['Normal'])
    p7_04 =Paragraph("<para fontSize=8 ><b>Total</b></para>",style_right)
    p7_05 =Paragraph("{:,}".format(round(gtotal,2)),style_right)
    data2+=[[p7_01,p7_02,p7_03,p7_04,p7_05]]

    rheight=0.4*inch #[1.1*inch,1.1*inch]
    cwidth=1.6*inch,3*inch,0.4*inch,1.6*inch,1.8*inch
    t2=Table(data2,rowHeights=rheight,colWidths=cwidth)
    t2.setStyle(TableStyle([('ALIGN',(0,0),(-1,-1),'CENTER'),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))
    elements.append(t2)
    doc.build(elements)








class InventoryViewSet(viewsets.ModelViewSet):
    permissions_classes  = (permissions.AllowAny , )
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['product',]

class MaterialIssueViewSet(viewsets.ModelViewSet):
    permissions_classes  = (permissions.AllowAny , )
    queryset = MaterialIssue.objects.all()
    serializer_class = MaterialIssueSerializer
    # filter_backends = [DjangoFilterBackend]
    # filter_fields = ['products','project']

class MaterialIssueMainViewSet(viewsets.ModelViewSet):
    permissions_classes  = (permissions.AllowAny , )
    queryset = MaterialIssueMain.objects.all()
    serializer_class = MaterialIssueMainSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['project','created']
    # def get_queryset(self):
    #     if 'search' in self.request.GET:
    #         return MaterialIssueMain.objects.filter(project__title__icontains=self.request.GET['search'])
    #     else:
    #         return MaterialIssueMain.objects.all()


class MaterialIssuedNoteAPIView(APIView):
    def get(self , request , format = None):
        if 'value' in request.GET:
            value = request.GET['value']
        else:
            value = ''
        if 'projectPk' in request.GET:
            projectPk = request.GET['projectPk']
        else:
            projectPk = ''

        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment;filename="Quotationdownload.pdf"'
        materialIssued(response , value , projectPk,request)
        return response

class ProductInventoryAPIView(APIView):
    renderer_classes = (JSONRenderer,)
    def get(self , request , format = None):
        total = 0
        toReturn = []
        if 'search' in request.GET:
            productlist = Inventory.objects.filter( Q(product__part_no__icontains=request.GET['search']) | Q(product__description_1__icontains=request.GET['search']))
        else:
            productlist = Inventory.objects.all()
        productsList = list(productlist.values('product').distinct().values('product__pk','product__description_1','product__part_no','product__description_2','product__weight','product__price','product__bar_code'))
        for i in productsList:
            totalprice = 0
            totalqty = 0
            totalVal =0
            totalSum = 0
            data = list(productlist.filter(product=i['product__pk']).values())
            for k in data:
                print k['rate'] ,k['qty']
                print type(k['rate']) ,type(k['qty'])
                if k['rate']:
                    rt = k['rate']
                else:
                    rt = 0
                if k['qty']:
                    qt = k['qty']
                else:
                    qt = 0
                if qt>0:
                    totalVal = rt * qt
                    totalprice += rt
                    totalqty += qt
                    totalSum+=totalVal
            toReturn.append({'productPk':i['product__pk'],'productDesc':i['product__description_1'],'productPartno':i['product__part_no'],'productDesc2':i['product__description_2'],'productBarCode':i['product__bar_code'],'weight':i['product__weight'],'price':i['product__price'],'data':data,'totalprice':totalprice,'totalqty':totalqty,'totalVal':totalSum})
            total+=totalSum
        if 'offset' in request.GET:
            offset = int(request.GET['offset'])
            limit = offset + int(request.GET['limit'])
            print offset,limit
            returnData ={'data' :toReturn[offset : limit],'total':total }
        else:
            returnData ={'data' :toReturn,'total':total }
            print returnData,'aaaaaaaaa'
        return Response(returnData,status=status.HTTP_200_OK)


def stock(response, request):
    print 'aaaaaaaaaaa'
    styles = getSampleStyleSheet()
    doc = SimpleDocTemplate(response,pagesize=letter, topMargin=0.2*cm,leftMargin=0.1*cm,rightMargin=0.1*cm)
    doc.request = request
    elements = []
    elements.append(Spacer(1,30))
    logo = svg2rlg(os.path.join(globalSettings.BASE_DIR , 'static_shared','images' , 'Bruderer_Logo_svg.svg'))
    sx=sy=0.1
    logo.width,logo.height = logo.minWidth()*sx, logo.height*sy
    logo.scale(sx,sy)
    elements.append(logo)
    elements.append(Spacer(1,10))
    drawing = svg2rlg(os.path.join(globalSettings.BASE_DIR , 'static_shared','images' , 'anchor_icon.svg'))
    productlist = Inventory.objects.all()
    productsList = list(productlist.values('product').distinct().values('product__pk','product__description_1','product__part_no','product__description_2','product__weight','product__price','product__bar_code'))
    toReturn=[]
    for i in productsList:
        data = list(productlist.filter(product=i['product__pk']).values())
        toReturn.append({'productPk':i['product__pk'],'productDesc':i['product__description_1'],'productPartno':i['product__part_no'],'productDesc2':i['product__description_2'],'productBarCode':i['product__bar_code'],'weight':i['product__weight'],'price':i['product__price'],'data':data})

    headerDetails = Paragraph("""
    <para leftIndent = 10>
    <font size ='14'>
    <b> STOCK DETAILS</b><br/>
    </font></para>
    """ %(),styles['Normal'])
    tdheader=[[headerDetails]]
    theader=Table(tdheader,colWidths=[3*inch])
    theader.hAlign = 'LEFT'
    elements.append(theader)
    elements.append(Spacer(1,10))
    data = []
    p1 =Paragraph("<para fontSize=8><b>Part No</b> </para>",styles['Normal'])
    p2 =Paragraph("<para fontSize=8><b>Description</b></para>",styles['Normal'])
    p3 =Paragraph("<para fontSize=8><b>Quantity</b></para>",styles['Normal'])
    p4 =Paragraph("<para fontSize=8><b>Price</b></para>",styles['Normal'])
    p5 =Paragraph("<para fontSize=8><b>Total</b></para>",styles['Normal'])
    data += [[p1,p2,p3,p4,p5]]
    for a in toReturn:
            p01 =Paragraph("<para fontSize=8>{0} </para>".format(a['productPartno']),styles['Normal'])
            p02 =Paragraph("<para fontSize=8>{0}</para>".format(smart_str(a['productDesc'])),styles['Normal'])
            # qty = []
            # price=[]
            # for d in a['data']:
            #     if d['qty']>0:
            #         qty.append(d['qty'])
            #         price.append(d['rate'])
            # if len(qty)>0:
            #     qty = qty
            # else:
            #     qty = 0
            # if len(price)>0:
            #     price = price
            # else:
            #     price = 0
            datasmall = []
            qdata = []
            rdata = []
            tdata = []
            for d in a['data']:
                if d['qty']>0:
                    qty = Paragraph("""
                    <para>
                    <font size ='8'>
                    %s\n
                    </font>
                    </para>
                    """ %(d['qty']),styles['Normal'])
                    tdheader=[[qty]]
                    theader=Table(tdheader)
                    qdata.append(theader)
                    price = Paragraph("""
                    <para >
                    <font size ='8'>
                    %s\n
                    </font>
                    </para>
                    """ %(round(d['rate'],2)),styles['Normal'])
                    trateheader=[[price]]
                    trateheader=Table(trateheader)
                    rdata.append(trateheader)
                    totalVal = 0
                    totalVal = d['qty'] * d['rate']
                    total = Paragraph("""
                    <para >
                    <font size ='8'>
                    %s\n
                    </font>
                    </para>
                    """ %(round(totalVal,2)),styles['Normal'])
                    ttotalheader=[[total]]
                    ttotalheader=Table(ttotalheader)
                    tdata.append(ttotalheader)
            if len(qdata) > 0:
                p03 =qdata
            else:
                p03 = Paragraph("<para><font size ='8'>&nbsp;&nbsp; 0 </font> </para>",styles['Normal'])
            if len(rdata) > 0:
                p04 =rdata
            else:
                p04 = Paragraph("<para><font size ='8'>&nbsp;&nbsp; 0 </font> </para>",styles['Normal'])
            if len(tdata) > 0:
                p05 = tdata
            else:
                p05 = Paragraph("<para><font size ='8'>&nbsp;&nbsp; 0 </font> </para>",styles['Normal'])


            data.append([p01,p02,p03,p04,p05])

    t=Table(data,colWidths=(40*mm,35*mm,  35*mm, 35*mm, 35*mm))
    t.setStyle(TableStyle([('ALIGN',(0,0),(-1,-1),'CENTER'),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))
    # t.hAlign = 'LEFT'
    # t.setStyle(TableStyle([('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),black),('ALIGN',(0,0),(-1,-1),'RIGHT'),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))
    elements.append(t)
    doc.build(elements)


class StockDownloadAPIView(APIView):
    def get(self , request , format = None):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment;filename="inventory.pdf"'
        stock(response, request)
        return response

import json, ast
class OrderAPIView(APIView):
    renderer_classes = (JSONRenderer,)
    def post(self , request , format = None):
        print request.data["user"],'hhhhhhhhh'
        user =  User.objects.get(pk=request.data["user"])
        project = Projects.objects.get(pk=request.data["project"])
        if type(request.data["products"])==unicode:
            prodList = ast.literal_eval(request.data["products"])
        else:
            prodList = request.data["products"]
        orderlist =[]
        for i in prodList:
            prodListQty = i['prodQty']
            invlist = Inventory.objects.filter(product=i['pk'])
            listData = []
            stockList = []
            price = 0
            totalqty = 0
            prodListTot = 0
            for j in invlist:
                totalqty += j.qty
                print totalqty,'aaaaaaaaaaa'
                if prodListQty>totalqty:
                    prodListTot = totalqty
                else:
                    prodListTot = prodListQty
            prodListQty = prodListTot
            if prodListQty!=0:
                for p in invlist:
                    if p.qty>0:
                            if prodListQty>p.qty:
                                stockList.append({'part_no':p.product.part_no,'qty': p.qty,'inventory':p.pk,'project':p.project.pk,'savedqty':p.addedqty,'product':p.product.pk,'addedqty':p.qty,'comm_nr':p.project.comm_nr})
                                prodListQty = prodListQty - p.qty
                                p.qty = 0
                                p.save()
                            elif prodListQty<p.qty:
                                stockList.append({'part_no':p.product.part_no,'qty': p.qty,'inventory':p.pk,'project':p.project.pk,'savedqty':p.addedqty,'product':p.product.pk,'addedqty':prodListQty,'comm_nr':p.project.comm_nr})
                                p.qty = p.qty - prodListQty
                                prodListQty = 0
                                p.save()
                            elif prodListQty==p.qty:
                                stockList.append({'part_no':p.product.part_no,'qty': p.qty,'inventory':p.pk,'project':p.project.pk,'savedqty':p.addedqty,'product':p.product.pk,'addedqty':prodListQty,'comm_nr':p.project.comm_nr})
                                prodListQty = prodListQty - p.qty
                                print prodListQty
                                prodListQty = 0
                                p.qty = 0
                                p.save()
                            if p.rate>=price:
                                price = p.rate
                            else:
                                price=price

            if prodListQty==0:
                data = {
                'qty': prodListTot,
                'product' :Products.objects.get(pk=i['pk']),
                'price' : price,
                'stock': stockList
                }
                prodListQty = 0
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
            print materialIssueObj,'aaaaaaaaa'

        return Response(materialIssueObj.pk,status=status.HTTP_200_OK)


import requests
class EmailApi(APIView):
    permission_classes = (permissions.AllowAny ,)
    def post(self, request, format=None):
        email=[]
        projectPk = request.data['pkValue']
        link = request.data['link']
        linkUrl = link['origin'] + '/login?next=/approve/?project=' + str(projectPk)
        project = Projects.objects.get(pk=projectPk)
        productDetails = BoM.objects.filter(project__id = projectPk)
        totalprice = 0
        totalqty = 0
        totalcustomerPrice = 0
        for i in productDetails:
            totalprice+=i.price
            totalqty+=i.quantity1
            totalcustomerPrice+=i.landed_price
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

        packing =0
        insurance =0
        freight =0
        assessableValue =0
        gst1 =0
        gst2 =0
        clearingCharges1 =0
        clearingCharges2 =0

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
        project.invoiceValue = invoiceValue
        if packing > 0:
            packingPer = round((float(packing) / float(invoiceValue))*100, 2)
        else:
            packingPer = 0
        project.packing = float(packing)
        if insurance > 0:
            insurancePer = round((float(insurance) / float(invoiceValue))*100, 2)
        else:
            insurancePer = 0
        project.insurance = insurance
        if freight > 0:
            freightPer = round((float(freight) / float(invoiceValue))*100, 2)
        else:
            freightPer = 0
        project.freight =  freight
        if assessableValue > 0:
            assessableValuePer = round((float(assessableValue) / float(invoiceValue))*100, 2)
        else:
            assessableValuePer = 0
        project.assessableValue = assessableValue
        if gst1 > 0:
            gst1Per = round((float(gst1) / float(invoiceValue))*100, 2)
        else:
            gst1Per = 0
        project.gst1 = gst1
        if gst2 > 0:
            gst2Per = round((float(gst2) / float(invoiceValue))*100, 2)
        else:
            gst2Per = 0
        project.gst2 = gst2
        if clearingCharges1 > 0:
            clearingCharges1Per = round((float(clearingCharges1) / float(invoiceValue))*100, 2)
        else:
            clearingCharges1Per = 0
        project.clearingCharges1 = clearingCharges1
        if clearingCharges2 > 0:
            clearingCharges2Per = round((float(clearingCharges2) / float(invoiceValue))*100, 2)
        else:
            clearingCharges2Per = 0
        project.clearingCharges2 = clearingCharges2
        project.save()

        bomData = BoM.objects.filter(project__id=request.data['projectPK'])
        for i in bomData:
            print i.invoice_price,'qqqqqqqqqqqqqq'
            packingTotal = round((float(i.invoice_price)*packingPer)/100, 2)
            insuranceTotal = round((float(i.invoice_price)*insurancePer)/100, 2)
            freightTotal = round((float(i.invoice_price)*freightPer)/100, 2)
            assessableValueTotal = round((float(i.invoice_price)*assessableValuePer)/100, 2)
            gst1Total = round((float(i.invoice_price)*gst1Per)/100, 2)
            gst2Total = round((float(i.invoice_price)*gst2Per)/100, 2)
            clearingCharges1Total = round((float(i.invoice_price)*clearingCharges1Per)/100, 2)
            clearingCharges2Total = round((float(i.invoice_price)*clearingCharges2Per)/100, 2)
            total = packingTotal + insuranceTotal + freightTotal + assessableValueTotal + gst1Total + gst2Total + clearingCharges1Total + clearingCharges2Total
            i.landed_price = round(total + i.invoice_price,2)
            i.save()
            print i.landed_price,'ggggggggggggggggg'
        return Response(status = status.HTTP_200_OK)

class GetMaterialAPIView(APIView):
    renderer_classes = (JSONRenderer,)
    def get(self , request , format = None):
        toReturn = []
        print  request.GET
        if 'search' in request.GET:
            materialList = MaterialIssueMain.objects.filter( Q(project__title__icontains=request.GET['search']))
        else:
            materialList = MaterialIssueMain.objects.all()
        materialsList = list(materialList.values('project').distinct().values('project__pk','project__title','project__comm_nr'))

        for i in materialsList:
            datamaterial = list(materialList.filter(project=i['project__pk']))
            totalVal = 0
            total = 0
            lisData = []
            for k in datamaterial:
                print k.project.title
                data = list(k.materialIssue.values())
                for m in data:
                    price=m['price']
                    print price,'priccceee'
                    qty=m['qty']
                    print qty,'qtttyyyyy'
                    total=price*qty
                    print total,'ttoootttaaalll'
                    totalVal+=total
                    lisData.append(m)
                tot=round(totalVal,2)
                print tot,'grrandtoott'
            toReturn.append({'projectPk':i['project__pk'],'projectTittle':i['project__title'],'projectComm':i['project__comm_nr'],'data':lisData,'totalprice':tot})

        if 'offset' in request.GET:
            offset = int(request.GET['offset'])
            limit = offset + int(request.GET['limit'])
            returnData =toReturn[offset : limit]
        else:
            returnData =toReturn
        return Response(returnData,status=status.HTTP_200_OK)



from django.http import HttpResponse
from openpyxl import Workbook
from openpyxl.writer.excel import save_virtual_workbook
# class DownloadProjectSCExcelReponse(APIView):
#     permission_classes = (permissions.IsAuthenticated,)
#     def get(self , request , format = None):
#         workbook = Workbook()
#         projectObj = Projects.objects.filter(Q(status='approved')|Q(status='ongoing'),savedStatus=False,junkStatus=False)
#         projectsObj = list(projectObj.values('comm_nr').distinct())
#         sendData =[]
#         for idx,p in enumerate(projectsObj):
#             if idx==0:
#                 Sheet1 = workbook.active
#                 Sheet1.title = p['comm_nr']
#             if idx>0:
#                 Sheet1 = workbook.create_sheet(p['comm_nr'])
#             Sheet1.append(["Supplier", "Part No",'Description','Qty','Landed Cost','Stock Consumed'])
#             projData = projectObj.filter(comm_nr__exact=p['comm_nr'])
#             print projData
#             for i in projData:
#                 toReturn =[]
#                 bomObj=BoM.objects.filter(project__id=i.pk)
#                 materialObj=MaterialIssueMain.objects.filter(project__id=i.pk)
#                 for k in materialObj:
#                         materialdata= k.materialIssue.all()
#                         for m in materialdata:
#                             qtyOrdered = 0
#                             stockConsumed=0
#                             for j in bomObj:
#                                 if m.product_id==j.products.pk:
#                                     qtyOrdered = j.quantity1
#                                     stockConsumed =m.qty
#                                 else:
#                                     stockConsumed=m.qty
#                             Sheet1.append([i.vendor.name, m.product.part_no,m.product.description_1,qtyOrdered,m.price,stockConsumed])
#         response = HttpResponse(content=save_virtual_workbook(workbook),content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
#         response['Content-Disposition'] = 'attachment; filename=stockConsumed.xlsx'
#         return response
import ast
import json
from openpyxl.styles import PatternFill , Font
import string
class DownloadProjectSCExcelReponse(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    def get(self , request , format = None):
        workbook = Workbook()
        projectObj = Projects.objects.filter(Q(status='approved')|Q(status='ongoing'),savedStatus=False,junkStatus=False)
        projectsObj = list(projectObj.values('comm_nr').distinct())
        sendData =[]
        hdFont = Font(size=12,bold=True)
        alphaChars = list(string.ascii_uppercase)
        for idx,p in enumerate(projectsObj):
            if idx==0:
                Sheet1 = workbook.active
                Sheet1.title = p['comm_nr']
            if idx>0:
                Sheet1 = workbook.create_sheet(p['comm_nr'])
            hd = ["Supplier", "Part No",'Description','Qty','Landed Cost','Stock Consumed','Stock Consumed In']
            hdWidth = [10,10,10]
            Sheet1.append(hd)

            for idx,i in enumerate(hd):
                cl = str(alphaChars[idx])+'1'
                Sheet1[cl].fill = PatternFill(start_color="48dce0", end_color="48dce0", fill_type = "solid")
                Sheet1[cl].font = hdFont
                # Sheet1.column_dimensions[str(alphaChars[idx])].width = hdWidth[idx]
            # Sheet1['A1'].fill = PatternFill(start_color="6225c6", end_color="6225c6", fill_type = "solid")
            projData = projectObj.filter(comm_nr__exact=p['comm_nr'])
            # for i in projData:
            bomObj=BoM.objects.filter(project__comm_nr__exact=p['comm_nr'])
            materialObj=MaterialIssueMain.objects.filter(project__comm_nr__exact=p['comm_nr'])
            for j in bomObj:
                listVal = 0
                val = []
                stockConsumed=0
                for k in materialObj:
                    mat = []
                    materialdata= list(k.materialIssue.all().values())
                    for g in materialdata:
                        mat.append(g)
                    for m in k.materialIssue.all():
                        if j.products.pk==m.product.pk:
                            stockConsumed += m.qty
                    inv = Inventory.objects.all()
                for v in inv:
                    # listVal =[]
                    if j.project.pk == v.project.pk and j.products.pk == v.product.pk:
                        materialObjs=MaterialIssueMain.objects.all()
                        for h in materialObjs:
                            matdata = h.materialIssue.all()
                            for e in matdata:
                                stock =  ast.literal_eval(e.stock)
                                for s in stock:
                                    if s['addedqty']>0:
                                        if v.pk==s['inventory']:
                                            if s['comm_nr']!=h.project.comm_nr:
                                                objts = BoM.objects.filter(project__comm_nr__exact=h.project.comm_nr,products__id=j.products.pk)
                                                if len(objts)>0:
                                                    pass
                                                else:
                                                    print 'jjjjjjjjjjjj'
                                                    value = '(quantity : ' + str(s['addedqty']) + ', comm_nr : ' + h.project.comm_nr + ')'
                                                    val.append(value)

                val = json.dumps(val)
                Sheet1.append([j.project.vendor.name, j.products.part_no,j.products.description_1,j.quantity2,j.landed_price,stockConsumed,val])
            Sheet1.append(['', '','','',' ',' ',' '])
            Sheet1.append(['material Issued'])
            Sheet1.append(['Part No','Description','Quantity','consumed From',])
            for d in projData:
                bomObj=BoM.objects.filter(project__id=d.pk)
                materialObj=MaterialIssueMain.objects.filter(project__id=d.pk)
                if len(materialObj)>0:
                    bomObjs = list(bomObj.values())
                    for a in materialObj:
                        for b in a.materialIssue.all():
                            try :
                                bomObj.get(products__id=b.product.pk)
                                pass
                            except:
                                inval = []
                                for u in ast.literal_eval(b.stock):
                                    if u['comm_nr']!=a.project.comm_nr:
                                        if u['addedqty']>0:
                                            invalue = '(quantity : ' + str(u['addedqty']) + ', comm_nr : ' + u['comm_nr'] + ')'
                                            inval.append(invalue)
                                inval = json.dumps(inval)
                                if len(inval)>5:
                                    Sheet1.append([b.product.part_no, b.product.description_1,b.qty,inval])

            Sheet1.column_dimensions['A'].width = 20
            Sheet1.column_dimensions['B'].width = 20
            Sheet1.column_dimensions['C'].width = 40
            Sheet1.column_dimensions['D'].width = 40
            Sheet1.column_dimensions['E'].width = 20
            Sheet1.column_dimensions['F'].width = 30
            Sheet1.column_dimensions['G'].width = 20
            Sheet1.column_dimensions['H'].width = 50
        response = HttpResponse(content=save_virtual_workbook(workbook),content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename=stockConsumed.xlsx'
        return response

# class DownloadProjectSCExcelReponse(APIView):
#     permission_classes = (permissions.IsAuthenticated,)
#     def get(self , request , format = None):
#         workbook = Workbook()
#         projectObj = Projects.objects.filter(Q(status='approved')|Q(status='ongoing'),savedStatus=False,junkStatus=False)
#         projectsObj = list(projectObj.values('comm_nr').distinct())
#         sendData =[]
#         for idx,p in enumerate(projectsObj):
#             if idx==0:
#                 Sheet1 = workbook.active
#                 Sheet1.title = p['comm_nr']
#             if idx>0:
#                 Sheet1 = workbook.create_sheet(p['comm_nr'])
#
#             Sheet1.append(["Supplier","Project", "Part No",'Description','Qty','Landed Cost','Stock Consumed','Stock Consumed by others'])
#             projData = projectObj.filter(comm_nr__exact=p['comm_nr'])
#             for i in projData:
#                 print i,'aaaaaaaa'
#                 bomObj=BoM.objects.filter(project__id=i.pk)
#                 materialObj=MaterialIssueMain.objects.filter(project__id=i.pk)
#                 listVal = 0
#                 val = []
#                 stockConsumed=0
#                 mat = []
#                 for b in bomObj:
#                     for k in materialObj:
#                         materialdata= list(k.materialIssue.all().values())

        #
        # response = HttpResponse(content=save_virtual_workbook(workbook),content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        # response['Content-Disposition'] = 'attachment; filename=stockConsumed.xlsx'
        # return response
#
# class DownloadProjectSCExcelReponse(APIView):
#     permission_classes = (permissions.IsAuthenticated,)
#     def get(self , request , format = None):
#         workbook = Workbook()
#         projectObj = Projects.objects.filter(Q(status='approved')|Q(status='ongoing'),savedStatus=False,junkStatus=False)
#         projectsObj = list(projectObj.values('comm_nr').distinct())
#         sendData =[]
#         for idx,p in enumerate(projectsObj):
#             if idx==0:
#                 Sheet1 = workbook.active
#                 Sheet1.title = p['comm_nr']
#             if idx>0:
#                 Sheet1 = workbook.create_sheet(p['comm_nr'])
#
#             Sheet1.append(["Supplier","Project", "Part No",'Description','Qty','Landed Cost','Stock Consumed','Stock Consumed by others'])
#             projData = projectObj.filter(comm_nr__exact=p['comm_nr'])
#             for i in projData:
#                 bomObj=BoM.objects.filter(project__id=i.pk)
#                 materialObj=MaterialIssueMain.objects.filter(project__id=i.pk)
#
#                 for j in bomObj:
#                     listVal = 0
#                     val = []
#                     stockConsumed=0
#                     for k in materialObj:
#                         mat = []
#                         materialdata= list(k.materialIssue.all().values())
#                         for g in materialdata:
#                             mat.append(g)
#                         # stockConsumed=0
#                         for m in mat:
#                             # print m['product_id'],'lllll',j.products.pk
#                             # print m['stock']
#                             # for so in ast.literal_eval( m['stock']):
#                             #     if so['addedqty'] > 0:
#                             #         if so['comm_nr'] == i.comm_nr:
#                             if m['product_id']==j.products.pk:
#                                 stockConsumed += m['qty']
#                             # else:
#                             #     stockConsumed = 0
#                     inv = Inventory.objects.all()
#                     for v in inv:
#                         # listVal =[]
#                         if j.project.pk == v.project.pk and j.products.pk == v.product.pk:
#                             materialObjs=MaterialIssueMain.objects.all()
#                             for h in materialObjs:
#                                 matdata = h.materialIssue.all()
#                                 for e in matdata:
#                                     stock =  ast.literal_eval(e.stock)
#                                     for s in stock:
#                                         if s['addedqty']>0:
#                                             if v.pk==s['inventory']:
#                                                 if s['comm_nr']!=h.project.comm_nr:
#                                                 # listVal += s['addedqty']
#                                                     # value = ''
#                                                     value = '(quantity : ' + str(s['addedqty']) + ', comm_nr : ' + h.project.comm_nr + ')'
#                                                     val.append(value)
#
#                     val = json.dumps(val)
#                     Sheet1.append([i.vendor.name,i.title, j.products.part_no,j.products.description_1,j.quantity2,j.landed_price,stockConsumed,val])
#                 Sheet1.append(['', '','','',' ',' ',' '])
#
#             Sheet1.append(['material Issued'])
#             Sheet1.append(['Part No','Description','Quantity','consumed In','consumed From',])
#             for d in projData:
#                 bomObj=BoM.objects.filter(project__id=d.pk)
#                 materialObj=MaterialIssueMain.objects.filter(project__id=d.pk)
#                 if len(materialObj)>0:
#                     bomObjs = list(bomObj.values())
#                     for a in materialObj:
#                         for b in a.materialIssue.all():
#                             # for c in bomObjs:
#                             try :
#                                 bomObj.get(products__id=b.product.pk)
#                                 pass
#                             except:
#                                 inval = []
#                                 for u in ast.literal_eval(b.stock):
#                                     if u['comm_nr']!=a.project.comm_nr:
#                                         if u['addedqty']>0:
#                                             invalue = '(quantity : ' + str(u['addedqty']) + ', comm_nr : ' + u['comm_nr'] + ')'
#                                             inval.append(invalue)
#                                 inval = json.dumps(inval)
#                                 Sheet1.append([b.product.part_no, b.product.description_1,b.qty,a.project.title,inval])
#                             # if b.product.pk not in bomObjs:
#                             #     print 'herrrrrrrrreeeee'
#                             #
#                             #     Sheet1.append([b.product.part_no, b.product.description_1,b.qty])
#                             # for c in bomObj:
#                             #     print c.products.pk , b.product.pk
#                                 # if c.products.pk == b.product.pk:
#                                 #     print 'hhhhhhhhhhheeeeeeeeerrrrrrrrreeeeeeeeee'
#                                     # Sheet1.append([b.product.part_no, b.product.description_1,b.qty])
#
#             Sheet1.column_dimensions['A'].width = 20
#             Sheet1.column_dimensions['B'].width = 20
#             Sheet1.column_dimensions['C'].width = 40
#             Sheet1.column_dimensions['D'].width = 40
#             Sheet1.column_dimensions['E'].width = 20
#             Sheet1.column_dimensions['F'].width = 30
#             Sheet1.column_dimensions['G'].width = 20
#             Sheet1.column_dimensions['H'].width = 50
#         response = HttpResponse(content=save_virtual_workbook(workbook),content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
#         response['Content-Disposition'] = 'attachment; filename=stockConsumed.xlsx'
#         return response


class CreateStockReportDataAPIView(APIView):
    renderer_classes = (JSONRenderer,)
    def get(self , request , format = None):
        print  request.GET
        toRet = {'status':'Invalid Data'}
        dtime = datetime.datetime.now()
        dt = dtime.date()
        # if StockSummaryReport.objects.filter(dated=dt).exists():
        #     print 'already createddddddddd'
        #     return Response({'status':'Data Has Already Created'},status=status.HTTP_200_OK)
        prodObj = Products.objects.filter(created__lte=dtime)
        stockTotal = 0
        for i in prodObj:
            invtObjs = Inventory.objects.filter(product=i,created__lte=dtime)
            if invtObjs.count()>0:
                total = invtObjs.aggregate(total=Sum(F('qty') * F('rate'),output_field=FloatField())).get('total',0)
                # print total
                stockTotal += total
        print 'total valueeeeeeeeeee',stockTotal
        if stockTotal>0:
            try:
                ssReportObj = StockSummaryReport.objects.get(dated=dt)
                ssReportObj.stockValue = stockTotal
                ssReportObj.save()
            except:
                ssReportObj = StockSummaryReport.objects.create(dated=dt,stockValue=stockTotal)
            projectsObjs=Projects.objects.filter(Q(status='approved')|Q(status='ongoing'),savedStatus=False,junkStatus=False,created__lte=dtime)
            print projectsObjs.count()
            projStackSummary = []
            for i in projectsObjs:
                matIssMainObjs = MaterialIssueMain.objects.filter(project=i,created__lte=dtime)
                if matIssMainObjs.count()>0:
                    vl = 0
                    for j in matIssMainObjs:
                        tot = 0
                        matIssueObjs = j.materialIssue.all()
                        tot = matIssueObjs.aggregate(total=Sum(F('qty') * F('price'),output_field=FloatField())).get('total',0)
                        # print tot
                        vl += tot
                    try:
                        pObj=ProjectStockSummary.objects.get(stockReport=ssReportObj,title=i.title)
                        pObj.value=vl
                        pObj.save()
                    except:
                        projStackSummary.append(ProjectStockSummary(stockReport=ssReportObj,value=vl,title=i.title))
                else:
                    try:
                        pObj=ProjectStockSummary.objects.get(stockReport=ssReportObj)
                    except:
                        projStackSummary.append(ProjectStockSummary(stockReport=ssReportObj,value=0,title=i.title))

            print len(projStackSummary)
            ProjectStockSummary.objects.bulk_create(projStackSummary)
            toRet['status'] = 'Successfully Saved'
        else:
            toRet['status'] = 'No Data Exists'
        return Response(toRet,status=status.HTTP_200_OK)

class DownloadStockReportAPIView(APIView):
    renderer_classes = (JSONRenderer,)
    def get(self , request , format = None):
        print  request.GET
        workbook = Workbook()
        toReturn = workbook.active
        dtObj = datetime.datetime.now()
        if dtObj.month > 3:
            fstDate = date(dtObj.year,4,1)
            lstDate = fstDate + relativedelta(years=1)
        else:
            fstDate = date(dtObj.year-1,4,1)
            lstDate = fstDate + relativedelta(years=1)
        print fstDate , lstDate

        reportsObj = StockSummaryReport.objects.filter(dated__range=[fstDate,lstDate]).order_by('dated')
        print reportsObj.count()
        hdFont = Font(size=12,bold=True)
        alphaChars = list(string.ascii_uppercase)
        rptPkList = list(reportsObj.values_list('pk',flat=True))
        projStokObjs = ProjectStockSummary.objects.filter(stockReport__in=rptPkList)
        unqTitles = list(projStokObjs.values_list('title',flat=True).distinct())

        # toReturn = []
        hd = ['Date','Stock value at warehouse']
        hdWidth = [10,10,10]
        hd += unqTitles
        # for i in unqTitles:
        #     hd.append('Consumption Of Stock - '+i)

        toReturn.append(hd)
        for idx,i in enumerate(hd):
            cl = str(alphaChars[idx])+'1'
            toReturn[cl].fill = PatternFill(start_color="48dce0", end_color="48dce0", fill_type = "solid")
            toReturn[cl].font = hdFont
            # Sheet1.column_dimensions[str(alphaChars[idx])].width = hdWidth[idx]
        for i in reportsObj:
            sam = []
            sam.append(str(i.dated))
            sam.append(i.stockValue)
            for j in unqTitles:
                try:
                    p = projStokObjs.get(stockReport=i,title=j)
                    sam.append(p.value)
                except:
                    print 'project errorrr'
                    sam.append(0)
            toReturn.append(sam)
            for idx,i in enumerate(sam):
                cl = str(alphaChars[idx])+'1'
                toReturn[cl].fill = PatternFill(start_color="48dce0", end_color="48dce0", fill_type = "solid")
                toReturn[cl].font = hdFont
                # Sheet1.column_dimensions[str(alphaChars[idx])].width = hdWidth[idx]
        if toReturn.max_column <= len(string.ascii_uppercase):
            for character in string.ascii_uppercase[0:toReturn.max_column]:
                toReturn.column_dimensions[character].width = 20
        response = HttpResponse(content=save_virtual_workbook(workbook),content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename=stockSummary.xlsx'
        return response
        # return ExcelResponse(toReturn, 'Stock_Summary' , 'Stock Summary')

class DownloadInvoiceReportAPIView(APIView):
    renderer_classes = (JSONRenderer,)
    def get(self , request , format = None):
        projectObj = Projects.objects.filter(Q(status='approved')|Q(status='ongoing'),junkStatus=False,savedStatus=False)
        workbook = Workbook()
        toReturn = workbook.active
        hdFont = Font(size=12,bold=True)
        alphaChars = list(string.ascii_uppercase)
        hd = ['Purchase Order Ref','Supplier','Invoice No.','BOE']
        hdWidth = [10,10,10]
        toReturn.append(hd)
        for idx,i in enumerate(hd):
            cl = str(alphaChars[idx])+'1'
            toReturn[cl].fill = PatternFill(start_color="48dce0", end_color="48dce0", fill_type = "solid")
            toReturn[cl].font = hdFont
        for p in projectObj:
            sam = []
            sam.append(p.poNumber)
            sam.append(p.vendor.name)
            sam.append(p.invoiceNumber)
            sam.append(p.boeRefNumber)
            toReturn.append(sam)
        # return ExcelResponse(toReturn, 'Invoice_BOE' , 'Invoice BOE')
        toReturn.column_dimensions['A'].width = 20
        toReturn.column_dimensions['B'].width = 20
        toReturn.column_dimensions['C'].width = 20
        toReturn.column_dimensions['D'].width = 20
        response = HttpResponse(content=save_virtual_workbook(workbook),content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename=Invoice_BOE.xlsx'
        return response

class GetCmrListAPIView(APIView):
    renderer_classes = (JSONRenderer,)
    def get(self , request , format = None):
        cmrList = list(Projects.objects.filter(savedStatus=False,junkStatus=False).values_list('comm_nr',flat=True).distinct())
        return Response(cmrList,status=status.HTTP_200_OK)

class ProjectProductAPIView(APIView):
    # renderer_classes = (JSONRenderer,)
    def get(self , request , format = None):
        projectObj = Projects.objects.filter(savedStatus=False,junkStatus=False,comm_nr=request.GET['comm'])
        print projectObj,'projjjjjjjjjjjjj'
        toReturn = {}
        for i in projectObj:
            bomlist = []
            bomObj = BoM.objects.filter(project=i)
            for j in bomObj:
                qtPrice = round((i.profitMargin*j.price/100) + j.price,2)
                wkPrice = round(j.price*i.exRate,2)
                try:
                    packingCost = round((i.packing/i.invoiceValue)*wkPrice,2)
                except:
                    packingCost = 0
                try:
                    insurance = round((i.insurance/i.invoiceValue)*wkPrice,2)
                except:
                    insurance = 0
                try:
                    freight = round((i.freight/i.invoiceValue)*wkPrice,2)
                except:
                    freight = 0
                cifPc = round(wkPrice+packingCost+insurance+freight,2)
                totcif = round(cifPc*j.quantity1,2)
                cdVal = round((cifPc+((cifPc*i.assessableValue)/100))*(j.custom/100),2)
                swe = round(cdVal*0.1,2)
                gstVal = round((cifPc+cdVal+swe)*j.gst/100,2)
                try:
                    cc1 = round(wkPrice*(i.clearingCharges1/(i.invoiceValue*i.exRate)),2)
                except:
                    cc1 = 0
                try:
                    cc2 = round(wkPrice*(i.clearingCharges2/(i.invoiceValue*i.exRate)),2)
                except:
                    cc2 = 0

                bomlist.append({'productDesc1':j.products.description_1,'productDesc2':j.products.description_2,'partNo':j.products.part_no,'weight':j.products.weight,'qty1':j.quantity1,'hsn':j.products.customs_no,'price':j.price,'qty2':j.quantity2,'qtPrice':qtPrice,'wkPrice':wkPrice,'packingCost':packingCost,'insurance':insurance,'freight':freight,'cifPc':cifPc,'totcif':totcif,'cdperc':j.custom,'cdVal':cdVal,'swe':swe,'gst':j.gst,'gstVal':gstVal,'cc1':cc1,'cc2':cc2,'landingCost':j.landed_price,})

            toReturn[i.pk]=bomlist
        return Response(toReturn,status=status.HTTP_200_OK)

class CancelMaterialAPIView(APIView):
    def post(self , request , format = None):
        toReturn = []
        materialObj = MaterialIssueMain.objects.get(pk=request.data['pkData'])
        obj = materialObj.materialIssue.all()
        for i in obj:
            for j in ast.literal_eval(i.stock):
                print j['inventory']
                invobj = Inventory.objects.get(pk=j['inventory'])
                qty = 0
                addedqty = 0
                qty = invobj.qty
                qty+= j['addedqty']
                invobj.qty = qty
                addedqty = invobj.addedqty
                addedqty+= j['addedqty']
                invobj.addedqty = addedqty
                invobj.save()
                # toReturn.append(json.dump(invobj))
            i.delete()
        materialObj.delete()
        return Response(status=status.HTTP_200_OK)

def deliveryChallan(response , value , request):
    styles = getSampleStyleSheet()
    style_right = ParagraphStyle(name='right', parent=styles['Normal'], alignment=TA_RIGHT)
    doc = SimpleDocTemplate(response,pagesize=letter, topMargin=0.2*cm,leftMargin=0.1*cm,rightMargin=0.1*cm)
    doc.request = request
    elements = []
    invdata = MaterialIssueMain.objects.get(pk = request.GET['value'])
    print invdata,'aaaaa'
    p1 = Paragraph("<para alignment='center' fontSize=15  ><b> Delivery Challan</b></para>",styles['Normal'])

    elements.append(p1)
    elements.append(Spacer(1,15))
    supplier = invdata.vendor.name
    # projecttitle =invdata.project.title
    # customer =invdata.project.service.name
    # dated = invdata.created.date()
    p0_01 =Paragraph("<para  alignment='left' fontSize=10>Supplier - {0}</para>".format(supplier),styles['Normal'])
    # p1_01 =Paragraph("<para fontSize=10>Project title</para>",styles['Normal'])
    # p1_02 =Paragraph(str(projecttitle),styles['Normal'])
    #
    # p2_01 =Paragraph("<para fontSize=10>Customer</para>",styles['Normal'])
    # p2_02 =Paragraph(str(customer),styles['Normal'])
    #
    # p3_01 =Paragraph("<para fontSize=10>Date of issue</para>",styles['Normal'])
    # p3_02 =Paragraph(str(dated),styles['Normal'])



    data1=[[p0_01]]
    # rheights=1*[0.2*inch] #[1.1*inch,1.1*inch]
    # cwidths=6.5*inch
    t1=Table(data1)

    elements.append(t1)
    elements.append(Spacer(1,40))


    p4_01 =Paragraph("<para fontSize=6 align=center><b>Part number</b></para>",styles['Normal'])
    p4_02 =Paragraph("<para fontSize=6 align=center><b>Part description</b></para>",styles['Normal'])
    p4_03 =Paragraph("<para fontSize=6 align=center><b>Quantity</b></para>",styles['Normal'])
    # p4_04 =Paragraph("<para fontSize=6 align=center><b>Stock value / unit<br/>(Z) </b></para>",styles['Normal'])
    # p4_05 =Paragraph("<para fontSize=6 align=center><b>Stock value consumed for the comm nr<br/>(AD = ACxZ)</b></para>",styles['Normal'])
    data2= [[p4_01,p4_02,p4_03]]

    grandtotal = 0

    for i in invdata.materialIssue.all():
        partno = i.product.part_no
        description = i.product.description_1
        qty = i.qty
        qdata = qty
        price = i.price
        pdata = price
        total = qty*price
        tdata = total
        grandtotal+=total
        gtotal = grandtotal
        p6_01 =Paragraph(partno,styles['Normal'])
        p6_02 =Paragraph(description,styles['Normal'])
        p6_03 =Paragraph("{:,}".format(qdata),styles['Normal'])
        # p6_04 =Paragraph("{:,}".format(round(pdata,2)),style_right)
        # p6_05 =Paragraph("{:,}".format(round(tdata,2)),style_right)
        data2+=[[p6_01,p6_02,p6_03]]

    # p7_01 =Paragraph("<para fontSize=8 ></para>",styles['Normal'])
    # p7_02 =Paragraph("<para fontSize=8 ></para>",styles['Normal'])
    # p7_03 =Paragraph("<para fontSize=8 ></para>",styles['Normal'])
    # p7_04 =Paragraph("<para fontSize=8 ><b>Total</b></para>",style_right)
    # p7_05 =Paragraph("{:,}".format(round(gtotal,2)),style_right)
    # data2+=[[p7_01,p7_02,p7_03,p7_04,p7_05]]

    # rheight=0.4*inch #[1.1*inch,1.1*inch]
    # cwidth=1.6*inch,3*inch,0.4*inch
    t2=Table(data2)
    t2.setStyle(TableStyle([('ALIGN',(0,0),(-1,-1),'CENTER'),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))
    elements.append(t2)
    doc.build(elements)




class DeliveryChallanNoteAPIView(APIView):
    def get(self , request , format = None):
        print request.GET,'aaaaaa'
        value = request.GET['value']
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment;filename="Quotationdownload.pdf"'
        deliveryChallan(response , value ,request)
        return response
