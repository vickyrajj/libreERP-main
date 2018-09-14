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




urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'reviewHomeCal/$' , ReviewFilterCalAPIView.as_view() ),
    url(r'script/chatter/$' , GetChatterScriptAPI.as_view()),
    url(r'getMyUser/$' , GetMyUser.as_view()),
    url(r'getChatHistory/$' , GetChatHistory.as_view()),
    url(r'gethomeCal/$' , GethomeCal.as_view()),
    url(r'emailChat/$' , EmailChat.as_view()),

]
