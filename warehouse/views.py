
from __future__ import unicode_literals
from django.shortcuts import render
from url_filter.integrations.drf import DjangoFilterBackend
from rest_framework import viewsets , permissions , serializers
from API.permissions import *
from rest_framework.views import APIView
from excel_response import ExcelResponse
from io import BytesIO
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from clientRelationships.views import expanseReportHead,addPageNumber,PageNumCanvas,FullPageImage
from reportlab import *
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4,letter, landscape,inch
from reportlab.lib.units import cm, mm
from reportlab.lib import colors , utils
from reportlab.platypus import Paragraph, Table, TableStyle, Image, Frame, Spacer, PageBreak, BaseDocTemplate, PageTemplate, SimpleDocTemplate, Flowable
from PIL import Image
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet, TA_CENTER
from reportlab.graphics import barcode , renderPDF
from reportlab.graphics.shapes import *
from reportlab.graphics.barcode.qr import QrCodeWidget
import json
import pytz
import requests
from .models import *
from .serializers import *
from django.conf import settings as globalSettings
from django.db.models import Q
import time
import datetime
from django.template.loader import render_to_string, get_template
from django.core.mail import send_mail, EmailMessage
from dateutil import parser as date_parser
from num2words import num2words
import random
import ast
from datetime import timedelta

class ServiceViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated , )
    serializer_class = ServiceSerializer
    queryset = Service.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name']

class ContactViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated , )
    serializer_class = ContactSerializer
    queryset = Contact.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name',]

class ContractViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated , )
    serializer_class = ContractSerializer
    queryset = Contract.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['company']

class InvoiceViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated , )
    serializer_class = InvoiceSerializer
    queryset = Invoice.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['contract','status']

class SpaceViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated , )
    serializer_class = SpaceSerializer
    queryset = Space.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name']

class CheckinViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated , )
    serializer_class = CheckinsSerializer
    queryset = Checkin.objects.all().order_by('-qty')
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['contract' ,'description']

class CheckoutViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated , )
    serializer_class = CheckoutSerializer
    queryset = Checkout.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['parent']

class CustomerCommodityViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated , )
    serializer_class = CustomerCommoditySerializer
    queryset = CustomerCommodity.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['contact']

class CommodityViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated , )
    serializer_class = CommoditySerializer
    queryset = Commodity.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['contract','customercommodity']

class CommodityQtyViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated , )
    serializer_class = CommodityQtySerializer
    queryset = CommodityQty.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['commodity']




themeColor = colors.HexColor('#227daa')

styles=getSampleStyleSheet()
styleN = styles['Normal']
styleH = styles['Heading1']


settingsFields = application.objects.get(name = 'app.clientRelationships').settings.all()



class FullPageImage(Flowable):
    def __init__(self , img):
        Flowable.__init__(self)
        self.image = img

    def draw(self):
        img = utils.ImageReader(self.image)

        iw, ih = img.getSize()
        aspect = ih / float(iw)
        width, self.height = PAGE_SIZE
        width -= 3.5*cm
        self.canv.drawImage(os.path.join(BASE_DIR , self.image) , -1 *MARGIN_SIZE + 1.5*cm , -1* self.height + 5*cm , width, aspect*width)

class expanseReportHead(Flowable):

    def __init__(self, request , contract):
        Flowable.__init__(self)
        self.req = request
        self.contract = contract
    #----------------------------------------------------------------------
    def draw(self):
        """
        draw the floable
        """
        # print self.invoice.status
        now = datetime.datetime.now(pytz.timezone('Asia/Kolkata'))
        # print self.invoice.status
        # if self.invoice.status in ['quoted']:
        #     docTitle = 'SALES QUOTATION'
        # else:
        docTitle = 'TAX INVOICE'

        passKey = '%s%s'%(str(self.req.user.date_joined.year) , self.req.user.pk) # also the user ID
        docID = '%s%s' %( now.year , self.contract.pk)


        pSrc = '''
        <font size=14>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<u>%s</u></font><br/><br/><br/>
        <font size=9>
        <strong>Generated by:</strong> %s<br/>
        <strong>On:</strong> %s<br/><br/>
        <strong>Document ID:</strong> %s<br/><br/>
        </font>
        ''' % ( docTitle , '%s %s (%s)' %(self.req.user.first_name ,self.req.user.last_name , passKey )  , now.strftime("%d-%B-%Y - %H:%M:%S") , docID)

        story = []
        head = Paragraph(pSrc , styleN)
        head.wrapOn(self.canv , 200*mm, 50*mm)
        head.drawOn(self.canv , 0*mm, -10*mm)

        # barcode_value = "1234567890"
        # barcode39 = barcode.createBarcodeDrawing('EAN13', value = barcode_value,barWidth=0.3*mm,barHeight=10*mm)
        #
        # barcode39.drawOn(self.canv,160*mm,0*mm)
        # self.canv.drawImage(os.path.join(BASE_DIR , 'logo.png') , 80*mm , 0*mm , 2*cm, 2*cm)

def addPageNumber(canvas, doc):
    """
    Add the page number
    """
    print doc.contract
    now = datetime.datetime.now(pytz.timezone('Asia/Kolkata'))
    passKey = '%s%s'%(str(doc.request.user.date_joined.year) , doc.request.user.pk) # also the user ID
    docID = '%s%s' %( now.year , doc.contract.pk)

    qrw = QrCodeWidget('http://cioc.co.in/documents?id=%s&passkey=%s&app=crmInvoice' %(docID , passKey))
    b = qrw.getBounds()

    w=b[2]-b[0]
    h=b[3]-b[1]

    d = Drawing(60,60,transform=[60./w,0,0,60./h,0,0])
    d.add(qrw)
    renderPDF.draw(d, canvas ,180*mm,270*mm)

    pass

    # page_num = canvas.getPageNumber()
    # text = "<font size='8'>Page #%s</font>" % page_num
    # p = Paragraph(text , styleN)
    # p.wrapOn(canvas , 50*mm , 10*mm)
    # p.drawOn(canvas , 100*mm , 10*mm)



class PageNumCanvas(canvas.Canvas):

    #----------------------------------------------------------------------
    def __init__(self, *args, **kwargs):
        """Constructor"""
        canvas.Canvas.__init__(self, *args, **kwargs)
        self.pages = []

    #----------------------------------------------------------------------
    def showPage(self):
        """
        On a page break, add information to the list
        """
        self.pages.append(dict(self.__dict__))
        self._startPage()

    #----------------------------------------------------------------------
    def save(self):
        """
        Add the page number to each page (page x of y)
        """
        page_count = len(self.pages)


        for page in self.pages:
            self.__dict__.update(page)
            # self.draw_page_number(page_count)
            self.drawLetterHeadFooter()
            canvas.Canvas.showPage(self)

        canvas.Canvas.save(self)

themeColor = colors.HexColor('#227daa')

styles=getSampleStyleSheet()
styleN = styles['Normal']
styleH = styles['Heading1']


settingsFields = application.objects.get(name = 'app.clientRelationships').settings.all()


class FullPageImage(Flowable):
    def __init__(self , img):
        Flowable.__init__(self)
        self.image = img

    def draw(self):
        img = utils.ImageReader(self.image)

        iw, ih = img.getSize()
        aspect = ih / float(iw)
        width, self.height = PAGE_SIZE
        width -= 3.5*cm
        self.canv.drawImage(os.path.join(BASE_DIR , self.image) , -1 *MARGIN_SIZE + 1.5*cm , -1* self.height + 5*cm , width, aspect*width)

