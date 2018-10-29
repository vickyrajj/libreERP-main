from django.conf.urls import include, url
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from homepage.views import index
# from events.views import eventHome
from HR.views import loginView , logoutView , home , registerView , tokenAuthentication , root, generateOTP, documentView
from homepage.views import blog,blogDetails,news,team, career ,policy ,terms ,refund , contacts , registration , desclaimer
from ecommerce.views import ecommerceHome , view_that_asks_for_money , paypal_cancel_view , paypal_return_view
from ERP.views import serviceRegistration
from ERP.views import PaymentResponse

app_name="libreERP"
urlpatterns = [
    url(r'^$', ecommerceHome , name ='root'),
    url(r"^ecommerce/", ecommerceHome , name = 'ecommerce'), # public  ecommerce app
    url(r'^ERP/', home , name ='ERP'),
    url(r'^api/', include('API.urls')),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^login', loginView , name ='login'),
    url(r'^register', registration , name ='register'),
    url(r'^services', serviceRegistration , name ='serviceRegistration'),
    url(r'^token', tokenAuthentication , name ='tokenAuthentication'),
    url(r'^logout', logoutView , name ='logout'),
    url(r'^corporate/', index , name ='index'),
    url(r'^api-auth/', include('rest_framework.urls', namespace ='rest_framework')),
    url(r'^accounts/', include('allauth.urls')),
    url(r'^robots\.txt', include('robots.urls')),
    url(r'^generateOTP', generateOTP, name="generateOTP"),
    url(r'^documents', documentView , name ='document'),
    url(r'^paymentResponse', PaymentResponse , name ='paymentResponse'),
    url(r'^paypal/', include('paypal.standard.ipn.urls')),
    url(r'view_that_asks_for_money/$' , view_that_asks_for_money , name = "view_that_asks_for_money" ),
    url(r'paypal_return_view/$' , view_that_asks_for_money , name = "your-return-view" ),
    url(r'paypal_cancel_view/$' , view_that_asks_for_money , name = "your-cancel-view" ),
]

if settings.DEBUG:
    urlpatterns +=static(settings.STATIC_URL , document_root = settings.STATIC_ROOT)
    urlpatterns +=static(settings.MEDIA_URL , document_root = settings.MEDIA_ROOT)

urlpatterns.append(url(r'^', ecommerceHome , name ='ecommerceHome'))
# urlpatterns.append(url(r'^(?P<blogname>[\w|\W]+)/', blogDetails , name ='blogDetails'))
