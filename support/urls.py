from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()
router.register(r'products' , ProductsViewSet , base_name = 'products')
router.register(r'productsheet' , ProductSheetViewSet , base_name = 'productsheet')
router.register(r'projects' , ProjectsViewSet , base_name = 'projects')
router.register(r'bom' , BoMViewSet , base_name = 'bom')
router.register(r'inventory' , InventoryViewSet , base_name = 'inventory')
router.register(r'materialqty' , MaterialIssueViewSet , base_name = 'materialIssue')
router.register(r'material' , MaterialIssueMainViewSet , base_name = 'materialIssuemain')
router.register(r'stockcheck' , StockCheckViewSet , base_name = 'stockcheck')
router.register(r'stockchecklog' , StockCheckLogViewSet , base_name = 'stockchecklog')
router.register(r'vendor' , VendorViewSet , base_name = 'vendor')



urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'ProductsUpload/$' , ProductsUploadAPIView.as_view() ),
    url(r'POSlip/$' , GetPurchaseAPIView.as_view() ),
    url(r'quotation/$' , QuotationAPIView.as_view() ),
    url(r'inventoryData/$' , ProductInventoryAPIView.as_view() ),
    url(r'order/$' , OrderAPIView.as_view() ),
    url(r'materialIssued/$' , MaterialIssuedNoteAPIView.as_view() ),
    url(r'grn/$' , GrnAPIView.as_view() ),
    url(r'sendEmail/$' , EmailApi.as_view() ),
    url(r'calculate/$' , CalculateAPIView.as_view() ),
    url(r'getMaterial/$' , GetMaterialAPIView.as_view() ),
    url(r'projectStockConsumption/$' , DownloadProjectSCExcelReponse.as_view() ),
    # url(r'stock/$' , StockAPIView.as_view() ),
]
