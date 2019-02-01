from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()
router.register(r'customerProfile' , CustomerProfileViewSet , base_name = 'customerProfile')
router.register(r'supportChat' , SupportChatViewSet , base_name = 'supportChat')
router.register(r'visitor' , VisitorViewSet , base_name = 'visitor')
router.register(r'reviewComment' , ReviewCommentViewSet , base_name = 'reviewComment')
router.register(r'chatThread' , ChatThreadViewSet , base_name = 'chatThread')
router.register(r'documentation' , DocumentationViewSet , base_name = 'documentation')
router.register(r'getChatTranscripts' , GetChatTranscriptsViewSet , base_name = 'getChatTranscripts')
router.register(r'getVisitorDetails' , GetVisitorDetailsViewSet , base_name = 'getVisitorDetails')
router.register(r'getOfflineMessages' , GetOfflineMessagesViewSet , base_name = 'getOfflineMessages')
router.register(r'documentVersion' , DocumentVersionViewSet , base_name = 'documentVersion')
router.register(r'companyProcess' , CompanyProcessViewSet , base_name = 'companyProcess')
router.register(r'cannedResponses' , CannedResponsesViewSet , base_name = 'cannedResponses')
router.register(r'dynamicForms' , DynamicFormViewSet , base_name = 'dynamicForms')
router.register(r'dynamicFields' , DynamicFieldViewSet , base_name = 'dynamicFields')
router.register(r'activity' , ActivityFieldViewSet , base_name = 'activity')



urlpatterns = [
    url(r'^', include(router.urls)),
    # url(r'reviewHomeChats/$' , ReviewHomeChatsAPIView.as_view() ),
    url(r'reviewHomeCal/$' , ReviewFilterCalAPIView2.as_view() ),
    url(r'script/chatter/$' , GetChatterScriptAPI.as_view()),
    url(r'getMyUser/$' , GetMyUser.as_view()),
    url(r'getChatHistory/$' , GetChatHistory.as_view()),
    url(r'gethomeCal/$' , GethomeCal2.as_view()),
    url(r'emailChat/$' , EmailChat.as_view()),
    url(r'streamRecordings/$' , StreamRecordings.as_view()),
    url(r'emailScript/$' , EmailScript.as_view()),
    url(r'heartbeat/$' , HeartbeatApi.as_view()),
    url(r'getChatStatus/$' , getChatStatus.as_view()),
    url(r'createSVG/$' , CreateSVG.as_view()),

]
