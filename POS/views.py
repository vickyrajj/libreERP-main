from django.shortcuts import render
from rest_framework import viewsets , permissions , serializers
from url_filter.integrations.drf import DjangoFilterBackend
from .serializers import *
from API.permissions import *
from rest_framework.views import APIView
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
import datetime
import json
import pytz
from .models import *
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
# from openpyxl import load_workbook
from io import BytesIO
import re
from rest_framework import filters



class CustomerViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = CustomerSerializer
    queryset = Customer.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name' ]

class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny, )
    serializer_class = ProductSerializer
    queryset = Product.objects.all()
    filter_backends = [DjangoFilterBackend , filters.SearchFilter]
    search_fields = ('name', 'serialNo', 'description', 'serialId')
    # filter_fields = ['name']
    # filter_backends = (filters.SearchFilter,)

# class InvoiceViewSet(viewsets.ModelViewSet):
#     permission_classes = (permissions.IsAuthenticated, )
#     serializer_class = ProductSerializer
#     queryset = Product.objects.all()
#     filter_backends = [DjangoFilterBackend]
#     filter_fields = ['name']
class InvoiceViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = InvoiceSerializer
    queryset = Invoice.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['customer' , 'id']


class VendorServicesViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = VendorServicesSerializer
    queryset = VendorServices.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['vendor']

class VendorProfileViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = VendorProfileSerializer
    queryset = VendorProfile.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['service']

class VendorServicesLiteViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = VendorServicesLiteSerializer
    queryset = VendorServices.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['product']

class PurchaseOrderViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = PurchaseOrderSerializer
    queryset = PurchaseOrder.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['service']

class ProductVerientViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = ProductVerientSerializer
    queryset = ProductVerient.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['parent']

# class ProductMetaListViewSet(viewsets.ModelViewSet):
#     permission_classes = (permissions.IsAuthenticated , )
#     serializer_class = ProductMetaListSerializer
#     filter_backends = [DjangoFilterBackend]
#     filter_fields = ['description', 'code']
#     def get_queryset(self):
#         return ProductMetaList.objects.all()

class ExternalOrdersViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated , )
    serializer_class = ExternalOrdersSerializer
    queryset = ExternalOrders.objects.all()

class ExternalOrdersQtyMapViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated , )
    serializer_class = ExternalOrdersQtyMapSerializer
    queryset = ExternalOrdersQtyMap.objects.all()

class InventoryLogViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated , )
    serializer_class = InventoryLogSerializer
    queryset = InventoryLog.objects.all().order_by('-created')
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['product' ]


themeColor = colors.HexColor('#227daa')

styles=getSampleStyleSheet()
styleN = styles['Normal']
styleH = styles['Heading1']


settingsFields = application.objects.get(name = 'app.clientRelationships').settings.all()


class expanseReportHead(Flowable):

    def __init__(self, request , invoice):
        Flowable.__init__(self)
        self.req = request
        self.invoice = invoice
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
        docID = '%s%s' %( now.year , self.invoice.pk)


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
    # print doc.invoice
    now = datetime.datetime.now(pytz.timezone('Asia/Kolkata'))
    passKey = '%s%s'%(str(doc.request.user.date_joined.year) , doc.request.user.pk) # also the user ID
    docID = '%s%s' %( now.year , doc.invoice.pk)

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

        p = Paragraph(settingsFields.get(name = 'companyName').value , compNameStyle)
        p.wrapOn(self , 50*mm , 10*mm)
        p.drawOn(self , 85*mm  , 18*mm)

        p1 = Paragraph(settingsFields.get(name = 'companyAddress').value , compNameStyle)
        p1.wrapOn(self , 150*mm , 10*mm)
        p1.drawOn(self , 55*mm  , 10*mm)


        p2 = Paragraph( settingsFields.get(name = 'contactDetails').value, compNameStyle)
        p2.wrapOn(self , 200*mm , 10*mm)
        p2.drawOn(self , 40*mm  , 4*mm)

        from svglib.svglib import svg2rlg
        drawing = svg2rlg(os.path.join(globalSettings.BASE_DIR , 'static_shared','images' , 'cioc_icon.svg'))
        sx=sy=0.5
        drawing.width,drawing.height = drawing.minWidth()*sx, drawing.height*sy
        drawing.scale(sx,sy)
        #if you want to see the box around the image
        # drawing._showBoundary = True
        renderPDF.draw(drawing, self,10*mm  , self._pagesize[1]-20*mm)

        #width = self._pagesize[0]
        # page = "Page %s of %s" % (, page_count)
        # self.setFont("Helvetica", 9)
        # self.drawRightString(195*mm, 272*mm, page)





