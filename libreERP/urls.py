from django.conf.urls import include, url
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from homepage.views import index
from HR.views import loginView , logoutView , home , registerView , tokenAuthentication , root, generateOTP, documentView
from homepage.views import blog,blogDetails,news,team, career ,policy ,terms ,refund , contacts , registration , desclaimer
from ERP.views import serviceRegistration , dynamicTemplates, courses , coursesContent , ncert , mockTestView
from tutor.views import studentHome , tutorHome
from ERP.views import PaymentResponse, renderedStatic
from django.contrib.sitemaps.views import sitemap
from PIM.sitemaps import BlogsSitemap
from LMS.sitemaps import SectionsSitemap


sitemaps = {
    'blogs': BlogsSitemap(),
    'sections': SectionsSitemap()
}


app_name="libreERP"
urlpatterns = [
    url(r'^$', index , name ='root'),
    url(r'^ERP/', home , name ='ERP'),
    url(r'^api/', include('API.urls')),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^login', loginView , name ='login'),
    url(r'^register', registration , name ='register'),
    url(r'^services', serviceRegistration , name ='serviceRegistration'),
    url(r'^token', tokenAuthentication , name ='tokenAuthentication'),
    url(r'^logout/', logoutView , name ='logout'),
    url(r'^corporate/', index , name ='index'),
    url(r'^api-auth/', include('rest_framework.urls', namespace ='rest_framework')),
    url(r'^accounts/', include('allauth.urls')),
    url(r'^robots\.txt', include('robots.urls')),
    url(r'^generateOTP', generateOTP, name="generateOTP"),
    url(r'^documents', documentView , name ='document'),
    url(r'^blog/$', blog , name ='blog'),
    url(r'^news', news , name ='news'),
    url(r'^team', team , name ='team'),
    # url(r'^career', career , name ='career'),
    # url(r'^policy', policy , name ='policy'),
    # url(r'^desclaimer', desclaimer , name ='desclaimer'),
    # url(r'^terms', terms , name ='terms'),
    # url(r'^refund', refund , name ='refund'),
    url(r'^contacts', contacts , name ='contacts'),
    url(r'^studentHome', studentHome , name ='studentHome'),
    url(r'^tutorHome', tutorHome , name ='tutorHome'),
    url(r'^paymentResponse', PaymentResponse , name ='paymentResponse'),
    url(r'^sitemap\.xml$', sitemap, {'sitemaps': sitemaps}, name='django.contrib.sitemaps.views.sitemap'),
    url(r'^ngTemplates/(?P<filename>[\w|\W]+)', renderedStatic , name ='renderedStatic'),
    url(r'^dynamicTemplates/(?P<filename>[\w|\W]+).html', dynamicTemplates , name ='dynamicTemplates'),
    url(r'^courses/(?P<page>[\w|\W]+)', coursesContent , name ='coursesContent'),
    url(r'^courses/', courses , name ='courses'),
    url(r'^ncert/', ncert , name ='ncert'),
    url(r'^mock-test/(?P<testID>[\w|\W]+)', mockTestView , name ='mockTest'),


]

if settings.DEBUG:
    urlpatterns +=static(settings.STATIC_URL , document_root = settings.STATIC_ROOT)
    urlpatterns +=static(settings.MEDIA_URL , document_root = settings.MEDIA_ROOT)

urlpatterns.append(url(r'^(?P<blogname>[\w|\W]+)/', blogDetails , name ='blogDetails'))
# urlpatterns.append(url(r'^.*$', index , name='index'))
