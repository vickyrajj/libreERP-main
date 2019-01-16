from django.shortcuts import render
from rest_framework import viewsets , permissions , serializers
from url_filter.integrations.drf import DjangoFilterBackend
from .serializers import *
from API.permissions import *
from .models import *
from django.db.models import Q, F , Sum
from openpyxl import load_workbook,Workbook
from openpyxl.writer.excel import save_virtual_workbook
from openpyxl.styles import PatternFill , Font
import string
from rest_framework.views import APIView
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from io import BytesIO
from rest_framework.views import APIView
from projects.models import ProjectPettyExpense , project
import datetime
from dateutil.relativedelta import relativedelta
import calendar
from django.http import HttpResponse
# Create your views here.

class AccountViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = AccountSerializer
    queryset = Account.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['number','personal','contactPerson']

class InflowViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = InflowSerializer
    queryset = Inflow.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['amount']
    def get_queryset(self):
        if 'search' in self.request.GET:
            try:
                toRet = Inflow.objects.filter(amount__gte=int(self.request.GET['search']))
                return toRet
            except:
                return Inflow.objects.all()
        else:
            return Inflow.objects.all()

class CostCenterViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = CostCenterSerializer
    queryset = CostCenter.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name']

class TransactionViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = TransactionSerializer
    # queryset = Transaction.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['amount','toAcc']
    def get_queryset(self):
        if 'filterBoth' in self.request.GET:
            toRet = Transaction.objects.filter(Q(fromAcc__number=self.request.GET['filterBoth'])|Q(toAcc__number=self.request.GET['filterBoth']))
            return toRet
        else:
            return Transaction.objects.all()

class ExpenseSheetViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = ExpenseSheetSerializer
    queryset = ExpenseSheet.objects.all()

class ExpenseHeadingViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = ExpenseHeadingSerializer
    queryset = ExpenseHeading.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['title']

class InvoiceViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = InvoiceSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['description', 'dated','sheet']
    def get_queryset(self):
        u = self.request.user
        return Invoice.objects.all()

class VendorProfileViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = VendorProfileSerializer
    queryset = VendorProfile.objects.all()
    # filter_backends = [DjangoFilterBackend]
    # filter_fields = ['service']

class VendorServiceViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = VendorServiceSerializer
    queryset = VendorService.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['vendorProfile']

class VendorInvoiceViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = VendorInvoiceSerializer
    queryset = VendorInvoice.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['vendorProfile']

class PurchaseOrderViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = PurchaseOrderSerializer
    queryset = PurchaseOrder.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name']

class PurchaseOrderQtyViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = PurchaseOrderQtySerializer
    queryset = PurchaseOrderQty.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['purchaseorder','product']

class UplodInflowDataAPI(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.IsAuthenticated ,)
    def post(self , request , format = None):
        print 'entered','*******************'
        requestData = request.data
        print requestData
        tosend={}
        if 'exFile' in requestData:
            excelFile = request.FILES['exFile']
            if request.data['verified'] in ['true','1','yes',]:
                verified = True
            else:
                verified = False
            currency = request.data['currency']
            toAcc = Account.objects.get(pk=int(request.data['toAcc']))
            user = request.user
            print verified,type(verified),toAcc,currency,user
            wb = load_workbook(filename = BytesIO(excelFile.read()))
            for idx,ws in enumerate(wb.worksheets):
                wsTitle = ws.title
                print wsTitle,idx
                if idx==0:
                    storeData = []
                    print 'savingggggggg'
                    for i in range(2,ws.max_row+1):
                        try:
                            amount = int(ws['A'+str(i)].value) if ws['A'+str(i)].value else 0
                            referenceID = str(ws['B'+str(i)].value) if ws['B'+str(i)].value else None
                            dated = ws['C'+str(i)].value.date() if ws['C'+str(i)].value else None
                            description = str(ws['D'+str(i)].value) if ws['D'+str(i)].value else None
                            chequeNo = str(ws['E'+str(i)].value) if ws['E'+str(i)].value else None
                            mode = str(ws['F'+str(i)].value) if ws['F'+str(i)].value else 'cash'
                            mode = mode.lower()
                            gstCollected = float(ws['G'+str(i)].value) if ws['G'+str(i)].value else 0

                            infObj = Inflow(user=user,toAcc=toAcc,currency=currency,verified=verified,amount=amount,referenceID=referenceID,dated=dated,description=description,chequeNo=chequeNo,mode=mode,gstCollected=gstCollected)
                            storeData.append(infObj)
                        except:
                            print 'row number {0} in Excel - {1} is not created'.format(i,wsTitle)
                    Inflow.objects.bulk_create(storeData)
                    print 'total {0} Objects has been created'.format(len(storeData))
        return Response(tosend, status=status.HTTP_200_OK)