def genInvoice(response , invoice, request):


    MARGIN_SIZE = 8 * mm
    PAGE_SIZE = A4

    # c = canvas.Canvas("hello.pdf")
    # c.drawString(9*cm, 19*cm, "Hello World!")

    pdf_doc = SimpleDocTemplate(response, pagesize = PAGE_SIZE,
        leftMargin = MARGIN_SIZE, rightMargin = MARGIN_SIZE,
        topMargin = 4*MARGIN_SIZE, bottomMargin = 3*MARGIN_SIZE)

    # data = [['', '', '', 'Grand Total', '' , pFooterGrandTotal]]

    pdf_doc.invoice = invoice
    pdf_doc.request = request

    tableHeaderStyle = styles['Normal'].clone('tableHeaderStyle')
    tableHeaderStyle.textColor = colors.white;
    tableHeaderStyle.fontSize = 7

    pHeadProd = Paragraph('<strong>Product/<br/>Service</strong>' , tableHeaderStyle)
    pHeadDetails = Paragraph('<strong>Details</strong>' , tableHeaderStyle)
    pHeadTaxCode = Paragraph('<strong>HSN/<br/>SAC</strong>' , tableHeaderStyle)
    pHeadQty = Paragraph('<strong>Qty</strong>' , tableHeaderStyle)
    pHeadPrice = Paragraph('<strong>Rate</strong>' , tableHeaderStyle)
    # pHeadTotal = Paragraph('<strong>Total</strong>' , tableHeaderStyle)
    pHeadsubTotalTax  = Paragraph('<strong>IGST <br/> Tax</strong>' , tableHeaderStyle)
    pHeadsubTotal = Paragraph('<strong>Sub Total</strong>' , tableHeaderStyle)

    # # bookingTotal , bookingHrs = getBookingAmount(o)
    #
    # pFooterQty = Paragraph('%s' % ('o.quantity') , styles['Normal'])
    # pFooterTax = Paragraph('%s' %('tax') , styles['Normal'])
    # pFooterTotal = Paragraph('%s' % (1090) , styles['Normal'])
    # pFooterGrandTotal = Paragraph('%s' % ('INR 150') , tableHeaderStyle)

    data = [[ pHeadProd, pHeadDetails, pHeadTaxCode, pHeadPrice , pHeadQty, pHeadsubTotalTax ,pHeadsubTotal ]]


    totalQuant = 0
    totalTax = 0
    grandTotal = 0
    tableBodyStyle = styles['Normal'].clone('tableBodyStyle')
    tableBodyStyle.fontSize = 7

    for i in json.loads(invoice.products):
        print '***********',i
        pDescSrc = i['data']['name']

        totalQuant += i['quantity']

        print i
        #
        # if 'price' not in i:
        #     print "Continuing"
        #     continue

        i['subTotalTax'] = i['data']['price'] * i['quantity'] * ( i['data']['productMeta']['taxRate']/float(100))

        i['subTotal'] = i['data']['price'] * i['quantity'] * (1+ i['data']['productMeta']['taxRate']/float(100))

        totalTax += i['subTotalTax']
        grandTotal += i['subTotal']

        pBodyProd = Paragraph('Product' , tableBodyStyle)
        pBodyTitle = Paragraph( pDescSrc , tableBodyStyle)
        pBodyQty = Paragraph(str(i['quantity']) , tableBodyStyle)
        pBodyPrice = Paragraph(str(i['data']['price']) , tableBodyStyle)
        # if 'taxCode' in i:
        taxCode = '%s(%s %%)' %(i['data']['productMeta']['code'] , i['data']['productMeta']['taxRate'])
        # else:
            # taxCode = ''

        pBodyTaxCode = Paragraph(taxCode , tableBodyStyle)
        pBodysubTotalTax = Paragraph(str(i['subTotalTax']) , tableBodyStyle)
        pBodyTotal = Paragraph(str(i['quantity']*i['data']['price']) , tableBodyStyle)
        pBodySubTotal = Paragraph(str(i['subTotal']) , tableBodyStyle)

        data.append([pBodyProd, pBodyTitle,pBodyTaxCode, pBodyPrice, pBodyQty, pBodyTotal, pBodysubTotalTax , pBodySubTotal])

    invoice.subTotal = grandTotal
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


    story = []

    expHead = expanseReportHead(request , invoice)
    story.append(Spacer(2.5,2*cm))
    story.append(expHead)
    story.append(Spacer(2.5,0.75*cm))

    adrs = invoice.customer

    if invoice.customer.gst is None:
        tin = 'NA'
    else:
        tin = invoice.customer.gst

    summryParaSrc = """
    <font size='11'><strong>Customer details:</strong></font> <br/><br/>
    <font size='9'>
    %s<br/>
    %s<br/>
    %s<br/>
    %s<br/>
    %s , %s<br/>
    %s<br/>
    <strong>GSTIN:</strong>%s<br/>
    </font>
    """ %(invoice.customer.name , invoice.customer.company , invoice.customer.street , invoice.customer.city ,invoice.customer.state , invoice.customer.pincode , invoice.customer.country , tin)
    story.append(Paragraph(summryParaSrc , styleN))
    story.append(t)
    story.append(Spacer(2.5,0.5*cm))

    pdf_doc.build(story,onFirstPage=addPageNumber, onLaterPages=addPageNumber, canvasmaker=PageNumCanvas)

