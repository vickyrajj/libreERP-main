from django.conf.urls import include, url
from .views import *
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'Attendance',AttendanceViewSet, base_name ='Attendance')

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'fetchAttendance/$' , FeatchAttendanceDataApi.as_view()),
    url(r'loadAttendanceData/$' , AttendanceDataCreationApi.as_view()),

    # url(r'leaveApproval/$' , LeaveApprovalApi.as_view()),

]
