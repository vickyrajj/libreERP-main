from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()
router.register(r'customer' , CustomerViewSet , base_name = 'customer')
router.register(r'product' , ProductViewSet , base_name = 'product')
router.register(r'invoice' , InvoiceViewSet , base_name = 'invoice')
router.register(r'vendorProfile' , VendorProfileViewSet , base_name = 'vendorProfile')
router.register(r'vendorServices' , VendorServicesViewSet , base_name = 'vendorServices')
router.register(r'purchaseOrder' , PurchaseOrderViewSet , base_name = 'purchaseOrder')
router.register(r'VendorServicesLite' , VendorServicesLiteViewSet , base_name = 'VendorServicesLite')
router.register(r'productVerient' , ProductVerientViewSet , base_name = 'productVerient')
router.register(r'externalOrders' , ExternalOrdersViewSet , base_name = 'externalOrders')
router.register(r'inventoryLog' , InventoryLogViewSet , base_name = 'inventoryLog')
router.register(r'externalOrdersQtyMap' , ExternalOrdersQtyMapViewSet , base_name = 'externalOrdersQtyMap')
router.register(r'store' , StoreViewSet , base_name = 'store')
router.register(r'storeQty' , StoreQtyViewSet , base_name = 'storeQty')
router.register(r'productMeta' , ProductMetaViewSet , base_name = 'productMeta')
# router.register(r'productInventory' , ProductInventoryViewSet , base_name = 'productInventory')



urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'invoicePrint/$' , InvoicePrint.as_view() ),
    url(r'productPrint/$' , ProductPrint.as_view() ),
    url(r'productPrintGrns/$' , ProductPrintGrns.as_view() ),
    url(r'bulkProductsCreation/$' , BulkProductsCreationAPI.as_view() ),
    url(r'externalEmailOrders/$' , ExternalEmailOrders.as_view() ),
    url(r'reorderingReport/$' , ReorderingReport.as_view() ),
    url(r'stockReport/$' , StockReport.as_view() ),
    url(r'getNextAvailableInvoiceID/$' , GetNextAvailableInvoiceIDAPIView.as_view() ),
    url(r'salesGraphAPI/$' , SalesGraphAPIView.as_view() ),
    url(r'externalSalesGraphAPI/$' , ExternalSalesGraphAPIView.as_view() ),
    url(r'productInventoryAPI/$' , ProductInventoryAPIView.as_view() ),
    url(r'getTaxList/$' , GetTaxList.as_view() ),
    # url(r'getTaxListExcel/$' , GetTaxListExcel.as_view() ),

]