from datetime import timedelta
from django.db.models import Sum
class SalesGraphAPIView(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.IsAuthenticated ,)
    def post(self , request , format = None):
        print "---------------------------------------\n"
        if "date" in request.data:
            # one day sale
            d = datetime.datetime.strptime(request.data["date"], '%Y-%m-%dT%H:%M:%S.%fZ')
            invcs = Invoice.objects.filter(invoicedate = d)
            custs = Customer.objects.filter(created__range = (datetime.datetime.combine(d, datetime.time.min), datetime.datetime.combine(d, datetime.time.max)))

        else:
            frm = datetime.datetime.strptime(request.data["from"], '%Y-%m-%dT%H:%M:%S.%fZ')
            to = datetime.datetime.strptime(request.data["to"], '%Y-%m-%dT%H:%M:%S.%fZ')
            invcs = Invoice.objects.filter(invoicedate__range=(frm, to))
            custs = Customer.objects.filter(created__range = (frm , to))

        totalSales = invcs.aggregate(Sum('grandTotal'))
        totalCollections = invcs.aggregate(Sum('amountRecieved'))
        sales =  invcs.count()
        custCount = custs.count()


        last_month = datetime.datetime.now() - timedelta(days=30)

        data = (Invoice.objects.all()
            .extra(select={'created': 'date(created)'})
            .values('created')
            .annotate(sum=Sum('grandTotal')))

        print data

        return Response({"totalSales" : totalSales , "totalCollections" : totalCollections ,  "sales" : sales , "custCount" : custCount , "trend" : data},status=status.HTTP_200_OK)