class expanseReportHead(Flowable):

    def __init__(self, request , contract):
        Flowable.__init__(self)
        self.req = request
        self.contract = contract
    #----------------------------------------------------------------------
    def draw(self):
        """
        draw the floable
        """
        # print self.invoice.status
        now = datetime.datetime.now(pytz.timezone('Asia/Kolkata'))
        # print self.invoice.status
        # if self.invoice.status in ['quoted']:
        #     docTitle = 'SALES QUOTATION'
        # else:
        docTitle = 'TAX INVOICE'

        passKey = '%s%s'%(str(self.req.user.date_joined.year) , self.req.user.pk) # also the user ID
        docID = '%s%s' %( now.year , self.contract.pk)


        pSrc = '''
        <font size=14>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<u>%s</u></font><br/><br/><br/>
        <font size=9>
        <strong>Generated by:</strong> %s<br/>
        <strong>On:</strong> %s<br/><br/>
        <strong>Document ID:</strong> %s<br/><br/>
        </font>
        ''' % ( docTitle , '%s %s (%s)' %(self.req.user.first_name ,self.req.user.last_name , passKey )  , now.strftime("%d-%B-%Y - %H:%M:%S") , docID)

        story = []
        head = Paragraph(pSrc , styleN)
        head.wrapOn(self.canv , 200*mm, 50*mm)
        head.drawOn(self.canv , 0*mm, -10*mm)

        # barcode_value = "1234567890"
        # barcode39 = barcode.createBarcodeDrawing('EAN13', value = barcode_value,barWidth=0.3*mm,barHeight=10*mm)
        #
        # barcode39.drawOn(self.canv,160*mm,0*mm)
        # self.canv.drawImage(os.path.join(BASE_DIR , 'logo.png') , 80*mm , 0*mm , 2*cm, 2*cm)

def addPageNumber(canvas, doc):
    """
    Add the page number
    """
    print doc.contract
    now = datetime.datetime.now(pytz.timezone('Asia/Kolkata'))
    passKey = '%s%s'%(str(doc.request.user.date_joined.year) , doc.request.user.pk) # also the user ID
    docID = '%s%s' %( now.year , doc.contract.pk)

    qrw = QrCodeWidget('http://cioc.co.in/documents?id=%s&passkey=%s&app=crmInvoice' %(docID , passKey))
    b = qrw.getBounds()

    w=b[2]-b[0]
    h=b[3]-b[1]

    d = Drawing(60,60,transform=[60./w,0,0,60./h,0,0])
    d.add(qrw)
    renderPDF.draw(d, canvas ,180*mm,270*mm)

    pass

    # page_num = canvas.getPageNumber()
    # text = "<font size='8'>Page #%s</font>" % page_num
    # p = Paragraph(text , styleN)
    # p.wrapOn(canvas , 50*mm , 10*mm)
    # p.drawOn(canvas , 100*mm , 10*mm)



class PageNumCanvas(canvas.Canvas):

    #----------------------------------------------------------------------
    def __init__(self, *args, **kwargs):
        """Constructor"""
        canvas.Canvas.__init__(self, *args, **kwargs)
        self.pages = []

    #----------------------------------------------------------------------
    def showPage(self):
        """
        On a page break, add information to the list
        """
        self.pages.append(dict(self.__dict__))
        self._startPage()

    #----------------------------------------------------------------------
    def save(self):
        """
        Add the page number to each page (page x of y)
        """
        page_count = len(self.pages)

        for page in self.pages:
            self.__dict__.update(page)
            # self.draw_page_number(page_count)
            self.drawLetterHeadFooter()
            canvas.Canvas.showPage(self)

        canvas.Canvas.save(self)



    #----------------------------------------------------------------------
    def draw_page_number(self, page_count):
        """
        Add the page number
        """

        text = "<font size='8'>Page #%s of %s</font>" % (self._pageNumber , page_count)
        p = Paragraph(text , styleN)
        p.wrapOn(self , 50*mm , 10*mm)
        p.drawOn(self , 100*mm , 10*mm)

    def drawLetterHeadFooter(self):
        self.setStrokeColor(themeColor)
        self.setFillColor(themeColor)
        self.rect(0,0,1500,70, fill=True)
        # print dir(self)
        compNameStyle = styleN.clone('footerCompanyName')
        compNameStyle.textColor = colors.white;
        print '*******************',settingsFields.get(name = 'bankDetails').value

        p = Paragraph(settingsFields.get(name = 'companyName').value , compNameStyle)
        p.wrapOn(self , 70*mm , 10*mm)
        p.drawOn(self , 80*mm  , 18*mm)

        p1 = Paragraph(settingsFields.get(name = 'companyAddress').value , compNameStyle)
        p1.wrapOn(self , 300*mm , 10*mm)
        p1.drawOn(self , 4*mm  , 10*mm)


        p2 = Paragraph( settingsFields.get(name = 'contactDetails').value, compNameStyle)
        p2.wrapOn(self , 200*mm , 10*mm)
        p2.drawOn(self , 9*mm  , 4*mm)

        from svglib.svglib import svg2rlg
        drawing = svg2rlg(os.path.join(globalSettings.BASE_DIR , 'static_shared','images' , 'anchor_icon.svg'))
        sx=sy=2
        drawing.width,drawing.height = drawing.minWidth()*sx, drawing.height*sy
        drawing.scale(sx,sy)
        #if you want to see the box around the image
        # drawing._showBoundary = True
        renderPDF.draw(drawing, self,10*mm  , self._pagesize[1]-20*mm)

        #width = self._pagesize[0]
        # page = "Page %s of %s" % (, page_count)
        # self.setFont("Helvetica", 9)
        # self.drawRightString(195*mm, 272*mm, page)


