from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()
router.register(r'products' , ProductsViewSet , base_name = 'products')
router.register(r'productsheet' , ProductSheetViewSet , base_name = 'productsheet')
router.register(r'projects' , ProjectsViewSet , base_name = 'projects')
router.register(r'bom' , BoMViewSet , base_name = 'bom')
router.register(r'inventory' , InventoryViewSet , base_name = 'inventory')



urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'ProductsUpload/$' , ProductsUploadAPIView.as_view() ),
    url(r'slip/$' , GetPurchaseAPIView.as_view() ),
    url(r'quotation/$' , QuotationAPIView.as_view() ),
    url(r'inventoryData/$' , ProductInventoryAPIView.as_view() ),
    url(r'order/$' , OrderAPIView.as_view() ),
    url(r'invoice/$' , InvoiceAPIView.as_view() ),
    url(r'grn/$' , GrnAPIView.as_view() ),


]