class ExternalSalesGraphAPIView(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.IsAuthenticated ,)
    def post(self , request , format = None):
        print "---------------------------------------\n"
        if "date" in request.data:
            # one day sale
            d = datetime.datetime.strptime(request.data["date"], '%Y-%m-%dT%H:%M:%S.%fZ')

            invcs = ExternalOrders.objects.filter(created__range = (datetime.datetime.combine(d, datetime.time.min), datetime.datetime.combine(d, datetime.time.max)))

        else:
            frm = datetime.datetime.strptime(request.data["from"], '%Y-%m-%dT%H:%M:%S.%fZ')
            to = datetime.datetime.strptime(request.data["to"], '%Y-%m-%dT%H:%M:%S.%fZ')
            invcs = ExternalOrders.objects.filter(created__range=(frm, to))

        print invcs
        last_month = datetime.datetime.now() - timedelta(days=30)

        data = (invcs
            .extra(select={'created': 'date(created)' })
            .values('created' , 'marketPlace' )
            )

        print data

        return Response({"amazon" : 0 , "flipkart" : 0 ,  "skinstore" : 0, "trend" : data},status=status.HTTP_200_OK)


from django.db.models import Max
class GetNextAvailableInvoiceIDAPIView(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.IsAuthenticated ,)
    def get(self , request , format = None):
        # id__max is None if there are no Posts in the database
        id_max = Invoice.objects.all().aggregate(Max('id'))['id__max']
        id_next = id_max + 1 if id_max else 1

        return Response({"pk" : id_next},status=status.HTTP_200_OK)


from BeautifulSoup import BeautifulSoup as bs
import pandas as pd
import re

