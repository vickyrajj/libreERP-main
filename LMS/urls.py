from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()

router.register(r'qPart' , QPartViewSet , base_name ='qPart')
router.register(r'question' , QuestionViewSet , base_name ='question')
router.register(r'subject' , SubjectViewSet , base_name ='subject')
router.register(r'topic' , TopicViewSet , base_name ='topic')
router.register(r'paper' , PaperViewSet , base_name ='paper')
router.register(r'paperGroup' , PaperGroupViewSet , base_name ='paperGroup')
router.register(r'answer' , AnswerViewSet , base_name ='answer')
router.register(r'paperhistory' , PaperattemptHistory , base_name ='paperhistory')
router.register(r'course' , CourseViewSet , base_name ='course')
router.register(r'enrollment' , EnrollmentViewSet , base_name ='enrollment')
router.register(r'comment' , CommentViewSet , base_name ='comment')
router.register(r'like' , LikeViewSet , base_name ='like')
router.register(r'studyMaterial' , StudyMaterialViewSet , base_name ='studyMaterial')
router.register(r'quesPaper' , PaperQuesViewSet , base_name ='quesPaper')
router.register(r'channel' , ChannelViewSet , base_name ='channel')
router.register(r'video' , VideoViewSet , base_name ='video')
router.register(r'feedback' , FeedbackViewSet , base_name ='feedback')
router.register(r'book' , BookViewSet , base_name ='book')
router.register(r'section' , SectionViewSet , base_name ='section')
router.register(r'bookcoursemap' , BookCourseMapViewSet , base_name ='bookcoursemap')
router.register(r'note' , NoteViewSet , base_name ='note')
router.register(r'notesection' , NotesSectionViewSet , base_name ='notesection')
router.register(r'announcement' , AnnouncementViewSet , base_name ='announcement')
router.register(r'homework' , HomeworkViewSet , base_name ='homework')
router.register(r'forumthread' , ForumThreadViewSet , base_name ='forumthread')
router.register(r'forumcomment' , ForumCommentViewSet , base_name ='forumcomment')


urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'generateQuesPaper/$' , DownloadQuesPaper.as_view() ),
    url(r'questionsAutoCreate/$' , QuestionsAutoCreate.as_view() ),
    url(r'getLevelsAndBooks/$' , GetLevelsAndBooks.as_view() ),
    url(r'generatePdf/$' , GeneratePdf.as_view() ),

]