def genInvoice(response , contract,invoiceobj, request):


    MARGIN_SIZE = 8 * mm
    PAGE_SIZE = A4

    # c = canvas.Canvas("hello.pdf")
    # c.drawString(9*cm, 19*cm, "Hello World!")

    pdf_doc = SimpleDocTemplate(response, pagesize = PAGE_SIZE,
        leftMargin = MARGIN_SIZE, rightMargin = MARGIN_SIZE,
        topMargin = 4*MARGIN_SIZE, bottomMargin = 3*MARGIN_SIZE)

    # data = [['', '', '', 'Grand Total', '' , pFooterGrandTotal]]

    pdf_doc.contract = contract
    pdf_doc.request = request

    tableHeaderStyle = styles['Normal'].clone('tableHeaderStyle')
    tableHeaderStyle.textColor = colors.white;
    tableHeaderStyle.fontSize = 7

    pHeadProd = Paragraph('<strong>Product/<br/>Service</strong>' , tableHeaderStyle)
    pHeadDetails = Paragraph('<strong>Details</strong>' , tableHeaderStyle)
    pHeadTaxCode = Paragraph('<strong>HSN/<br/>SAC</strong>' , tableHeaderStyle)
    pHeadQty = Paragraph('<strong>Qty</strong>' , tableHeaderStyle)
    pHeadPrice = Paragraph('<strong>Rate</strong>' , tableHeaderStyle)
    pHeadTotal = Paragraph('<strong>Total</strong>' , tableHeaderStyle)
    pHeadTax  = Paragraph('<strong>IGST <br/> Tax</strong>' , tableHeaderStyle)
    pHeadSubTotal = Paragraph('<strong>Sub Total</strong>' , tableHeaderStyle)

    # # bookingTotal , bookingHrs = getBookingAmount(o)
    #
    # pFooterQty = Paragraph('%s' % ('o.quantity') , styles['Normal'])
    # pFooterTax = Paragraph('%s' %('tax') , styles['Normal'])
    # pFooterTotal = Paragraph('%s' % (1090) , styles['Normal'])
    # pFooterGrandTotal = Paragraph('%s' % ('INR 150') , tableHeaderStyle)

    data = [[ pHeadProd, pHeadDetails, pHeadTaxCode, pHeadPrice , pHeadQty, pHeadTotal, pHeadTax ,pHeadSubTotal ]]


    totalQuant = 0
    totalTax = 0
    grandTotal = 0
    tableBodyStyle = styles['Normal'].clone('tableBodyStyle')
    tableBodyStyle.fontSize = 7


    for i in json.loads(invoiceobj.data):
        print i
        pDescSrc = i['desc']

        # totalQuant += i['quantity']
        #
        # print i
        #
        # if 'price' not in i:
        #     print "Continuing"
        #     continue

        # i['subTotalTax'] = i['data']['price'] * i['quantity'] * ( i['data']['productMeta']['taxRate']/float(100))
        #
        # i['subTotal'] = i['data']['price'] * i['quantity'] * (1+ i['data']['productMeta']['taxRate']/float(100))

        totalQuant += i['quantity']
        totalTax += i['totalTax']
        grandTotal += i['subtotal']

        pBodyProd = Paragraph('Service' , tableBodyStyle)
        pBodyTitle = Paragraph( pDescSrc , tableBodyStyle)
        pBodyQty = Paragraph(str(i['quantity']) , tableBodyStyle)
        pBodyPrice = Paragraph(str(i['rate']) , tableBodyStyle)
        # if 'taxCode' in i:
        if 'taxCode' in i:
            taxCode = '%s(%s %%)' %(i['taxCode'] , i['tax'])
        else:
            taxCode = ''

        pBodyTaxCode = Paragraph(taxCode , tableBodyStyle)
        pBodyTax = Paragraph(str(i['totalTax']) , tableBodyStyle)
        pBodyTotal = Paragraph(str(i['quantity']*i['rate']) , tableBodyStyle)
        pBodySubTotal = Paragraph(str(i['subtotal']) , tableBodyStyle)


        data.append([pBodyProd, pBodyTitle,pBodyTaxCode, pBodyPrice, pBodyQty, pBodyTotal, pBodyTax , pBodySubTotal])

    contract.subTotal = grandTotal
    invoiceobj.grandTotal = grandTotal
    invoiceobj.save()
    # invoice.saveInvoiceForm()

    tableGrandStyle = tableHeaderStyle.clone('tableGrandStyle')
    tableGrandStyle.fontSize = 10


    data += [['', '','','', '', '',Paragraph(str(totalTax) , tableBodyStyle)  , Paragraph(str(grandTotal) , tableBodyStyle) ],
            ['', '', '', '', '',  Paragraph('sub Total (INR)' , tableHeaderStyle), '' , Paragraph(str(grandTotal) , tableGrandStyle)]]
    t=Table(data)
    ts = TableStyle([('ALIGN',(1,1),(-3,-3),'RIGHT'),
                ('VALIGN',(0,1),(-1,-3),'TOP'),
                ('VALIGN',(0,-2),(-1,-2),'TOP'),
                ('VALIGN',(0,-1),(-1,-1),'TOP'),
                ('SPAN',(-3,-1),(-2,-1)),
                ('TEXTCOLOR',(0,0),(-1,0) , colors.white),
                ('BACKGROUND',(0,0),(-1,0) , themeColor),
                ('LINEABOVE',(0,0),(-1,0),0.25,themeColor),
                ('LINEABOVE',(0,1),(-1,1),0.25,themeColor),
                ('BACKGROUND',(-2,-2),(-1,-2) , colors.HexColor('#eeeeee')),
                ('BACKGROUND',(-3,-1),(-1,-1) , themeColor),
                ('LINEABOVE',(-2,-2),(-1,-2),0.25,colors.gray),
                ('LINEABOVE',(0,-1),(-1,-1),0.25,colors.gray),
                # ('LINEBELOW',(0,-1),(-1,-1),0.25,colors.gray),
            ])
    t.setStyle(ts)
    t._argW[0] = 1.5*cm
    t._argW[1] = 6*cm
    t._argW[2] = 2.4*cm
    t._argW[3] = 2*cm
    t._argW[4] = 2*cm
    t._argW[5] = 2*cm
    t._argW[6] = 1.6*cm
    t._argW[7] = 2*cm

    #add some flowables

    story = []

    expHead = expanseReportHead(request , contract)
    story.append(Spacer(2.5,2*cm))
    story.append(expHead)
    story.append(Spacer(2.5,0.75*cm))

    adrs = contract.company

    if contract.company.tin is None:
        tin = 'NA'
    else:
        tin = contract.company.tin

    summryParaSrc = """
    <font size='11'><strong>Customer details:</strong></font> <br/><br/>
    <font size='9'>
    %s<br/>
    %s<br/>
    %s<br/>
    %s , %s<br/>
    %s<br/>
    <strong>GSTIN:</strong>%s<br/>
    </font>
    """ %(contract.company.name ,contract.company.street , contract.company.city ,contract.company.state , contract.company.pincode , contract.company.country , contract.company.tin)
    story.append(Paragraph(summryParaSrc , styleN))
    story.append(t)
    story.append(Spacer(2.5,0.5*cm))

    summryParaSrc = settingsFields.get(name = 'bankDetails').value
    story.append(Paragraph(summryParaSrc , styleN))


    pdf_doc.build(story,onFirstPage=addPageNumber, onLaterPages=addPageNumber, canvasmaker=PageNumCanvas)



class DownloadInvoice(APIView):
    renderer_classes = (JSONRenderer,)
    def get(self , request , format = None):
        print 'cccccccccccccccccccccccccc'
        if 'contract' not in request.GET:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        if 'saveOnly' in request.GET:
            return Response(status=status.HTTP_200_OK)

        response = HttpResponse(content_type='application/pdf')
        print request.GET['contract']

        o = Contract.objects.get(id = request.GET['contract'])
        invoiceobj=Invoice.objects.get(contract=request.GET['contract'],pk=request.GET['inoicePk'])
        print o
        # o = Invoice.objects.get(contract = request.GET['contract'])
        response['Content-Disposition'] = 'attachment; filename="invoicedownload%s%s.pdf"' %( datetime.datetime.now(pytz.timezone('Asia/Kolkata')).year , o.pk)
        genInvoice(response , o ,invoiceobj, request)


        return response


class DashboardInvoices(APIView):
    renderer_classes = (JSONRenderer,)
    def get(self , request , format = None):
        print 'cccccccccccccccccccccccccc'
        if 'cName' in request.GET:
            print request.GET['cName']
            toReturn = Invoice.objects.filter(~Q(status='received'),contract__company__name__icontains=request.GET['cName']).values('pk','contract__company__name','status','dueDate','billedDate')
        else:
            toReturn = Invoice.objects.filter(~Q(status='received')).values('pk','contract__company__name','status','dueDate','billedDate')
        print toReturn
        return Response(toReturn, status=status.HTTP_200_OK)