class ExternalEmailOrders(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.AllowAny ,)
    def post(self , request , format = None):
        # print request.data
        print '--------------------'
        if 'html' not in request.data: # then its a flipkart order
            sku = request.data['sku']
            orderID = request.data['orderId']
            qty = request.data['quantity']
            price = request.data['price']
            p = None
            try:
                p = Product.objects.get(serialNo__iexact = sku)
            except:
                try:
                    ps = ProductVerient.object.get(sku__iexact = sku)
                    p = ps.parent
                except:
                    pass
            finally:
                if p == None:
                    return Response(status=status.HTTP_404_NOT_FOUND)

            eo = ExternalOrders(marketPlace= 'flipkart' , orderID = orderID , status = 'new' , buyersPrice = price )

            try:
                eo.save()
            except:
                eo = ExternalOrders.objects.get(marketPlace= 'flipkart' , orderID = orderID)

            prodMap = ExternalOrdersQtyMap(product = p , qty = qty)
            prodMap.save()
            eo.products.add(prodMap)
            il = InventoryLog(typ = 'system', product = p , before =  p.inStock , after = p.inStock - int(qty) , externalOrder = eo )

            try:
                il.save()

                p.inStock -= int(qty)
                p.save()
            except:
                pass

            return Response(status=status.HTTP_200_OK)


        body = request.data['html']
        subject = request.data['subject'].lower()
        seller = None
        if 'flipkart' in body.lower():
            seller = 'flipkart'
        if 'amazon' in body.lower():
            seller = 'amazon'
        if 'theskinstore.in' in body.lower() and 'ship now' not in subject:
            seller = 'skinstore'

        if 'amazon' in seller.lower() and 'ship now' not in subject:
            return Response(status=status.HTTP_200_OK)



        print '----------------------\n\n'
        print "Subject : ", subject
        print "seller : ", seller , '\n'
        # print "Body : ", body, '\n'
        typ = None
        soup = bs(body)




        tables = soup.findAll("table")
        print len(tables)

        if seller == 'amazon':
            if 'refund for order' in subject:
                typ = 'return'
            if 'ship now' in subject:
                typ = 'new'
            if 'has dispatched the item you sold' in subject:
                typ = 'shipped'

        if seller == 'skinstore':
            if 'thank you for shopping' in body.lower():
                typ = 'new'
            if 'your order status has been' in subject.lower():
                typ = 'statusChange'

        if seller == 'amazon':
            if typ == 'new':
                sku = body[body.index('SKU:')+4: body.index('Quantity:')].replace('<br>' , '').strip()

                qty = body[body.index('Quantity:')+9: body.index('Order date:')].replace('<br>' , '').strip()

                price = body[body.index(' price:')+7:].split('<br>')[0].replace('INR ' , '').strip()



                orderID = body[body.index('Order ID:')+9:].split('<br>')[0].strip()


                print "sku : " , sku , " Qty : " , qty , " orderID : " , orderID , " price : " , price

                p = None
                try:
                    p = Product.objects.get(serialNo__iexact = sku)
                except:
                    try:
                        ps = ProductVerient.object.get(sku__iexact = sku)
                        p = ps.parent
                    except:
                        pass
                finally:
                    print "sku : " , sku
                    if p == None:
                        return Response(status=status.HTTP_404_NOT_FOUND)

                eo = ExternalOrders(marketPlace= 'amazon' , orderID = orderID , status = 'new' , buyersPrice = price )

                try:
                    eo.save()
                except:
                    eo = ExternalOrders.objects.get(marketPlace= 'amazon' , orderID = orderID)

                prodMap = ExternalOrdersQtyMap(product = p , qty = qty)
                prodMap.save()
                eo.products.add(prodMap)
                il = InventoryLog(typ = 'system', product = p , before =  p.inStock , after = p.inStock - int(qty) , externalOrder = eo )

                try:
                    il.save()
                    p.inStock -= int(qty)
                    p.save()
                except:
                    pass





        if seller == 'skinstore':
            if typ == 'new':
                tbl = soup.findAll('table', attrs={'bgcolor': '#c0b475'})[0]
                t = pd.read_html(str(tbl))[0]
                print t

                orderID = body.split('Your Order ID : <span style="color:#000">')[1].split('</span>')[0]

                eo = ExternalOrders(marketPlace= 'skinstore' , orderID = orderID , status = 'new' )
                print eo
                try:
                    eo.save()
                except:
                    eo = ExternalOrders.objects.get(marketPlace= 'skinstore' , orderID = orderID)

                for index, row in t.iterrows():
                    if index == 0:
                        continue
                    sku = row[2]
                    qty = row[3]
                    if isinstance(sku , str):
                        print sku , qty
                        p = None
                        try:
                            p = Product.objects.get(serialNo__iexact = sku)
                        except:
                            try:
                                ps = ProductVerient.object.get(sku__iexact = sku)
                                p = ps.parent
                            except:
                                pass
                        finally:
                            if p == None:
                                return Response(status=status.HTTP_404_NOT_FOUND)

                        prodMap = ExternalOrdersQtyMap(product = p , qty = qty)
                        prodMap.save()
                        eo.products.add(prodMap)
                        il = InventoryLog(typ = 'system', product = p , before =  p.inStock , after = p.inStock - int(qty) , externalOrder = eo )
                        try:
                            il.save()
                            p.inStock -= int(qty)
                            p.save()
                        except:
                            pass


                    else:
                        break


                print orderID


        # for table in tables:
        #      if table.findParent("table") is None:
        #
        #
        #         if seller == 'flipkart':
        #             if 'flipkart return initiated' in subject:
        #                 typ = 'rto'
        #             if 'new flipkart order' in subject:
        #                 typ = 'new'
        #
        #         print "Type : " , typ , "Seller : " , seller
        #         try:
        #             t = pd.read_html(str(table))[0]
        #         except:
        #             t = None
        #         if t is not None and t.shape[0] >1:
        #             if seller == 'amazon':
        #                 if typ == 'return' and 'order items' in t[0][0].lower() and 'refund reason' in t[1][0].lower():
        #                     reason = t[1][1]
        #                     items = t[0][1]
        #                     if 'of' in items:
        #                         items = items[items.index('of')+2:]
        #
        #                     print reason , items
        #             if seller == 'flipkart':
        #                 if typ == 'new':
        #                     sku = t[3][1]
        #                     qty = t[4][1]
        #                     orderID = t[0][1]
        #                     price = t[5][1].replace('Rs.' , '').strip()
        #
        #                     print "sku : " , sku , " Qty : " , qty , " orderID : " , orderID , " price : " , price
        #
        #                     p = Product.objects.get(serialNo = sku)
        #                     p.inStock -= int(qty)
        #
        #                     p.save()
                    # print t , t.__class__ , typ


                        # reg = "(?<=%s).*?(?=%s)" % ('Item','<br>')
                        # print re.match(reg, body)


        # print dir(request)
        # print dir(request.FILES['attachment'])
        # print request.FILES['attachment'].size
        return Response({"saved" : True},status=status.HTTP_200_OK)


