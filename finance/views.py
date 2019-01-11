from django.shortcuts import render
from rest_framework import viewsets , permissions , serializers
from url_filter.integrations.drf import DjangoFilterBackend
from .serializers import *
from API.permissions import *
from .models import *
# Create your views here.

class AccountViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = AccountSerializer
    queryset = Account.objects.all()

class InflowViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = InflowSerializer
    queryset = Inflow.objects.all()

class CostCenterViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = CostCenterSerializer
    queryset = CostCenter.objects.all()

class TransactionViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = TransactionSerializer
    queryset = Transaction.objects.all()

class ExpenseSheetViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = ExpenseSheetSerializer
    queryset = ExpenseSheet.objects.all()

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
