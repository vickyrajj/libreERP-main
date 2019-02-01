from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()

router.register(r'account' , AccountViewSet , base_name ='account')
router.register(r'costCenter' , CostCenterViewSet , base_name ='costCenter')
router.register(r'transaction' , TransactionViewSet , base_name ='transaction')
router.register(r'expenseSheet' , ExpenseSheetViewSet , base_name ='expenseSheet')
router.register(r'invoices' , InvoiceViewSet , base_name ='invoices')
router.register(r'inflow' , InflowViewSet , base_name ='inflow')
router.register(r'vendorprofile' , VendorProfileViewSet , base_name ='vendorprofile')
router.register(r'vendorservice' , VendorServiceViewSet , base_name ='vendorservice')
router.register(r'vendorinvoice' , VendorInvoiceViewSet , base_name ='vendorinvoice')
router.register(r'purchaseorder' , PurchaseOrderViewSet , base_name ='purchaseorder')
router.register(r'purchaseorderqty' , PurchaseOrderQtyViewSet , base_name ='purchaseorder')
router.register(r'expenseHeading' , ExpenseHeadingViewSet , base_name ='expenseHeading')
router.register(r'outBoundInvoice' , OutBoundInvoiceViewSet , base_name ='outBoundInvoice')
router.register(r'outBoundInvoiceQty' , OutBoundInvoiceQtyViewSet , base_name ='outBoundInvoiceQty')
router.register(r'inventory' , InventoryViewSet , base_name ='inventory')
router.register(r'inventoryLog' , InventoryLogViewSet , base_name ='inventoryLog')



urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'uplodInflowData/$' , UplodInflowDataAPI.as_view()),
    url(r'getExpenseData/$' , GetExpenseDataAPI.as_view()),
    url(r'expensesGraphData/$' , ExpensesGraphDataAPI.as_view()),
    url(r'monthsExpensesData/$' , MonthsExpensesDataAPI.as_view()),
    url(r'downloadExpenseSummary/$' , DownloadExpenseSummaryAPI.as_view()),
    url(r'grnDownload/$' , GrnAPIView.as_view()),
    url(r'invoiceDownload/$' , InvoiceAPIView.as_view()),
    url(r'sendInvoice/$' , SendInvoiceAPIView.as_view()),
    url(r'average/$' , AverageAPIView.as_view()),
    url(r'invoiceSheet/$' , InvoiceSheetAPIView.as_view()),



]