class InvoicePrint(APIView):
    renderer_classes = (JSONRenderer,)
    def get(self , request , format = None):
        if 'invoice' not in request.GET:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        response = HttpResponse(content_type='application/pdf')
        print request.GET['invoice']
        o = Invoice.objects.get(id = request.GET['invoice'])
        response['Content-Disposition'] = 'attachment; filename="invoicedownload%s%s.pdf"' %( datetime.datetime.now(pytz.timezone('Asia/Kolkata')).year , o.pk)
        genInvoice(response , o , request)
        # f = open('./media_root/invoicedownload%s%s.pdf'%(o.pk, o.status) , 'wb')
        # f.write(response.content)
        # f.close()
        if 'saveOnly' in request.GET:
            return Response(status=status.HTTP_200_OK)
        return response
from excel_response import ExcelResponse
class ReorderingReport(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    def get(self, request , format = None):
        objs = Product.objects.all()

        toInclude= []
        toIncludeExtended = []
        for o in objs:
            if o.inStock < o.reorderTrashold:
                toInclude.append({"name" : o.name , "SKU": o.serialNo , "Stock" : o.inStock})
                toIncludeExtended.append({ "pk" : o.pk, "name" : o.name , "SKU": o.serialNo , "Stock" : o.inStock,"reorderTrashold" : o.reorderTrashold})

        if 'onlyData' in request.GET:
            return  Response(toIncludeExtended , status=status.HTTP_200_OK)
        else:
            return ExcelResponse(toInclude)



class StockReport(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    def get(self, request , format = None):
        objs = Product.objects.all()
        return ExcelResponse(objs)


class BulkProductsCreationAPI(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, format=None):
        print 'hiiiiiiiiiiiiiiiiii'
        wb = load_workbook(filename = BytesIO(request.FILES['xl'].read()))
        ws = wb.worksheets[0]
        row_count = ws.max_row
        count = 0
        print request.user ,type(request.user),request.user.pk
        for i in range(1, row_count):
            a = ws['A' + str(i+1)].value
            b = ws['B' + str(i+1)].value
            c = ws['C' + str(i+1)].value
            quantity = b if b else 0
            price = c if c else 0
            if re.search('[a-zA-Z]+',a) and '(' in a:
                data = {'user':request.user, 'name':a.split('(')[0], 'price':price, 'serialNo':a.split('(')[-1][0:-1], 'inStock':quantity}
                print data
                count += 1
                p,created = Product.objects.get_or_create(**data)


        return Response({"count" : count}, status = status.HTTP_200_OK)

class purchaseReportHead(Flowable):

    def __init__(self, request , POs):
        Flowable.__init__(self)
        self.req = request
        self.POs = POs
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
        docTitle = 'PURCHASE ORDER'

        passKey = '%s%s'%(str(self.req.user.date_joined.year) , self.req.user.pk) # also the user ID
        docID = '%s%s' %( now.year , self.POs.pk)


        pSrc = '''
        <font size=14>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<u>%s</u></font><br/><br/><br/>
        <font size=9>
        <strong>Generated by:</strong> %s<br/>
        <strong>On:</strong> %s<br/>
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

def addPagesNumber(canvas, doc):
    """
    Add the page number
    """
    # print doc.invoice
    now = datetime.datetime.now(pytz.timezone('Asia/Kolkata'))
    passKey = '%s%s'%(str(doc.request.user.date_joined.year) , doc.request.user.pk) # also the user ID
    docID = '%s%s' %( now.year , doc.POs.pk)

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



class PageNumberCanvas(canvas.Canvas):

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

        p = Paragraph(settingsFields.get(name = 'companyName').value , compNameStyle)
        p.wrapOn(self , 50*mm , 10*mm)
        p.drawOn(self , 85*mm  , 18*mm)

        p1 = Paragraph(settingsFields.get(name = 'companyAddress').value , compNameStyle)
        p1.wrapOn(self , 150*mm , 10*mm)
        p1.drawOn(self , 55*mm  , 10*mm)


        p2 = Paragraph( settingsFields.get(name = 'contactDetails').value, compNameStyle)
        p2.wrapOn(self , 200*mm , 10*mm)
        p2.drawOn(self , 40*mm  , 4*mm)

        from svglib.svglib import svg2rlg
        drawing = svg2rlg(os.path.join(globalSettings.BASE_DIR , 'static_shared','images' , 'cioc_icon.svg'))
        sx=sy=0.5
        drawing.width,drawing.height = drawing.minWidth()*sx, drawing.height*sy
        drawing.scale(sx,sy)
        #if you want to see the box around the image
        # drawing._showBoundary = True
        renderPDF.draw(drawing, self,10*mm  , self._pagesize[1]-20*mm)

        #width = self._pagesize[0]
        # page = "Page %s of %s" % (, page_count)
        # self.setFont("Helvetica", 9)
        # self.drawRightString(195*mm, 272*mm, page)




def genPurchaseOrder(response , POs, request):


    MARGIN_SIZE = 8 * mm
    PAGE_SIZE = A4

    pdf_doc = SimpleDocTemplate(response, pagesize = PAGE_SIZE,
        leftMargin = MARGIN_SIZE, rightMargin = MARGIN_SIZE,
        topMargin = 4*MARGIN_SIZE, bottomMargin = 3*MARGIN_SIZE)


    pdf_doc.POs = POs
    pdf_doc.request = request

    tableHeaderStyle = styles['Normal'].clone('tableHeaderStyle')
    tableHeaderStyle.textColor = colors.white;
    tableHeaderStyle.fontSize = 7



    pHeadDetails = Paragraph('<strong>Item Details</strong>' , tableHeaderStyle)
    pHeadSKU = Paragraph('<strong>SKU</strong>' , tableHeaderStyle)
    pHeadQty = Paragraph('<strong>Item Qty</strong>' , tableHeaderStyle)
    pHeadPrice = Paragraph('<strong>Rate</strong>' , tableHeaderStyle)
    pHeadTotal = Paragraph('<strong>Total</strong>' , tableHeaderStyle)

    # # bookingTotal , bookingHrs = getBookingAmount(o)
    #
    # pFooterQty = Paragraph('%s' % ('o.quantity') , styles['Normal'])
    # pFooterTax = Paragraph('%s' %('tax') , styles['Normal'])
    # pFooterTotal = Paragraph('%s' % (1090) , styles['Normal'])
    # pFooterGrandTotal = Paragraph('%s' % ('INR 150') , tableHeaderStyle)

    data = [[pHeadDetails,pHeadSKU,pHeadPrice , pHeadQty ,pHeadTotal]]


    # totalQuant = 0
    # totalTax = 0
    # grandTotal = 0
    tableBodyStyle = styles['Normal'].clone('tableBodyStyle')
    tableBodyStyle.fontSize = 7


    grandTotal = 0
    for i in json.loads(POs.products):
        print '***********',i
        pDescSrc = i['product']['name']
        pDescSrc = i['product']['serialNo']
        pDescSrc = i['rate']

        pDescSrc += i['qty']

        print i

        i['total'] = i['rate'] * i['qty']
        grandTotal  += i['total']
        #
        # if 'price' not in i:
        #     print "Continuing"
        #     continue



        pBodyProd = Paragraph(str(i['product']['name']) , tableBodyStyle)
        pBodySku = Paragraph(str(i['product']['serialNo']) , tableBodyStyle)
        # pBodyTitle = Paragraph( pDescSrc , tableBodyStyle)
        pBodyQty = Paragraph(str(i['qty']), tableBodyStyle)
        pBodyPrice = Paragraph(str(i['rate']) , tableBodyStyle)
        pBodyTotal = Paragraph(str(i['total']) , tableBodyStyle)

        data.append([pBodyProd,pBodySku,pBodyPrice, pBodyQty,pBodyTotal])



    tableGrandStyle = tableHeaderStyle.clone('tableGrandStyle')
    tableGrandStyle.fontSize = 10


    data += [['', '','','',''],
                ['', '',  Paragraph('sub Total (INR)' , tableHeaderStyle),'', Paragraph(str(grandTotal) , tableGrandStyle)]]

    t=Table(data)
    ts = TableStyle([('ALIGN',(1,1),(-3,-3),'RIGHT'),
                ('VALIGN',(0,1),(-1,-3),'TOP'),
                ('VALIGN',(0,-2),(-1,-2),'TOP'),
                ('VALIGN',(0,-1),(-1,-1),'TOP'),
                ('SPAN',(-3,-1),(-2,-1)),
                ('TEXTCOLOR',(0,0),(-1,0) , colors.white),
                ('BACKGROUND',(0,0),(-1,0) , themeColor),
                # ('LINEABOVE',(0,0),(-1,0),0.25,themeColor),
                ('LINEABOVE',(0,1),(-1,1),0.25,themeColor),
                # ('BACKGROUND',(-2,-2),(-1,-2) , colors.HexColor('#eeeeee')),
                ('BACKGROUND',(-3,-1),(-1,-1) , themeColor),
                # ('LINEABOVE',(-2,-2),(-1,-2),0.25,colors.gray),
                ('LINEABOVE',(0,-1),(-1,-1),0.25,colors.gray),
                # ('LINEBELOW',(0,-1),(-1,-1),0.25,colors.gray),
            ])
    t.setStyle(ts)
    t._argW[0] = 8*cm
    t._argW[1] = 3*cm
    t._argW[2] = 3*cm
    t._argW[3] = 3*cm
    # t._argW[3] = 2*cm
    # t._argW[4] = 2*cm
    # t._argW[5] = 2*cm
    # t._argW[6] = 1.6*cm
    # t._argW[7] = 2*cm


    story = []

    expHead = purchaseReportHead(request , POs)
    story.append(Spacer(3,2*cm))
    story.append(expHead)
    story.append(Spacer(3,0.75*cm))

    adrs = POs.service.address

    if POs.service.tin is None:
        tin = 'NA'
    else:
        tin = POs.service.tin

    if POs.service.cin is None:
        cin = 'NA'
    else:
        cin = POs.service.cin

    summryParaSrc = """
    <font size='11'><strong>Vendor details:</strong></font> <br/><br/>
    <font size='9'>
    %s<br/>
    %s<br/>
    %s<br/>
    %s<br/>
    %s<br/>
    %s<br/>
    <strong>CIN:</strong>%s<br/>
    </font>
    """ %(POs.service.name , POs.service.address.street , POs.service.address.city ,POs.service.address.state , POs.service.address.pincode , POs.service.address.country , POs.service.tin)
    story.append(Paragraph(summryParaSrc , styleN))
    story.append(t)
    story.append(Spacer(2.5,0.5*cm))

    pdf_doc.build(story,onFirstPage=addPagesNumber, onLaterPages=addPagesNumber, canvasmaker=PageNumberCanvas)

class ProductPrint(APIView):
    renderer_classes = (JSONRenderer,)
    def get(self , request , format = None):
        if 'POs' not in request.GET:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        response = HttpResponse(content_type='application/pdf')
        print'aaaaaaaaaaaaaaaaa' ,request.GET['POs']
        o = PurchaseOrder.objects.get(id = request.GET['POs'])
        response['Content-Disposition'] = 'attachment; filename="POsdownload%s%s.pdf"'
        genPurchaseOrder(response,o, request)
        # f = open('./media_root/invoicedownload%s%s.pdf'%(o.pk, o.status) , 'wb')
        # f.write(response.content)
        # f.close()
        # if 'saveOnly' in request.GET:
        #     return Response(status=status.HTTP_200_OK)
        return response