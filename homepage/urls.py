from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()
# router.register(r'schedule' , scheduleViewSet , base_name = 'schedule')


urlpatterns = [
    url(r'^', include(router.urls)),
    # url(r'inviteMail/$' , InvitationMailApi.as_view()),

]
