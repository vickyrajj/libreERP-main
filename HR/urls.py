from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()
router.register(r'users' , UserViewSet , base_name = 'user')
router.register(r'groups' , GroupViewSet)
router.register(r'usersAdminMode' , userAdminViewSet , base_name = 'userAdminMode')
router.register(r'userSearch' , UserSearchViewSet , base_name = 'userSearch')
router.register(r'profile' , userProfileViewSet , base_name ='profile')
router.register(r'profileAdminMode' , userProfileAdminModeViewSet , base_name ='profileAdminMode')
router.register(r'designation' , userDesignationViewSet , base_name = 'designation')
router.register(r'rank' , rankViewSet , base_name = 'rank')
router.register(r'payroll' , payrollViewSet , base_name = 'payroll')
router.register(r'leave' , leaveViewSet , base_name = 'leave')
router.register(r'sms' , SMSViewSet , base_name = 'sms')
router.register(r'call' , callViewSet , base_name = 'call')
router.register(r'email' , EmailViewSet , base_name = 'email')
router.register(r'location' , locationViewSet , base_name = 'location')
router.register(r'mobilecontact' , MobileContactViewSet , base_name = 'mobilecontact')
router.register(r'bankAccount' , BankAccountViewSet , base_name = 'bankAccount')
router.register(r'bankStatement' , BankStatementViewSet , base_name = 'bankStatement')
router.register(r'rawData' , RawDataViewSet , base_name = 'rawData')
router.register(r'settingTypes' , SettingTypesViewSet , base_name = 'settingTypes')

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'leavesCal/$' , LeavesCalAPI.as_view()),
    url(r'profileOrgCharts/$' , OrgChartAPI.as_view()),
    url(r'emailSave/$' , emailSaveAPI.as_view()),
    url(r'emailDataSave/$' , emailDataSaveAPI.as_view()),
    url(r'userCallHistoryGraph/$' , UserCallHistoryGraphAPI.as_view()),
    url(r'bankStatementUpload/$' , BankStatementUploadAPI.as_view()),
    url(r'fetchGraphData/$' , FetchGraphDataAPI.as_view()),
    url(r'smsClassifier/$' , SmsClassifierAPI.as_view()),
    url(r'smsTrainClassifier/$' , SmsTrainClassifierAPI.as_view()),
    url(r'emailsTrain/$' , EmailsTrainAPI.as_view()),
]
