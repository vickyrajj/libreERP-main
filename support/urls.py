from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()
router.register(r'customerProfile' , CustomerProfileViewSet , base_name = 'customerProfile')
router.register(r'supportChat' , SupportChatViewSet , base_name = 'supportChat')
router.register(r'visitor' , VisitorViewSet , base_name = 'visitor')
router.register(r'reviewComment' , ReviewCommentViewSet , base_name = 'reviewComment')
router.register(r'chatThread' , ChatThreadViewSet , base_name = 'chatThread')


urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'reviewHomeCal/$' , ReviewFilterCalAPIView.as_view() ),
    url(r'script/chatter/$' , getChatterScriptAPI.as_view()),
    url(r'getMyUser/$' , GetMyUser.as_view()),
]