class SendNotificationAPIView(APIView):
    renderer_classes = (JSONRenderer,)
    def post(self , request , format = None):
        print request.data
        toEmail = []
        cc = []

        if request.data['sendEmail']:
            for c in request.data['contacts']:
                em = Contact.objects.get(pk=c).email
                if em is not None:
                    toEmail.append(em)
            print toEmail

            for c in request.data['internal']:
                p = profile.objects.get(user_id = c)
                u = User.objects.get(pk = c)
                cc.append(u.email)
            print cc

        toSMS = []
        if request.data['sendSMS']:
            for c in request.data['contacts']:
                mob = Contact.objects.get(pk=c).mobile
                if mob is not None:
                    toSMS.append(mob)
            print toSMS

        c = Invoice.objects.get(pk = request.data['contract'])

        # print dir(att)
        # return Response(status=status.HTTP_200_OK)

        docID = '%s%s%s' %(c.contract.pk, c.billedDate.year , c.pk)
        value = c.grandTotal

        typ = request.data['type']
        print "will send invoice generated mail to " , toEmail , cc , toSMS
        print docID , value
        if typ == 'invoiceGenerated':
            email_subject = 'Invoice %s generated'%(docID)
            heading = 'Invoice Generated'
            msgBody = ['We are pleased to share invoice number <strong>%s</strong> for the amount of INR <strong>%s</strong>.' %(docID , value) , 'The due date to make payment is <strong>%s</strong>.' %(c.dueDate) , 'In case you have any query please contact us.']
            smsBody = 'Invoice %s generated for the amount of INR %s. Due date is %s. Please check youe email for more information.'%(docID , value, c.dueDate)
        elif typ == 'dueDateReminder':
            email_subject = 'Payment reminder for invoice %s'%(docID)
            heading = 'Payment reminder'
            msgBody = ['We are sorry but invoice number <strong>%s</strong> for the amount of INR <strong>%s</strong> is still unpaid.' %(docID , value) , 'The due date to make the payment is <strong>%s</strong>. Please make payment at the earliest to avoid late payment fee.' %(c.dueDate) , 'In case you have any query please contact us.']
            smsBody = 'REMINDER : Invoice no. %s is sill unpaid. Due date is %s. Please ignore if paid.'%(docID , c.dueDate)
        elif typ == 'dueDateElapsed':
            email_subject = 'Payment overdue for invoice number %s'%(docID)
            heading = 'Due date missed'
            msgBody = ['We are pleased to share the updated copy of invoice number <strong>%s</strong> for the amount of INR <strong>%s</strong> including the late payment fees.' %(docID , value) , 'The payment is now due <strong>Immediately</strong>.' , 'In case you have any query please contact us.']
            smsBody = 'ALERT : Invoice no. %s updated to include late payment fee. Please pay immediately. Check your email for more info.'%(docID)

        ctx = {
            'heading' : heading,
            'recieverName' : Contact.objects.get(pk=request.data['contacts'][0]).name,
            'message': msgBody,
            'linkUrl': 'cioc.co.in',
            'linkText' : 'View Online',
            'sendersAddress' : '(C) CIOC FMCG Pvt Ltd',
            'sendersPhone' : '841101',
            'linkedinUrl' : 'https://www.linkedin.com/company/13440221/',
            'fbUrl' : 'facebook.com',
            'twitterUrl' : 'twitter.com',
        }

        email_body = get_template('app.clientRelationships.email.html').render(ctx)
        msg = EmailMessage(email_subject, email_body, to= toEmail, cc= cc, from_email= 'do_not_reply@cioc.co.in' )
        msg.content_subtype = 'html'

        if typ != 'dueDateReminder':
            fp = open('./media_root/clientRelationships/doc%s%s_%s.pdf'%(c.contract.pk, c.pk, c.status) , 'rb')
            att = MIMEApplication(fp.read(),_subtype="pdf")
            fp.close()
            att.add_header('Content-Disposition','attachment',filename=fp.name.split('/')[-1])
            msg.attach(att)

        msg.send()

        for n in toSMS:
            url = globalSettings.SMS_API_PREFIX + 'number=%s&message=%s'%(n , smsBody)
            requests.get(url)

        return Response(status=status.HTTP_200_OK)

