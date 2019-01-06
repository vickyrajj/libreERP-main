
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
        else:
            return Products.objects.all()



class ProductSheetViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny , )
    queryset = ProductSheet.objects.all()
    serializer_class = ProductSheetSerializer



class ProjectsViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny , )
    queryset = Projects.objects.all().order_by('-created')
    serializer_class = ProjectsSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['status','title','savedStatus','junkStatus']

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

            for i in range(3,ws.max_row+1):
                try:
                    print 'aaaaaaaaaaa'
                    try:
                        part_no = ws['B' + str(i)].value
                    except:
                        part_no = None



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
                        replaced = ws['G' + str(i)].value
                    except:
                        replaced = None


                    try:
                        customs_no = ws['H' + str(i)].value

                    except:
                        customs_no = None

                    try:
                        custom = ws['I' + str(i)].value
                    except:
                        custom = 7.5
                    try:
                        gst = ws['J' + str(i)].value
                    except:
                        gst = 18


                    Products.objects.get_or_create(part_no=part_no, description_1=description_1,description_2=description_2,replaced=replaced,parent=parent,weight=weight, price=price,customs_no=customs_no,custom=custom,gst=gst)
                except:
                    pass
        return Response(status=status.HTTP_200_OK)
from reportlab.lib.styles import getSampleStyleSheet
from svglib.svglib import svg2rlg

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
    special1 = project.date
    special2 = "Shipment mode - " + project.shipmentMode
    special3 = project.shipmentDetails
    p15_02 =Paragraph("<para fontSize=8>{0}</para>".format(project.terms),styles['Normal'])
    p15_03 =Paragraph("<para fontSize=8>{0}<br/>{1}<br/>{2}</para>".format(special1,special2,special3),styles['Normal'])
    p15_04 =Paragraph("<para fontSize=8>{0}</para>".format(project.paymentTerms),styles['Normal'])
    data6+=[[p15_02,p15_03,p15_04]]
    t6=Table(data6)
    t6.hAlign = 'LEFT'
    t6.setStyle(TableStyle([('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),black),('ALIGN',(0,0),(-1,-1),'LEFT'),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))
    elements.append(t6)


    elements.append(Spacer(1,10))



    if currencyTyp=='CHF':
        p101_01 =Paragraph("<para fontSize=8>Sl. no</para>",styles['Normal'])
        p101_02 =Paragraph("<para fontSize=8>Part Number</para>",styles['Normal'])
        p101_03 =Paragraph("<para fontSize=8>Part Desc</para>",styles['Normal'])
        p101_07 =Paragraph("<para fontSize=8>HS Code</para>",styles['Normal'])
        p101_04 =Paragraph("<para fontSize=8>Qty</para>",styles['Normal'])
        p101_05 =Paragraph("<para fontSize=8>Unit price in CHF</para>",styles['Normal'])
        p101_06 =Paragraph("<para fontSize=8>Amount in CHF</para>",styles['Normal'])


        data5=[[p101_01,p101_02,p101_03,p101_07,p101_04,p101_05,p101_06]]

        grandTotal = 0
        data2 = []
        id=0
        for i in purchaselist:
            id+=1
            part_no = i.products.part_no
            desc = i.products.description_1
            hs = i.products.customs_no

            price = i.price
            qty = i.quantity1
            amnt = round((price * qty),2)
            grandTotal +=amnt


            p12_01 = Paragraph("<para fontSize=8>{0}</para>".format(id),styles['Normal'])
            p12_02 =Paragraph("<para fontSize=8>{0}</para>".format(part_no),styles['Normal'])
            p12_03 =Paragraph("<para fontSize=8>{0}</para>".format(smart_str(desc)),styles['Normal'])
            p12_07 =Paragraph("<para fontSize=8>{0}</para>".format(smart_str(hs)),styles['Normal'])
            p12_04 =Paragraph("<para fontSize=8>{0}</para>".format(qty),styles['Normal'])
            p12_05 =Paragraph("<para fontSize=8>{0}</para>".format(price),styles['Normal'])
            p12_06 =Paragraph("<para fontSize=8>{0}</para>".format(amnt),styles['Normal'])
            data5.append([p12_01,p12_02,p12_03,p12_07,p12_04,p12_05,p12_06])


        grandTotal = round(grandTotal,2)
        p13_01 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
        p13_02 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
        p13_03 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
        p13_04 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
        p13_05 =Paragraph("<para fontSize=8></para>",styles['Normal'])
        p13_06 =Paragraph("<para fontSize=8>Total in CHF</para>",styles['Normal'])
        p13_07 =Paragraph(str(grandTotal),styles['Normal'])

        data5+=[[p13_01,p13_02,p13_03,p13_04,p13_05,p13_06,p13_07]]
        t3=Table(data5,colWidths=(10*mm,None, 50*mm, None, None, None, None))
        t3.setStyle(TableStyle([('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),black),('ALIGN',(0,0),(-1,-1),'LEFT'),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))

        elements.append(t3)
    else:
        p101_01 =Paragraph("<para fontSize=8>Sl. no</para>",styles['Normal'])
        p101_02 =Paragraph("<para fontSize=8>Part Number</para>",styles['Normal'])
        p101_03 =Paragraph("<para fontSize=8>Part Desc</para>",styles['Normal'])
        p101_07 =Paragraph("<para fontSize=8>HS Code</para>",styles['Normal'])
        p101_04 =Paragraph("<para fontSize=8>Qty</para>",styles['Normal'])
        p101_05 =Paragraph("<para fontSize=8>Unit price in INR</para>",styles['Normal'])
        p101_06 =Paragraph("<para fontSize=8>Amount in INR</para>",styles['Normal'])
        p101_08 =Paragraph("<para fontSize=8>GST</para>",styles['Normal'])
        p101_09 =Paragraph("<para fontSize=8>Total with GST</para>",styles['Normal'])


        data2=[[p101_01,p101_02,p101_03,p101_07,p101_04,p101_05,p101_06,p101_08,p101_09]]
        grandTotal = 0
        id=0
        amnt =0
        gstValTotal=0
        for i in purchaselist:
            id+=1
            part_no = i.products.part_no
            desc = i.products.description_1
            hs = i.customs_no
            price = i.landed_price
            qty = i.quantity1
            amnt = round((price * qty),2)
            print amnt,'kkkkkk'
            grandTotal +=amnt
            gst = i.gst
            gstVal = round(((((amnt *gst)/100)+amnt)),2)
            gstValTotal += gstVal


            p12_01 = Paragraph("<para fontSize=8>{0}</para>".format(id),styles['Normal'])
            p12_02 =Paragraph("<para fontSize=8>{0}</para>".format(part_no),styles['Normal'])
            p12_03 =Paragraph("<para fontSize=8>{0}</para>".format(smart_str(desc)),styles['Normal'])
            p12_07 =Paragraph("<para fontSize=8>{0}</para>".format(smart_str(hs)),styles['Normal'])
            p12_04 =Paragraph("<para fontSize=8>{0}</para>".format(qty),styles['Normal'])
            p12_05 =Paragraph("<para fontSize=8>{0}</para>".format(price),styles['Normal'])
            p12_06 =Paragraph("<para fontSize=8>{0}</para>".format(amnt),styles['Normal'])
            p12_08 =Paragraph("<para fontSize=8>{0}%</para>".format(gst),styles['Normal'])
            p12_09 =Paragraph("<para fontSize=8>{0}</para>".format(gstVal),styles['Normal'])
            data2.append([p12_01,p12_02,p12_03,p12_07,p12_04,p12_05,p12_06,p12_08,p12_09])


        grandTotal = round(grandTotal,2)
        gstValTotal = round(gstValTotal,2)
        p13_01 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
        p13_02 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
        p13_03 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
        p13_04 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
        p13_05 =Paragraph("<para fontSize=8></para>",styles['Normal'])
        p13_06 =Paragraph("<para fontSize=8>Total in INR</para>",styles['Normal'])
        p13_07 =Paragraph("<para fontSize=8>{0}</para>".format(grandTotal),styles['Normal'])
        p13_08 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
        p13_09 =Paragraph("<para fontSize=8>{0}</para>".format(gstValTotal),styles['Normal'])

        data2+=[[p13_01,p13_02,p13_03,p13_04,p13_05,p13_06,p13_07,p13_08,p13_09]]
        t3=Table(data2,colWidths=(10*mm,None, 50*mm, None, None, None, None, None, None))
        t3.setStyle(TableStyle([('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),black),('ALIGN',(0,0),(-1,-1),'LEFT'),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))

        elements.append(t3)
    elements.append(Spacer(1,8))

    elements.append(Paragraph("<para fontSize=8>Notes:</para>",styles['Normal']))
    elements.append(Paragraph("<para fontSize=8> 1. Indicate your GST number, HS Code , SAC Code, and PAN number in your Invoice. </para>",styles['Normal']))
    elements.append(Paragraph("<para fontSize=8> 2. Indicate our PO number on all order related documents. </para>",styles['Normal']))
    elements.append(Paragraph("<para fontSize=8> 3. Send us your order confirmation within 3 days from the date of receipt of our PO. </para>",styles['Normal']))
    elements.append(Spacer(1,8))
    elements.append(Paragraph("<para fontSize=8>With Best Regards </para>",styles['Normal']))
    elements.append(Spacer(1,8))
    elements.append(Paragraph("<para fontSize=8>For BRUDERER PRESSES INDIA PVT LTD.,</para>",styles['Normal']))
    elements.append(Spacer(1,8))
    elements.append(Paragraph("<para fontSize=8>Authorised Signatory.</para>",styles['Normal']))
    doc.build(elements)



def quotation(response , project , purchaselist , multNumber,typ,request):
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
    print 'aaaaaaaaaaaaaaaa',typ
    if typ == 'INR' or typ =='CHF':
        print 'aaaaaaaaaaaaaaaa'
        summryHeader = Paragraph("""
        <para >
        <font size='14'>
        QUOTATION
        <br/>
        <br/>
        </font>
        </para>
        """ %(),styles['Normal'])
    else :
        summryHeader = Paragraph("""
        <para >
        <font size='14'>
        INVOICE
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

    print project.service.address
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


    if typ == 'CHF':
        priceFormat = 'Unit price in CHF'
        amountFormat = 'Amount in CHF'

        p101_01 =Paragraph("<para fontSize=8>Sl. no</para>",styles['Normal'])
        p101_02 =Paragraph("<para fontSize=8>Part Number</para>",styles['Normal'])
        p101_03 =Paragraph("<para fontSize=8>Part Desc</para>",styles['Normal'])
        p101_04 =Paragraph("<para fontSize=8>Qty</para>",styles['Normal'])
        p101_05 =Paragraph("<para fontSize=8>{0}</para>".format(priceFormat),styles['Normal'])
        p101_06 =Paragraph("<para fontSize=8>{0}</para>".format(amountFormat),styles['Normal'])

        data5=[[p101_01,p101_02,p101_03,p101_04,p101_05,p101_06]]
        t5=Table(data5,colWidths=(10*mm,None, 50*mm, None, None, None))
        t5.hAlign = 'LEFT'
        t5.setStyle(TableStyle([('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),black),('ALIGN',(0,0),(-1,-1),'LEFT'),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))
        elements.append(t5)
        grandTotal = 0
        data2 = []
        id=0
        for i in purchaselist:
            id+=1
            part_no = i.products.part_no
            desc = i.products.description_1
            basicprice = i.price
            pricesum = round((((i.price*project.profitMargin)/100)+i.price),2)
            price = round((pricesum * multNumber),2)
            qty = i.quantity1
            amnt = round((price * qty),2)
            grandTotal +=amnt

            p12_01 = Paragraph("<para fontSize=8>{0}</para>".format(id),styles['Normal'])
            p12_02 =Paragraph("<para fontSize=8>{0}</para>".format(part_no),styles['Normal'])
            p12_03 =Paragraph("<para fontSize=8>{0}</para>".format(smart_str(desc)),styles['Normal'])
            p12_04 =Paragraph("<para fontSize=8>{0}</para>".format(qty),styles['Normal'])
            p12_05 =Paragraph("<para fontSize=8>{0}</para>".format(price),styles['Normal'])
            p12_06 =Paragraph("<para fontSize=8>{0}</para>".format(amnt),styles['Normal'])
            data2.append([p12_01,p12_02,p12_03,p12_04,p12_05,p12_06])
        t2=Table(data2,colWidths=(10*mm,None, 50*mm, None, None, None))
        t2.hAlign = 'LEFT'
        t2.setStyle(TableStyle([('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),black),('ALIGN',(0,0),(-1,-1),'LEFT'),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))
        grandTotal = round(grandTotal,2)
        p13_01 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
        p13_02 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
        p13_03 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
        p13_04 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
        p13_05 =Paragraph("<para fontSize=8>Total in CHF</para>",styles['Normal'])
        p13_06 =Paragraph(str(grandTotal),styles['Normal'])

        data3=[[p13_01,p13_02,p13_03,p13_04,p13_05,p13_06]]
        t3=Table(data3,colWidths=(10*mm,None, 50*mm, None, None, None))
        t3.hAlign = 'LEFT'
        t3.setStyle(TableStyle([('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),black),('ALIGN',(0,0),(-1,-1),'LEFT'),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))

        elements.append(t2)
        elements.append(t3)

    else:
        print "aaaaaaaaaaaaaaaaaa"
        priceFormat = 'Unit price in INR'
        amountFormat = 'Amount in INR'
        p101_01 =Paragraph("<para fontSize=8>Sl. no</para>",styles['Normal'])
        p101_02 =Paragraph("<para fontSize=8>Part Number</para>",styles['Normal'])
        p101_03 =Paragraph("<para fontSize=8>Part Desc</para>",styles['Normal'])
        p101_04 =Paragraph("<para fontSize=8>Qty</para>",styles['Normal'])
        p101_05 =Paragraph("<para fontSize=8>{0}</para>".format(priceFormat),styles['Normal'])
        p101_06 =Paragraph("<para fontSize=8>{0}</para>".format(amountFormat),styles['Normal'])
        p101_07 =Paragraph("<para fontSize=8>GST</para>",styles['Normal'])
        p101_08 =Paragraph("<para fontSize=8>Total With GST</para>",styles['Normal'])

        data5=[[p101_01,p101_02,p101_03,p101_04,p101_05,p101_06,p101_07,p101_08]]
        # cwidths = 8*[1*inch]
        t5=Table(data5,colWidths=(10*mm,30*mm, 50*mm, None, None, None, None, None))
        t5.setStyle(TableStyle([('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),black),('ALIGN',(0,0),(-1,-1),'LEFT'),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))
        # t5.hAlign = 'LEFT'
        # t5.setStyle(TableStyle([('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),black),('ALIGN',(0,0),(-1,-1),'LEFT'),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))
        elements.append(t5)
        gstValTotal = 0
        grandTotal = 0
        data2 = []
        id=0
        for i in purchaselist:
            id+=1
            part_no = i.products.part_no
            desc = i.products.description_1
            basicprice = i.price
            landingPrice = i.landed_price
            pricesum =round((i.landed_price+(i.price*multNumber*project.profitMargin)/100),2)
            # price = round((pricesum * multNumber),2)
            qty = i.quantity1
            amnt = round((pricesum * qty),2)
            grandTotal +=amnt
            gst = i.gst
            gstVal = round((((amnt *gst)/100)+amnt),2)
            gstValTotal += gstVal

            p12_01 = Paragraph("<para fontSize=8>{0}</para>".format(id),styles['Normal'])
            p12_02 =Paragraph("<para fontSize=8>{0}</para>".format(part_no),styles['Normal'])
            p12_03 =Paragraph("<para fontSize=8>{0}</para>".format(smart_str(desc)),styles['Normal'])
            p12_04 =Paragraph("<para fontSize=8>{0}</para>".format(qty),styles['Normal'])
            p12_05 =Paragraph("<para fontSize=8>{0}</para>".format(pricesum),styles['Normal'])
            p12_06 =Paragraph("<para fontSize=8>{0}</para>".format(amnt),styles['Normal'])
            p12_07 =Paragraph("<para fontSize=8>{0}%</para>".format(gst),styles['Normal'])
            p12_08 =Paragraph("<para fontSize=8>{0}</para>".format(gstVal),styles['Normal'])
            data2.append([p12_01,p12_02,p12_03,p12_04,p12_05,p12_06,p12_07,p12_08])
        # rheights = 6*[1.4*inch],1*[0.4*inch]
        # cwidths = 8*[1*inch]
        t2=Table(data2,colWidths=(10*mm,30*mm, 50*mm, None, None, None, None, None))

        # t2.hAlign = 'LEFT'
        t2.setStyle(TableStyle([('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),black),('ALIGN',(0,0),(-1,-1),'LEFT'),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))
        grandTotal = round(grandTotal,2)
        gstValTotal = round(gstValTotal,2)
        p13_01 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
        p13_02 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
        p13_03 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
        p13_04 =Paragraph("<para fontSize=8>{0}</para>".format(''),styles['Normal'])
        p13_05 =Paragraph("<para fontSize=8>Total in INR</para>",styles['Normal'])
        p13_06 =Paragraph(str(grandTotal),styles['Normal'])
        p13_07 =Paragraph("<para fontSize=8></para>",styles['Normal'])
        p13_08 =Paragraph(str(gstValTotal),styles['Normal'])

        data3=[[p13_01,p13_02,p13_03,p13_04,p13_05,p13_06,p13_07,p13_08]]

        # cwidths = 8*[1*inch]
        t3=Table(data3,colWidths=(10*mm,30*mm, 50*mm, None, None, None, None, None))
        t3.setStyle(TableStyle([('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),black),('ALIGN',(0,0),(-1,-1),'LEFT'),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),0.25,colors.black),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black)]))

        elements.append(t2)
        elements.append(t3)


    # elements.append(t3)
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
    if typ == 'CHF':
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
        elements.append(Paragraph("<para fontSize=8> 1. Freight & Insurance  : To be organised by buyer </para>",styles['Normal']))
        elements.append(Paragraph("<para fontSize=8> 2. P & F  : Extra </para>",styles['Normal']))
        elements.append(Paragraph("<para fontSize=8> 3.Warranty :Twelve months - Only on spares fixed by Burderer India engineer</para>",styles['Normal']))
        elements.append(Spacer(1,8))
        elements.append(Paragraph("<para fontSize=8>We hope that this quotation will meet your requirement and would be glad to receive your firm order. For further information please do not hesitate to cotnact us any time. </para>",styles['Normal']))
        elements.append(Spacer(1,8))
        elements.append(Paragraph("<para fontSize=8>For BRUDERER PRESSES INDIA PVT LTD.,</para>",styles['Normal']))
        elements.append(Spacer(1,8))
        elements.append(Paragraph("<para fontSize=8>Authorised Signatory.</para>",styles['Normal']))
    else:
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
        elements.append(Paragraph("<para fontSize=8> 1. Indicate your GST number, HSN Code and PAN number in your PO. </para>",styles['Normal']))
        elements.append(Paragraph("<para fontSize=8> 2. Indicate our Quote ref in your PO. </para>",styles['Normal']))
        elements.append(Paragraph("<para fontSize=8> 3. Freight & Insurance  : To be organised by buyer </para>",styles['Normal']))
        elements.append(Paragraph("<para fontSize=8> 4. Freight & Insurance  : To be organised by buyer </para>",styles['Normal']))
        elements.append(Paragraph("<para fontSize=8> 5. P & F  : Extra </para>",styles['Normal']))
        elements.append(Paragraph("<para fontSize=8> 6.Warranty :Twelve months - Only on spares fixed by Burderer India engineer</para>",styles['Normal']))
        elements.append(Spacer(1,8))
        if typ != 'Invoice':
            elements.append(Paragraph("<para fontSize=8>We hope that this quotation will meet your requirement and would be glad to receive your firm order. For further information please do not hesitate to cotnact us any time. </para>",styles['Normal']))
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

    p2 = Paragraph("<para fontSize=10 ><b> {0} </b></para>".format(project.vendor.name),styles['Normal'])
    p3 = Paragraph("<para fontSize=8  >{0}</para>".format(project.vendor.street),styles['Normal'])
    p4 =  Paragraph("<para fontSize=8 >{0}</para>".format(project.vendor.city),styles['Normal'])
    p5 = Paragraph("<para fontSize=8 >{0}</para>".format(project.vendor.pincode),styles['Normal'])
    p6 = Paragraph("<para fontSize=8 >{0} - {1}</para>".format(project.vendor.state, project.vendor.country),styles['Normal'])

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
        print request.GET,'dnfjkdhfjkhdfk'
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
    if value !='':
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
            gtotal = str(grandtotal)
            p6_01 =Paragraph(partno,styles['Normal'])
            p6_02 =Paragraph(description,styles['Normal'])
            p6_03 =Paragraph(qdata,styles['Normal'])
            p6_04 =Paragraph(pdata,styles['Normal'])
            p6_05 =Paragraph(tdata,styles['Normal'])
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
                qdata = str(qty)
                price = j['price']
                pdata = str(price)
                total = qty*price
                tdata = str(total)
                grandtotal+=total
                gtotal = str(grandtotal)
                p6_01 =Paragraph(partno,styles['Normal'])
                p6_02 =Paragraph(description,styles['Normal'])
                p6_03 =Paragraph(qdata,styles['Normal'])
                p6_04 =Paragraph(pdata,styles['Normal'])
                p6_05 =Paragraph(tdata,styles['Normal'])
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
    p7_04 =Paragraph("<para fontSize=8 >Total</para>",styles['Normal'])
    p7_05 =Paragraph(gtotal,styles['Normal'])
    data2+=[[p7_01,p7_02,p7_03,p7_04,p7_05]]

    rheight=0.4*inch #[1.1*inch,1.1*inch]
    cwidth=1.6*inch,1.6*inch,1.6*inch,1.6*inch,1.8*inch
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
                                stockList.append({'part_no':p.product.part_no,'qty': p.qty})
                                prodListQty = prodListQty - p.qty
                                p.qty = 0
                                p.save()
                            elif prodListQty<p.qty:
                                stockList.append({'part_no':p.product.part_no,'qty': p.qty})
                                p.qty = p.qty - prodListQty
                                prodListQty = 0
                                p.save()
                            elif prodListQty==p.qty:
                                stockList.append({'part_no':p.product.part_no,'qty': p.qty})
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
class DownloadProjectSCExcelReponse(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    def get(self , request , format = None):
        workbook = Workbook()
        projectObj = Projects.objects.filter(Q(status='approved')|Q(status='ongoing'),savedStatus=False,junkStatus=False)
        projectsObj = list(projectObj.values('comm_nr').distinct().values())
        sendData =[]
        for idx,p in enumerate(projectsObj):
            if idx==0:
                Sheet1 = workbook.active
                Sheet1.title = p['comm_nr']
            if idx>0:
                Sheet1 = workbook.create_sheet(p['comm_nr'])
            Sheet1.append(["Supplier", "Part No",'Description','Qty','Landed Cost','Stock Consumed'])
            projData = projectObj.filter(comm_nr__exact=p['comm_nr'])
            print projData
            for i in projData:
                toReturn =[]
                bomObj=BoM.objects.filter(project__id=i.pk)
                materialObj=MaterialIssueMain.objects.filter(project__id=i.pk)
                for k in materialObj:
                        materialdata= k.materialIssue.all()
                        for m in materialdata:
                            qtyOrdered = 0
                            stockConsumed=0
                            for j in bomObj:
                                if m.product_id==j.products.pk:
                                    qtyOrdered += j.quantity1
                                    stockConsumed=m.qty
                                else:
                                    qtyOrdered=0
                                    stockConsumed=m.qty
                            Sheet1.append([i.vendor.name, m.product.part_no,m.product.description_1,qtyOrdered,m.price,stockConsumed])
        response = HttpResponse(content=save_virtual_workbook(workbook),content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename=stockConsumed.xlsx'
        return response




class CreateStockReportDataAPIView(APIView):
    renderer_classes = (JSONRenderer,)
    def get(self , request , format = None):
        print  request.GET
        toRet = {'status':'Invalid Data'}
        dtime = datetime.datetime.now()
        dt = dtime.date()
        print dtime,dt
        if StockSummaryReport.objects.filter(dated=dt).exists():
            print 'already createddddddddd'
            return Response({'status':'Data Has Already Created'},status=status.HTTP_200_OK)
        prodObj = Products.objects.filter(created__lte=dtime)
        print 'total {0} Productsssssssss'.format(prodObj.count())
        stockTotal = 0
        for i in prodObj:
            invtObjs = Inventory.objects.filter(product=i,created__lte=dtime)
            if invtObjs.count()>0:
                total = invtObjs.aggregate(total=Sum(F('qty') * F('rate')))['total']
                stockTotal += total
        print 'total valueeeeeeeeeee',stockTotal
        if stockTotal>0:
            ssReportObj = StockSummaryReport.objects.create(dated=dt,stockValue=stockTotal)
            projectsObjs=Projects.objects.filter(Q(status='approved')|Q(status='ongoing'),savedStatus=False,junkStatus=False,created__lte=dtime)
            print projectsObjs.count()
            projStackSummary = []
            for i in projectsObjs:
                matIssMainObjs = MaterialIssueMain.objects.filter(project=i,created__lte=dtime)
                if matIssMainObjs.count()>0:
                    vl = 0
                    for j in matIssMainObjs:
                        matIssueObjs = j.materialIssue.all()
                        tot = matIssueObjs.aggregate(total=Sum(F('qty') * F('price')))['total']
                        vl += tot
                    projStackSummary.append(ProjectStockSummary(stockReport=ssReportObj,value=vl,title=i.title))
                else:
                    pass
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

        rptPkList = list(reportsObj.values_list('pk',flat=True))
        projStokObjs = ProjectStockSummary.objects.filter(stockReport__in=rptPkList)
        unqTitles = list(projStokObjs.values_list('title',flat=True).distinct())

        toReturn = []
        hd = ['Date','Stock value at ware house']
        hd += unqTitles
        # for i in unqTitles:
        #     hd.append('Consumption Of Stock - '+i)
        toReturn.append(hd)

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
        print toReturn

        return ExcelResponse(toReturn, 'Stock_Summary' , 'Stock Summary')

class DownloadInvoiceReportAPIView(APIView):
    renderer_classes = (JSONRenderer,)
    def get(self , request , format = None):
        projectObj = Projects.objects.filter(Q(status='approved')|Q(status='ongoing'),junkStatus=False,savedStatus=False)
        toReturn = [['Purchase Order Ref','Supplier','Invoice No.','BOE']]
        for p in projectObj:
            sam = []
            sam.append(p.poNumber)
            sam.append(p.vendor.name)
            sam.append(p.invoiceNumber)
            sam.append(p.boeRefNumber)
            toReturn.append(sam)
        return ExcelResponse(toReturn, 'Invoice_BOE' , 'Invoice BOE')