class GetExpenseDataAPI(APIView):
    permission_classes = (permissions.IsAuthenticated ,)
    def get(self , request , format = None):
        print 'entered','*******************'
        print request.GET
        accountsList = list(request.user.accountsManaging.all().values_list('pk',flat=True).distinct())
        print accountsList,'user accountssssss Listttttttt'
        tosend=[]
        expObj = ProjectPettyExpense.objects.filter(account__in=accountsList).values('project__pk','project__title').distinct()
        print expObj
        for i in expObj:
            expTotal = ProjectPettyExpense.objects.filter(project__id=int(i['project__pk']),account__in=accountsList).aggregate(tot=Sum('amount'))
            expTotal = expTotal['tot'] if expTotal['tot'] else 0
            print expTotal
            data = {'projectPk':i['project__pk'],'projectName':i['project__title'],'expTotal':expTotal}
            tosend.append(data)
        if 'limit' in request.GET:
            try:
                lmt = int(request.GET['limit'])
                tosend = tosend[0:lmt]
            except:
                pass
        return Response(tosend, status=status.HTTP_200_OK)

class ExpensesGraphDataAPI(APIView):
    permission_classes = (permissions.IsAuthenticated ,)
    def get(self , request , format = None):
        print 'entered','*******************'
        print request.GET

        tosend={'labels':[],'datasets':[]}
        allExpenses = ProjectPettyExpense.objects.all()
        projLists = allExpenses.values('project__pk','project__title').distinct()
        accountList = allExpenses.values('account__pk','account__title').distinct()
        for idx,i in enumerate(accountList):
            data = {'label':i['account__title'],'data':[]}
            for j in projLists:
                if idx==0:
                    tosend['labels'].append(j['project__title'])
                expTotal = allExpenses.filter(project__id=int(j['project__pk']),account__id=int(i['account__pk'])).aggregate(tot=Sum('amount'))
                expTotal = expTotal['tot'] if expTotal['tot'] else 0
                data['data'].append(expTotal)
            tosend['datasets'].append(data)

        return Response(tosend, status=status.HTTP_200_OK)

class MonthsExpensesDataAPI(APIView):
    permission_classes = (permissions.IsAuthenticated ,)
    def get(self , request , format = None):
        print 'entered','*******************'
        tosend={'labels':[],'datasets':[]}
        today = datetime.date.today()
        lstYear = today + relativedelta(years=-1,months=-1)
        print today , lstYear
        allExpenses = ProjectPettyExpense.objects.all()
        for i in range(13):
            lstYear += relativedelta(months=1)
            mth = lstYear.month
            yr = lstYear.year
            label = str(calendar.month_abbr[mth]) + '-' + str(yr)
            tosend['labels'].append(label)
            expTotal = allExpenses.filter(created__year=yr,created__month=mth).aggregate(tot=Sum('amount'))
            expTotal = expTotal['tot'] if expTotal['tot'] else 0
            tosend['datasets'].append(expTotal)

        return Response(tosend, status=status.HTTP_200_OK)

class DownloadExpenseSummaryAPI(APIView):
    permission_classes = (permissions.IsAuthenticated ,)
    def get(self , request , format = None):
        print 'entered','*******************'

        hdFont = Font(size=12,bold=True)
        alphaChars = list(string.ascii_uppercase)
        workbook = Workbook()
        Sheet1 = workbook.active
        Sheet1.title = 'Expense Summary'
        hd = ["Project", "Budget",'Expense']
        hdWidth = [10,10,10]
        Sheet1.append(hd)
        projectsList = project.objects.filter(projectClosed=False)
        print projectsList.count()
        for i in projectsList:
            data = [i.title,i.budget]
            try:
                expTotal = ProjectPettyExpense.objects.filter(project=i).aggregate(tot=Sum('amount'))
                expTotal = expTotal['tot'] if expTotal['tot'] else 0
            except:
                expTotal = 0
            data.append(expTotal)
            Sheet1.append(data)
            for idx,j in enumerate(data):
                if (len(str(j))+5) > hdWidth[idx]:
                    hdWidth[idx] = len(str(j)) + 5
        for idx,i in enumerate(hd):
            cl = str(alphaChars[idx])+'1'
            Sheet1[cl].fill = PatternFill(start_color="48dce0", end_color="48dce0", fill_type = "solid")
            Sheet1[cl].font = hdFont
            Sheet1.column_dimensions[str(alphaChars[idx])].width = hdWidth[idx]

        allExpenses = ProjectPettyExpense.objects.all()
        projLists = allExpenses.values('project__pk','project__title').distinct()
        for i in projLists:
            Sheet = workbook.create_sheet(i['project__title'])
            hd = ['Title','Amount','Description']
            hdWidth = [10,10,10]
            Sheet.append(hd)

            ptObjs = allExpenses.filter(project__id=int(i['project__pk']))
            for j in ptObjs:
                data = [j.heading.title,j.amount,j.description]
                Sheet.append(data)
                for idx,k in enumerate(data):
                    if (len(str(k))+5) > hdWidth[idx]:
                        hdWidth[idx] = len(str(k)) + 5
            for idx,j in enumerate(hd):
                cl = str(alphaChars[idx])+'1'
                Sheet[cl].fill = PatternFill(start_color="48dce0", end_color="48dce0", fill_type = "solid")
                Sheet[cl].font = hdFont
                Sheet.column_dimensions[str(alphaChars[idx])].width = hdWidth[idx]

        response = HttpResponse(content=save_virtual_workbook(workbook),content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename=ExpenseSummary.xlsx'
        return response