class DownloadExcelReponse(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    def get(self , request , format = None):
        if 'contractData' in request.GET:
            obj = Commodity.objects.filter(contract=request.GET['contractData'])
        else:
            obj = Commodity.objects.filter(customercommodity=request.GET['contactData'])
        toReturn = []
        for i in obj:
            toReturn.append({"Name":i.name, "Quantity":i.qty,'Type':i.typ})
            print toReturn
        return ExcelResponse(toReturn)


class DownloadReceipt(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    def get(self , request , format = None):
        print "aaaaaaaaaaaaaaaaaaaaaaaaa"
        frm = datetime.datetime.strptime(request.GET["fromDate"],'%Y-%m-%dT%H:%M:%S.%fZ' )
        toD = datetime.datetime.strptime(request.GET["to"],'%Y-%m-%dT%H:%M:%S.%fZ' )
        obj = CommodityQty.objects.filter(commodity=int(request.GET['commodity']),created__range =(datetime.datetime.combine(frm, datetime.time.min),datetime.datetime.combine(toD, datetime.time.max)))
        print obj
        toReturn = []
        for i in obj:
            toReturn.append({"Dtae":i.created, "Check In":i.checkIn, "Check Out":i.checkOut, "Remaining Qty.":i.balance })
            print toReturn
        return ExcelResponse(toReturn)


def genCargo(response,commodityData,customerData,companyData,request):
        cm = 2.54
        elements = []
        s = getSampleStyleSheet()
        s = s["BodyText"]
        s.wordWrap = 'CJK'
        MARGIN_SIZE = 8 * mm
        PAGE_SIZE = A4

        # c = canvas.Canvas("hello.pdf")
        # c.drawString(9*cm, 19*cm, "Hello World!")

        doc = SimpleDocTemplate(response, pagesize = PAGE_SIZE,
            leftMargin = MARGIN_SIZE, rightMargin = MARGIN_SIZE,
            topMargin = 4*MARGIN_SIZE, bottomMargin = 3*MARGIN_SIZE)
        x = datetime.datetime.now()
        date = x.strftime("%x")
        # doc = SimpleDocTemplate(response, rightMargin=10 *cm, leftMargin=6.5 * cm, topMargin=10 * cm, bottomMargin=0)
        rowhead = [['CARGO RECEIPT\n']]
        tablehead = Table(rowhead, colWidths=(191*mm))
        stylehead = TableStyle([
                           ('ALIGN',(1,1),(-3,-3),'RIGHT'),
                           ('VALIGN',(0,0),(0,-1),'MIDDLE'),
                           ('ALIGN',(0,-1),(-1,-1),'CENTER'),
                           ('INNERGRID', (0,0), (-1,-1), 0.25, colors.white),
                           ('BOX', (0,0), (-1,-1), 0.25, colors.white),
                           ])
        tablehead.setStyle(TableStyle([('FONTSIZE',(0,0),(0,0),15),
                        ]))

        tableHeaderStyle = styles['Normal'].clone('tableHeaderStyle')
        tableHeaderStyle.textColor = colors.white;
        tableHeaderStyle.fontSize = 7
        compStyle = styleN.clone('footerCompanyName')
        compStyle.textColor = colors.black;
        story=[]
        heading = Paragraph('<strong>Agent/Contractor Name : </strong>' , compStyle)
        story.append(heading)
        cmpName = Paragraph(settingsFields.get(name = 'companyName').value +'<br/><br/>', compStyle)
        story.append(cmpName)
        cmpAddr = Paragraph(settingsFields.get(name = 'companyAddress').value +'<br/><br/>', compStyle)
        story.append(cmpAddr)
        cmpGst = Paragraph('GSTIN : ' +settingsFields.get(name = 'gst').value +'<br/><br/>' , compStyle)
        story.append(cmpGst)
        customer = []
        heading = Paragraph('<strong>Customer Details : </strong>' , compStyle)
        # headingcus = Paragraph('<strong>Agent/Contractor Name : </strong>' , compStyle)
        customer.append(heading)
        if companyData != 'null':
            name = Paragraph(str(companyData.company.name), compStyle)
            customer.append(name)
            street = Paragraph( str(companyData.company.street)   , compStyle)
            customer.append(street)
            city = Paragraph( str(companyData.company.city)    , compStyle)
            customer.append(city)
            state =Paragraph( str(companyData.company.state)+ ' - ' + str(companyData.company.pincode)   , compStyle)
            customer.append(state)
            country = Paragraph( str(companyData.company.country)  , compStyle)
            customer.append(country)
            space = Paragraph('<br/> <br/> <br/> '  , compStyle)
            customer.append(space)
        else:
            name = Paragraph(str(customerData.contact.name), compStyle)
            customer.append(name)
            cname = Paragraph(str(customerData.contact.company.name), compStyle)
            customer.append(cname)
            street = Paragraph( str(customerData.contact.company.street)   , compStyle)
            customer.append(street)
            city = Paragraph( str(customerData.contact.company.city)    , compStyle)
            customer.append(city)
            state =Paragraph( str(customerData.contact.company.state) + ' - '  + str(customerData.contact.company.pincode)    , compStyle)
            customer.append(state)
            country = Paragraph( str(customerData.contact.company.country)  , compStyle)
            customer.append(country)
            space = Paragraph('<br/> <br/> <br/> '  , compStyle)
            customer.append(space)

        row0 = [[story, customer ]]
        # row0 = [[story, 'Customer Details : \n' + str(companyData.company.name) + '\n' + str(companyData.company.street) + '\n' + str(companyData.company.city) + '\n' + str(companyData.company.state) + '-' + str(companyData.company.pincode) + '\n' + str(companyData.company.country) +'\n '  ]]
        table0 = Table(row0, colWidths=(95.5*mm, 95.5*mm))
        row1 = [['Description','No.of Packages','Weight/Vol', 'Comments'],['This is to confirm receipt of the following goods into the Warehouse\n'  + str(commodityData.commodity.name) + '\n \n \n \n Bill of Entry No: \n Date: \n Container Number: \n Truck Number: \n Driver Name: \n','\n' + str(commodityData.checkIn) + '\n \n \n \n  \n \n \n \n \n','' ,'']]
        table = Table(row1, colWidths=(114*mm, 27*mm,25*mm, 25*mm))
        rowdetails = [['Receipt No : 0'+str(commodityData.pk)+ '\nDate of Warehousing : ' +commodityData.created.strftime("%x") ,'\nDocument Ref. No :  \nDocument Date:  \n ']]
        tabledetails = Table(rowdetails, colWidths=(95.5*mm, 95.5*mm))
        row2 = [['','' ,'' ,'']]
        table2 = Table(row2, colWidths=(114*mm, 27*mm,25*mm, 25*mm))
        row3 = [['','']]
        table3 = Table(row3, colWidths=(166*mm,25*mm))
        stylebottom = TableStyle([
                           ('ALIGN',(1,1),(-3,-3),'RIGHT'),
                           ('VALIGN',(0,0),(0,-1),'MIDDLE'),
                           ('ALIGN',(0,-1),(-1,-1),'CENTER'),
                           ('INNERGRID', (0,0), (-1,-1), 0.25, colors.black),
                           ('BOX', (0,0), (-1,-1), 0.25, colors.black),
                           ])
        style = TableStyle([
                           ('ALIGN',(1,1),(-3,-3),'RIGHT'),
                           ('VALIGN',(0,0),(0,-1),'MIDDLE'),
                           ('ALIGN',(0,-1),(-1,-1),'LEFT'),
                           ('INNERGRID', (0,0), (-1,-1), 0.25, colors.black),
                           ('BOX', (0,0), (-1,-1), 0.25, colors.black),
                           ])

        gapdata=[
                [''],
                ['']
             ]
        data4 = [[Paragraph(cell, s) for cell in row] for row in gapdata]
        gaptable = Table(data4)



        data1=[
                ['Customer/Driver Signature : ','','', 'Anchor Logistic India Pvt Ltd '],
                ['Name','','', 'Authority Signatory']
             ]
        # data3 = [[Paragraph(cell, s) for cell in row] for row in data1]
        table1 = Table(data1,rowHeights=(25*cm, 10*cm),colWidths=(70*cm, 36.5*cm, 46.5*cm,60*cm))
        styleforbottom = TableStyle([
                            ('BACKGROUND',(0,0),(1,1),colors.white),
                            ('ALIGN',(0,0),(1,-1),'LEFT'),
                            ('VALIGN',(0,0),(-1,-1),'TOP'),
                            ('ALIGN',(0,1),(-1,1),'LEFT'),
                            ('BOX', (0,0), (-1,-1), 0.25, colors.black),
                           ])
        row4 = [[' PAN No : ' +settingsFields.get(name = 'pan').value + '   SERVICE TAX : ' +settingsFields.get(name = 'gst').value]]
        table4 = Table(row4, colWidths=(191*mm))
        row5 = [['SUBJECT TO BANGALORE JURDISDICTION']]
        table5 = Table(row5, colWidths=(191*mm))
        rowfoot = [[cmpAddr]]
        tablefoot = Table(rowfoot, colWidths=(191*mm))
        stylefoot = TableStyle([
                           ('ALIGN',(1,1),(-3,-3),'CENTER'),
                           ('VALIGN',(0,0),(0,-1),'MIDDLE'),
                           ('ALIGN',(0,-1),(-1,-1),'CENTER'),
                           ('LINEABOVE', (0,1), (-1,-1), 0.25, colors.black),
                           ])
        tablefoot.setStyle(TableStyle([('FONTSIZE',(0,0),(0,0),3),
                        ]))



        # toptable.setStyle(styleforTop)
        tablehead.setStyle(stylehead)
        table.setStyle(style)
        table0.setStyle(style)
        tabledetails.setStyle(style)
        table2.setStyle(style)
        table3.setStyle(style)
        table1.setStyle(styleforbottom)
        table4.setStyle(stylebottom)
        table5.setStyle(stylebottom)
        tablefoot.setStyle(stylefoot)
        # elements.append(toptable)
        elements.append(tablehead)
        elements.append(table0)
        elements.append(tabledetails)
        elements.append(table)
        elements.append(table2)
        elements.append(table3)
        elements.append(gaptable)
        elements.append(gaptable)
        elements.append(table1)
        elements.append(table4)
        elements.append(table5)
        elements.append(tablefoot)
        doc.build(elements)

def genChallan(response,commodityData,customerData,companyData,request):
        cm = 2.54
        elements = []
        s = getSampleStyleSheet()
        s = s["BodyText"]
        s.wordWrap = 'CJK'
        MARGIN_SIZE = 8 * mm
        PAGE_SIZE = A4


        doc = SimpleDocTemplate(response, pagesize = PAGE_SIZE,
            leftMargin = MARGIN_SIZE, rightMargin = MARGIN_SIZE,
            topMargin = 4*MARGIN_SIZE, bottomMargin = 3*MARGIN_SIZE)
        x = datetime.datetime.now()
        date = x.strftime("%x")


        # doc = SimpleDocTemplate(response, rightMargin=10 *cm, leftMargin=6.5 * cm, topMargin=10 * cm, bottomMargin=0)
        rowhead = [['DELIVERY CHALLAN\n']]
        tablehead = Table(rowhead, colWidths=(191*mm))
        stylehead = TableStyle([
                           ('ALIGN',(1,1),(-3,-3),'RIGHT'),
                           ('VALIGN',(0,0),(0,-1),'MIDDLE'),
                           ('ALIGN',(0,-1),(-1,-1),'CENTER'),
                           ('INNERGRID', (0,0), (-1,-1), 0.25, colors.white),
                           ('BOX', (0,0), (-1,-1), 0.25, colors.white),
                           ])
        tablehead.setStyle(TableStyle([('FONTSIZE',(0,0),(0,0),15),
                        ]))
        compStyle = styleN.clone('footerCompanyName')
        compStyle.textColor = colors.black;
        story=[]
        heading = Paragraph('<strong>Agent/Contractor Name : </strong>' , compStyle)
        story.append(heading)
        cmpName = Paragraph(settingsFields.get(name = 'companyName').value +'<br/><br/>', compStyle)
        story.append(cmpName)
        cmpAddr = Paragraph(settingsFields.get(name = 'companyAddress').value , compStyle)
        story.append(cmpAddr)
        customer = []
        heading = Paragraph('<strong>Customer Details : </strong>' , compStyle)
        # headingcus = Paragraph('<strong>Agent/Contractor Name : </strong>' , compStyle)
        if companyData != 'null':
            name = Paragraph(str(companyData.company.name), compStyle)
            customer.append(name)
            street = Paragraph( str(companyData.company.street)   , compStyle)
            customer.append(street)
            city = Paragraph( str(companyData.company.city)    , compStyle)
            customer.append(city)
            state =Paragraph( str(companyData.company.state)+ ' - ' + str(companyData.company.pincode)   , compStyle)
            customer.append(state)
            country = Paragraph( str(companyData.company.country)  , compStyle)
            customer.append(country)
            gst = Paragraph('<strong> GSTIN : </strong>' + str(companyData.company.gst)  , compStyle)
            customer.append(gst)
            pan = Paragraph('<strong> PAN : </strong>' + str(companyData.company.pan)  , compStyle)
            customer.append(gst)
            space = Paragraph('<br/>'  , compStyle)
            customer.append(space)
        else:
            name = Paragraph(str(customerData.contact.name), compStyle)
            customer.append(name)
            cname = Paragraph(str(customerData.contact.company.name), compStyle)
            customer.append(cname)
            street = Paragraph( str(customerData.contact.company.street)   , compStyle)
            customer.append(street)
            city = Paragraph( str(customerData.contact.company.city)    , compStyle)
            customer.append(city)
            state =Paragraph( str(customerData.contact.company.state) + ' - '  + str(customerData.contact.company.pincode)    , compStyle)
            customer.append(state)
            country = Paragraph( str(customerData.contact.company.country)  , compStyle)
            customer.append(country)
            gst = Paragraph('<strong> GSTIN :  </strong>' + str(customerData.contact.company.gst)  , compStyle)
            customer.append(gst)
            pan = Paragraph('<strong> PAN :  </strong>' + str(customerData.contact.company.pan)  , compStyle)
            customer.append(pan)
            space = Paragraph('<br/> '  , compStyle)
            customer.append(space)


        row0 = [[story, customer ]]
        # row0 = [[story, 'Customer Details : \n' + str(companyData.company.name) + '\n' + str(companyData.company.street) + '\n' + str(companyData.company.city) + '\n' + str(companyData.company.state) + '-' + str(companyData.company.pincode) + '\n' + str(companyData.company.country) +'\nGSTIN : ' + companyData.company.gst + '\nPAN : ' + companyData.company.pan + '\nTIN : '  + companyData.company.tin + '\n']]
        table0 = Table(row0, colWidths=(95.5*mm, 95.5*mm))
        row1 = [['Commodity','Packages','Weight', 'Types Of \nPackages','Value' , 'AWB No' , 'B/E or S/B No' ,'Date'],[str(commodityData.commodity.name) , str(commodityData.checkOut) ,'',str(commodityData.commodity.typ),'','','',commodityData.created.strftime("%x") ],['' , '' ,'','','','','','']]
        table = Table(row1, colWidths=(41*mm, 20*mm,20*mm, 20*mm,20*mm, 20*mm,25*mm, 25*mm))
        rowdetails = [['Delivery Challan No : 0'+str(commodityData.pk) + '\nDated :' + date +  '\n  \n  ','Vehicle No : \nTime No : \nTime Out : \n']]
        tabledetails = Table(rowdetails, colWidths=(95.5*mm, 95.5*mm))
        row2 = [['\nThe above cargo is being deleivered as received from the Indian Customs/Airline/Shipper/Warehouse .\n']]
        table2 = Table(row2, colWidths=(191*mm))
        row3 = [['Mode of Delivery :']]
        table3 = Table(row3, colWidths=(191*mm))
        row6 = [['Type of Vehicle :']]
        table6 = Table(row6, colWidths=(191*mm))
        row7 = [['Driver Name :']]
        table7 = Table(row7, colWidths=(191*mm))
        row8 = [['Driver Mobile Number :']]
        table8 = Table(row8, colWidths=(191*mm))
        stylebottom = TableStyle([
                           ('ALIGN',(1,1),(-3,-3),'RIGHT'),
                           ('VALIGN',(0,0),(0,-1),'MIDDLE'),
                           ('ALIGN',(0,-1),(-1,-1),'CENTER'),
                           ('INNERGRID', (0,0), (-1,-1), 0.25, colors.black),
                           ('BOX', (0,0), (-1,-1), 0.25, colors.black),
                           ])
        style = TableStyle([
                           ('ALIGN',(1,1),(-3,-3),'RIGHT'),
                           ('VALIGN',(0,0),(0,-1),'MIDDLE'),
                           ('ALIGN',(0,-1),(-1,-1),'LEFT'),
                           ('INNERGRID', (0,0), (-1,-1), 0.25, colors.black),
                           ('BOX', (0,0), (-1,-1), 0.25, colors.black),
                           ])

        gapdata=[
                [''],
                ['']
             ]
        data4 = [[Paragraph(cell, s) for cell in row] for row in gapdata]
        gaptable = Table(data4)

        data1=[
                ['For Anchor Logistics India Pvt Ltd,',' Receivers Name/Signature : _____________________'],
                ['\n','\n Contact Number : ______________________________'],['\n\n\n________________________________________\nDelivery Agent Signature\n','\n\n\n_____________________________________________\n                 Company Seal\n']
             ]
        # data3 = [[Paragraph(cell, s) for cell in row] for row in data1]
        table1 = Table(data1, colWidths=(100*mm, 90*mm))
        styleforbottom = TableStyle([
                            ('BACKGROUND',(0,0),(1,1),colors.white),
                            ('ALIGN',(0,0),(1,-1),'LEFT'),
                            ('VALIGN',(0,0),(-1,-1),'TOP'),
                            ('ALIGN',(0,1),(-1,1),'LEFT'),
                            ('BOX', (0,0), (-1,-1), 0.25, colors.white),
                           ])
        rowfoot = [[cmpAddr]]
        tablefoot = Table(rowfoot, colWidths=(191*mm))
        stylefoot = TableStyle([
                           ('ALIGN',(1,1),(-3,-3),'CENTER'),
                           ('VALIGN',(0,0),(0,-1),'MIDDLE'),
                           ('ALIGN',(0,-1),(-1,-1),'CENTER'),
                           ('LINEABOVE', (0,0), (-1,0), 0.25, colors.black),
                           ])
        tablefoot.setStyle(TableStyle([('FONTSIZE',(0,-1),(-1,-1),3),
                        ]))



        # toptable.setStyle(styleforTop)
        tablehead.setStyle(stylehead)
        table.setStyle(style)
        table0.setStyle(style)
        tabledetails.setStyle(style)
        table2.setStyle(style)
        table3.setStyle(style)
        table6.setStyle(style)
        table7.setStyle(style)
        table8.setStyle(style)
        table1.setStyle(styleforbottom)
        tablefoot.setStyle(stylefoot)

        # elements.append(toptable)
        elements.append(tablehead)
        elements.append(table0)
        elements.append(tabledetails)
        elements.append(table)
        elements.append(table2)
        elements.append(table3)
        elements.append(table6)
        elements.append(table7)
        elements.append(table8)
        elements.append(gaptable)
        elements.append(gaptable)
        elements.append(table1)
        elements.append(tablefoot)
        doc.build(elements)

# def downloadPdf(request):
#     response = HttpResponse(content_type='application/pdf')
#     response['Content-Disposition'] = 'attachment; filename=somefilename.pdf'
#     drawTable(response)
#     return response

class DownloadPdfCheckIn(APIView):
    renderer_classes = (JSONRenderer,)
    def get(self , request , format = None):
        response = HttpResponse(content_type='application/pdf')
        if 'valPK' in request.GET:
            commodityData = CommodityQty.objects.get(id = request.GET['valPK'])
            companyData = Contract.objects.get(id = commodityData.commodity.contract.pk)
            customerData = "null"
        else:
            commodityData = CommodityQty.objects.get(id = request.GET['commPK'])
            customerData = CustomerCommodity.objects.get(id = commodityData.commodity.customercommodity.pk)
            companyData = 'null'
        response['Content-Disposition'] = 'attachment; filename="cargodownload%s%s.pdf"' %( datetime.datetime.now(pytz.timezone('Asia/Kolkata')).year , commodityData.pk)
        genCargo(response,commodityData,customerData,companyData,request)
        # f = open(os.path.join(globalSettings.BASE_DIR, 'media_root/invoice%s_%s.pdf' %
        #                       ( datetime.datetime.now(pytz.timezone('Asia/Kolkata')).year, commodityData.pk)), 'wb')
        # f.write(response.content)
        # f.close()
        # # return Response(status=status.HTTP_200_OK)
        return response

class DownloadPdfCheckOut(APIView):
    renderer_classes = (JSONRenderer,)
    def get(self , request , format = None):
        response = HttpResponse(content_type='application/pdf')
        if 'valPK' in request.GET:
            commodityData = CommodityQty.objects.get(id = request.GET['valPK'])
            companyData = Contract.objects.get(id = commodityData.commodity.contract.pk)
            customerData = "null"
        else:
            commodityData = CommodityQty.objects.get(id = request.GET['commPK'])
            customerData = CustomerCommodity.objects.get(id = commodityData.commodity.customercommodity.pk)
            companyData = 'null'
        response['Content-Disposition'] = 'attachment; filename="challandownload%s%s.pdf"' %( datetime.datetime.now(pytz.timezone('Asia/Kolkata')).year , commodityData.pk)
        genChallan(response,commodityData,customerData,companyData,request)
        return response

ones = ["", "one ","two ","three ","four ", "five ", "six ","seven ","eight ","nine ","ten ","eleven ","twelve ", "thirteen ", "fourteen ", "fifteen ","sixteen ","seventeen ", "eighteen ","nineteen "]

twenties = ["","","twenty ","thirty ","forty ", "fifty ","sixty ","seventy ","eighty ","ninety "]

thousands = ["","thousand ","million ", "billion ", "trillion ", "quadrillion ", "quintillion ", "sextillion ", "septillion ","octillion ", "nonillion ", "decillion ", "undecillion ", "duodecillion ", "tredecillion ", "quattuordecillion ", "quindecillion", "sexdecillion ", "septendecillion ", "octodecillion ", "novemdecillion ", "vigintillion "]


def num999(n):
    c = n % 10 # singles digit
    b = ((n % 100) - c) / 10 # tens digit
    a = ((n % 1000) - (b * 10) - c) / 100 # hundreds digit
    t = ""
    h = ""
    if a != 0 and b == 0 and c == 0:
        t = ones[a] + "hundred "
    elif a != 0:
        t = ones[a] + "hundred and "
    if b <= 1:
        h = ones[n%100]
    elif b > 1:
        h = twenties[b] + ones[c]
    st = t + h
    return st

def num2word(num):
	if num == 0: return 'zero'
        i = 3
        n = str(num)
        word = ""
        k = 0
        while(i == 3):
            nw = n[-i:]
            n = n[:-i]
            if int(nw) == 0:
                word = num999(int(nw)) + thousands[int(nw)] + word
            else:
                word = num999(int(nw)) + thousands[k] + word
            if n == '':
                i = i+1
            k += 1
            return word[:-1]



def genMonthlyInvoice(response,contract,frmDate,toDate,month,year,details,request):
        cm = 2.54
        elements = []
        s = getSampleStyleSheet()
        s = s["BodyText"]
        s.wordWrap = 'CJK'
        MARGIN_SIZE = 8 * mm
        PAGE_SIZE = A4

        # c = canvas.Canvas("hello.pdf")
        # c.drawString(9*cm, 19*cm, "Hello World!")

        doc = SimpleDocTemplate(response, pagesize = PAGE_SIZE,
        leftMargin = MARGIN_SIZE, rightMargin = MARGIN_SIZE,
        topMargin = 4*MARGIN_SIZE, bottomMargin = 3*MARGIN_SIZE)
        x = datetime.datetime.now()
        date = x.strftime("%x")
        days = abs((frmDate-toDate).days)
        now = datetime.datetime.now()
        idDate =  toDate.strftime("%y")

        # doc = SimpleDocTemplate(response, rightMargin=10 *cm, leftMargin=6.5 * cm, topMargin=10 * cm, bottomMargin=0)
        # rowhead = [['TAX INVOICE\n']]
        # tablehead = Table(rowhead, colWidths=(191*mm))
        stylehead = TableStyle([
                           ('ALIGN',(1,1),(-3,-3),'RIGHT'),
                           ('VALIGN',(0,0),(0,-1),'MIDDLE'),
                           ('ALIGN',(0,-1),(-1,-1),'CENTER'),
                           ('INNERGRID', (0,0), (-1,-1), 0.25, colors.white),
                           ('BOX', (0,0), (-1,-1), 0.25, colors.white),
                           ])
        # tablehead.setStyle(TableStyle([('FONTSIZE',(0,0),(0,0),15),
        #                 ]))
        compStyle = styleN.clone('footerCompanyName')
        compStyle.textColor = colors.black;

        cmpName = Paragraph(settingsFields.get(name = 'companyName').value , compStyle)

        cmpAddr = Paragraph(settingsFields.get(name = 'companyAddress').value , compStyle)

        cmpBankDetails = Paragraph(settingsFields.get(name = 'bankDetails').value , compStyle)

        cmpTin = Paragraph('<strong>CIN No : </strong>' +settingsFields.get(name = 'cin').value  , compStyle)

        cmpPan = Paragraph('<strong>PAN No : </strong>' +settingsFields.get(name = 'pan').value  , compStyle)

        cmpGst = Paragraph('<strong>GSTIN : </strong>' +settingsFields.get(name = 'gst').value  , compStyle)

        billTo = Paragraph('<strong>BILL TO : <br/> </strong>'  + str(contract.company.name) + '<br/> ' + str(contract.company.street) + '<br/> ' + str(contract.company.city) + '<br/> ' + str(contract.company.state) + '-' + str(contract.company.pincode) + '<br/> ' + str(contract.company.country) +'<br/> Tel : ' + str(contract.company.telephone)+'<br/> GSTIN : ' + str(contract.company.gst)  , compStyle)

        descdata = Paragraph('Warehouse Charges for the period/month - ' +str(month) + ' - ' +str(year)   , compStyle)

        price =  Paragraph(str(contract.rate), compStyle)
        sqrt = int(contract.areas.areaLength)*int(contract.quantity)
        area = Paragraph(str(sqrt), compStyle)
        cost = int(contract.rate)*sqrt*3

        numbers = random.sample(range(10), 2)
        invId = (''.join(map(str, numbers)))
        bamount = 0
        from reportlab.platypus.flowables import Image as GNAA
        story = []
        logo = os.path.join(globalSettings.BASE_DIR , 'static_shared','images' , 'logo1.png')
        im = GNAA(logo, width=200, height=80)
        story.append(im)

        taxi = Paragraph('<font size="18"> TAX INVOICE </font>' , compStyle)
        # contract.areas.areaLength
        row0 = [[cmpName,'',taxi], [cmpAddr,'',story]]
        table0 = Table(row0, colWidths=(73*mm,17*mm,100*mm))
        style0 = TableStyle([
                           ('VALIGN',(0,0),(0,-1),'MIDDLE'),
                           ('ALIGN',(0,-1),(-1,-1),'LEFT'),
                           ('INNERGRID', (0,0), (-1,-1), 0.25, colors.white),
                           ('BOX', (0,0), (-1,-1), 0.25, colors.white),
                           ('FONTSIZE',(0,0),(0,0),15),
                           ('SPAN',(-1,-1),(-1,-1)),
                           ])
        row1 = [[billTo ,'Number : ALWH18/'+str(month)+str(invId)+str(idDate)+ ' \nDate : ' +str(toDate).split(' ')[0]+ '\nFor : Storage & Handling ' +str(month) + ' - ' +str(year)  ]]
        table1 = Table(row1, colWidths=(95.5*mm, 95.5*mm))
        style1 = TableStyle([
                           ('ALIGN',(1,1),(-3,-3),'RIGHT'),
                           ('VALIGN',(0,0),(0,-1),'MIDDLE'),
                           ('ALIGN',(0,-1),(-1,-1),'LEFT'),
                           ('INNERGRID', (0,0), (-1,-1), 0.25, colors.white),
                           ('BOX', (0,0), (-1,-1), 0.25, colors.white),
                           ])
        row2 = [['DESCRIPTION','SAC Code','SPACE/Sft', 'RATE','UNIT' , 'AMOUNT']]
        table2 = Table(row2, colWidths=(90*mm, 20*mm,20*mm, 20*mm,20*mm, 20*mm))
        style2 = TableStyle([
                           ('ALIGN',(1,1),(-3,-3),'CENTER'),
                           ('VALIGN',(0,0),(0,-1),'MIDDLE'),
                           ('ALIGN',(0,-1),(-1,-1),'CENTER'),
                           ('INNERGRID', (0,0), (-1,-1), 0.25, colors.black),
                           ('BOX', (0,0), (-1,-1), 0.25, colors.black),
                           ])
        row3 = [[descdata,'996729',area, price,'1' , '',cost]]
        if details!='null':
            for i in details:
                dscdata = i['productMeta']['description']
                dsc = Paragraph(str(dscdata), compStyle)
                code = i['productMeta']['code']
                rate = i['rate']
                qty =  i['qty']
                amount = i['amount']
                row3 += [[dsc,code,'', rate,qty , '',amount]]
                bamount += amount
        total = bamount + cost
        if(str(contract.company.gst[0:2])=='29'):
            gst = 9
            cgst = 9
            igst = 0
            gsttotal = (int(total) * int(gst))/100
            cgsttotal = (int(total) * int(cgst))/100
            igsttotal = 0

        else:
            gst = 0
            cgst = 0
            igst = 18
            gsttotal = 0
            cgsttotal = 0
            igsttotal = (int(total) * int(igst))/100
        totaltax = gsttotal + cgsttotal + igsttotal
        gtotal = total + totaltax
        gtotalText = num2words(int(gtotal))

        table3 = Table(row3, colWidths=(90*mm, 20*mm,20*mm, 20*mm,10*mm,10*mm, 20*mm))
        style3 = TableStyle([
                           ('ALIGN',(1,1),(-3,-3),'CENTER'),
                           ('VALIGN',(0,0),(0,-1),'MIDDLE'),
                           ('ALIGN',(0,-1),(-1,-1),'LEFT'),
                           ('INNERGRID', (0,0), (-1,-1), 0.25, colors.black),
                           ('BOX', (0,0), (-1,-1), 0.25, colors.black),
                           ])
        row4 = [[cmpBankDetails,'Basic Amount', total],['','SGST    @    '+str(gst)+'%',str(gsttotal)],['','CGST    @    '+str(cgst)+'%',str(cgsttotal)],['','IGST     @    '+str(igst)+'%',str(igsttotal)],['','Income Tax Amount',str(totaltax)],[cmpPan,'Total',str(gtotal)]]
        table4 = Table(row4, colWidths=(110*mm, 60*mm,20*mm))
        style4 = TableStyle([
                           ('ALIGN',(1,1),(-3,-3),'CENTER'),
                           ('VALIGN',(0,0),(0,-1),'MIDDLE'),
                           ('ALIGN',(0,-1),(-1,0),'LEFT'),
                           ('INNERGRID', (-1,0), (-1,-1), 0.25, colors.black),
                           ('BOX', (-1,0), (-1,-1), 0.25, colors.black),
                           ('SPAN',(0,0),(0,-2)),
                           ])
        row5 = [[cmpTin,'Rupees : ' +str(gtotalText)],[cmpGst]]
        table5 = Table(row5, colWidths=(70*mm, 120*mm))
        style5 = TableStyle([
                           ('ALIGN',(1,1),(-3,-3),'CENTER'),
                           ('VALIGN',(0,0),(0,-1),'MIDDLE'),
                           ('ALIGN',(0,-1),(-1,-1),'LEFT'),
                           ('INNERGRID', (-1,0), (-1,-1), 0.25, colors.black),
                           ('BOX', (-1,0), (-1,-1), 0.25, colors.black),
                           ('INNERGRID', (-1,-1), (-1,-1), 0.25, colors.white),
                           ('BOX', (-1,-1), (-1,-1), 0.25, colors.white),
                           ('LINEABOVE', (-1,-1), (-1,-1), 0.25, colors.black),
                           ])
        payment = Paragraph('Make all payments to " '+settingsFields.get(name = 'companyName').value + ' " by T/T/NEFT to our <strong>Bank A/C as above.</strong>' , compStyle)
        row6 = [[payment],['Total invoice amount due in 10 Days. Overdue accounts subject to a service charge of 3% per month.\n']]
        table6 = Table(row6, colWidths=(190*mm))
        style6 = TableStyle([
                           ('ALIGN',(1,1),(-3,-3),'RIGHT'),
                           ('VALIGN',(0,0),(0,-1),'MIDDLE'),
                           ('ALIGN',(0,-1),(-1,-1),'LEFT'),
                           ('INNERGRID', (0,0), (-1,-1), 0.25, colors.white),
                           ('BOX', (0,0), (-1,-1), 0.25, colors.white),

                           ])
        row7 = [['This is a computer generated invoices and does not require a signature'],['THANK YOU FOR YOUR BUSINESS!']]
        table7 = Table(row7, colWidths=(190*mm))
        style7 = TableStyle([
                           ('ALIGN',(1,1),(-3,-3),'CENTER'),
                           ('VALIGN',(0,0),(0,-1),'MIDDLE'),
                           ('ALIGN',(0,-1),(-1,-1),'CENTER'),
                           ('ALIGN',(0,0),(0,0),'CENTER'),
                           ('INNERGRID', (-1,-1), (-1,-1), 0.25, colors.white),
                           ('BOX', (-1,-1), (-1,-1), 0.25, colors.white),
                           ('LINEABOVE', (0,0), (0,0), 0.25, colors.black),
                           ])
        table7.setStyle(TableStyle([('FONTSIZE',(0,0),(0,0),6),
                                    ('FONTSIZE',(-1,-1),(-1,-1),12),
                        ]))


        # tablehead.setStyle(stylehead)
        table0.setStyle(style0)
        table1.setStyle(style1)
        table2.setStyle(style2)
        table3.setStyle(style3)
        table4.setStyle(style4)
        table5.setStyle(style5)
        table6.setStyle(style6)
        table7.setStyle(style7)
        # elements.append(tablehead)
        elements.append(table0)
        elements.append(table1)
        elements.append(table2)
        elements.append(table3)
        elements.append(table4)
        elements.append(table5)
        elements.append(table6)
        elements.append(table7)

        doc.build(elements)





class DownloadMonthlyInvoice(APIView):
    renderer_classes = (JSONRenderer,)
    def get(self , request , format = None):
        response = HttpResponse(content_type='application/pdf')
        if 'dataDetails' in request.GET:
            data = request.GET['dataDetails']
            details = eval(data)
        else:
            details = 'null'
        # print details[0]['productMeta']['description'],'dddddddddddd'
        frm = datetime.datetime.strptime(request.GET["from"],'%Y-%m-%dT%H:%M:%S.%fZ' )
        to =  datetime.datetime.strptime(request.GET["to"],'%Y-%m-%dT%H:%M:%S.%fZ' )
        frmDate = frm + timedelta(days=1)
        toDate = to + timedelta(days=1)

        month =  toDate.month
        year =  toDate.year
        contract = Contract.objects.get(id = request.GET['valPK'])
        response['Content-Disposition'] = 'attachment; filename="invoicedownload%s%s.pdf"' %( datetime.datetime.now(pytz.timezone('Asia/Kolkata')).year , contract.pk)
        genMonthlyInvoice(response,contract,frmDate,toDate,month,year,details,request)
        return response
