from django.conf.urls import include, url
from .views import *
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'Calendar',calendarViewSet, base_name ='Calendar')

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'fetchAttendance/$' , FeatchAttendanceDataApi.as_view()),
]
