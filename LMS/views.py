from django.contrib.auth.models import User , Group
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate , login , logout
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse
from django.template import RequestContext
from django.conf import settings as globalSettings
# Related to the REST Framework
from rest_framework import viewsets , permissions , serializers
from rest_framework.exceptions import *
from url_filter.integrations.drf import DjangoFilterBackend
from API.permissions import *
from django.db.models import Q, F
from django.http import HttpResponse
from allauth.account.adapter import DefaultAccountAdapter
from rest_framework.views import APIView
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
import datetime
import json
import pytz
import requests
from django.template.loader import render_to_string, get_template
from django.core.mail import send_mail, EmailMessage
from .models import *
from .serializers import *
# import tempfile
# from backports import tempfile
from subprocess import Popen, PIPE
import os

class SectionViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = SectionSerializer
    queryset = Section.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['id','title' , 'book']

class BookViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = BookSerializer
    queryset = Book.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['title']

class QPartViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = QPartSerializer
    queryset = QPart.objects.all()

class QuestionViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = QuestionSerializer
    queryset = Question.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['topic' , 'ques' , 'bookSection','typ', 'id']

class PaperQuesViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = PaperSerializer
    queryset = PaperQues.objects.all()

class DownloadQuesPaper(APIView):
    permission_classes = (permissions.AllowAny, )
    renderer_classes = (JSONRenderer,)
    def get(self , request , format = None):
        p = Paper.objects.get(pk = request.GET.get('paper',None))
        print p.pk,'***************'
        ques=Question.objects.filter(id__in = [i.ques.pk for i in p.questions.all()])
        tex_body = get_template('my_latex_template.tex').render({"ques" : ques})
        content= str(tex_body)
        print content
        response = HttpResponse(content,content_type='text/plain')
        response['Content-Disposition'] = 'attachment; filename="questionPaper%s_%s.txt"' %(p.pk,datetime.datetime.now(pytz.timezone('Asia/Kolkata')).year)
        f = open('./media_root/questionPaper%s_%s.txt'%(p.pk,datetime.datetime.now(pytz.timezone('Asia/Kolkata')).year) , 'wb')
        f.write(response.content)
        f.close()
        return response


        # p = Paper.objects.get(pk = request.GET.get('paper',None))
        # print p.pk,'***************'
        # ques=Question.objects.filter(id__in = [i.ques.pk for i in p.questions.all()])
        # tex_body = get_template('my_latex_template.tex').render({"ques" : ques})
        # content= str(tex_body)
        # print content
        # with tempfile.TemporaryDirectory() as tempdir:
        #     # Create subprocess, supress output with PIPE and
        #     # run latex twice to generate the TOC properly.
        #     # Finally read the generated pdf.
        #     for i in range(2):
        #         process = Popen(['pdflatex', '-output-directory', tempdir],stdin=PIPE,stdout=PIPE,shell=True)
        #         process.communicate(content)
        #     with open(os.path.join(tempdir, 'texput.pdf'), 'rb') as f:
        #         pdf = f.read()
        # response = HttpResponse(content,content_type='text/plain')
        # response['Content-Disposition'] = 'attachment; filename="questionPaper%s_%s.txt"' %(p.pk,datetime.datetime.now(pytz.timezone('Asia/Kolkata')).year)
        # f = open('./media_root/questionPaper%s_%s.txt'%(p.pk,datetime.datetime.now(pytz.timezone('Asia/Kolkata')).year) , 'wb')
        # f.write(response.content)
        # f.close()
        # return response


        # with tempfile.TemporaryDirectory() as tempdir:
        #     # Create subprocess, supress output with PIPE and
        #     # run latex twice to generate the TOC properly.
        #     # Finally read the generated pdf.
        #     for i in range(2):
        #         process = Popen(['pdflatex', '-output-directory', tempdir],stdin=PIPE,stdout=PIPE,shell=True)
        #         process.communicate(rendered_tpl)
        #     # with open(os.path.join(tempdir, 'texput.pdf'), 'rb') as f:
        #     #     pdf = f.read()
        # return queryset

class SubjectViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = SubjectSerializer
    queryset = Subject.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['title']

class TopicViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = TopicSerializer
    queryset = Topic.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['title' , 'subject']

class PaperViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny, )
    serializer_class = PaperSerializer
    queryset = Paper.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name']

class PaperGroupViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = PaperGroupSerializer
    queryset = PaperGroup.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['title','subject']

class PaperattemptHistory(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = PaperattemptHistorySerializer
    queryset = PaperattemptHistory.objects.all()
    

class AnswerViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = AnswerSerializer
    queryset = Answer.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['user','paper']

class CourseViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = CourseSerializer
    queryset = Course.objects.all()

class EnrollmentViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = EnrollmentSerializer
    queryset = Enrollment.objects.all()

class CommentViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = CommentSerializer
    queryset = Comment.objects.all()

class LikeViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = LikeSerializer
    queryset = Like.objects.all()

class StudyMaterialViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = StudyMaterialSerializer
    queryset = StudyMaterial.objects.all()

class ChannelViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = ChannelSerializer
    queryset = Channel.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['title']

class VideoViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = VideoSerializer
    queryset = Video.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['title']

class FeedbackViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = FeedbackSerializer
    queryset = Feedback.objects.all()

from django.core.files import File
from django.core.files.temp import NamedTemporaryFile
import urllib2

class QuestionsAutoCreate(APIView):
    permission_classes = (permissions.AllowAny, )
    renderer_classes = (JSONRenderer,)
    def get(self , request , format = None):
        print 'auto createeeeeeeeeeeee'
        baseDir = globalSettings.BASE_DIR
        subjectData = []
        topicData = []
        bookData = []
        sectionData = []
        questionsData = []
        with open(str(baseDir)+'/subject.json') as f:
            subjectData = json.load(f)
        with open(str(baseDir)+'/topic.json') as f:
            topicData = json.load(f)
        with open(str(baseDir)+'/book.json') as f:
            bookData = json.load(f)
        with open(str(baseDir)+'/section.json') as f:
            sectionData = json.load(f)
        with open(str(baseDir)+'/24tutors_questions.json') as f:
            questionsData = json.load(f)

        # deleting previous oneeee

        Subject.objects.all().delete()
        Topic.objects.all().delete()
        Book.objects.all().delete()
        Section.objects.all().delete()
        QPart.objects.all().delete()
        Question.objects.all().delete()

        subCreateData = []
        for i in subjectData:
            if i['dp']:
                subObj = Subject.objects.create(pk=i['pk'],title=i['title'],description=i['description'],level=i['level'])
                try:
                    file_name = i['dp'].split('/')[-1].split('_')[-1]
                    img_temp = NamedTemporaryFile(delete=True)
                    img_temp.write(urllib2.urlopen(i['dp']).read())
                    img_temp.flush()
                    subObj.dp.save(file_name, File(img_temp))
                except:
                    pass
            else:
                subCreateData.append(Subject(pk=i['pk'],title=i['title'],description=i['description'],level=i['level']))
        Subject.objects.bulk_create(subCreateData)

        topicCreateData = []
        for i in topicData:
            if i['subject']:
                sub = Subject.objects.get(pk=i['subject']['pk'])
                topicCreateData.append(Topic(pk=i['pk'],title=i['title'],description=i['description'],subject=sub))
        Topic.objects.bulk_create(topicCreateData)

        bookCreateData = []
        for i in bookData:
            if i['subject']:
                sub = Subject.objects.get(pk=i['subject']['pk'])
                if i['dp']:
                    bookObj = Book.objects.create(pk=i['pk'],title=i['title'],description=i['description'],subject=sub,author=i['author'],ISSN=i['ISSN'],volume=i['volume'],version=i['version'],license=i['license'])
                    try:
                        file_name = i['dp'].split('/')[-1].split('_')[-1]
                        img_temp = NamedTemporaryFile(delete=True)
                        img_temp.write(urllib2.urlopen(i['dp']).read())
                        img_temp.flush()
                        bookObj.dp.save(file_name, File(img_temp))
                    except:
                        pass
                else:
                    bookCreateData.append(Book(pk=i['pk'],title=i['title'],description=i['description'],subject=sub,author=i['author'],ISSN=i['ISSN'],volume=i['volume'],version=i['version'],license=i['license']))

        Book.objects.bulk_create(bookCreateData)

        sectionCreateData = []
        for i in sectionData:
            if i['book']:
                bk = Book.objects.get(pk=i['book'])
                sectionCreateData.append(Section(pk=i['pk'],title=i['title'],shortUrl=i['shortUrl'],book=bk,sequence=i['sequence']))
        Section.objects.bulk_create(sectionCreateData)

        for i in questionsData:
            if i['user']:
                usr = User.objects.get(pk=i['user'])
                topic = None
                bookSection = None
                if i['topic']:
                    topic = Topic.objects.get(pk=i['topic']['pk'])
                if i['bookSection']:
                    bookSection = Section.objects.get(pk=i['bookSection']['pk'])
                quesObj = Question.objects.create(pk=i['pk'],ques=i['ques'],status=i['status'],archived=i['archived'],level=i['level'],marks=i['marks'],qtype=i['qtype'],codeLang=i['codeLang'],typ=i['typ'],solutionVideoLink=i['solutionVideoLink'],objectiveAnswer=i['objectiveAnswer'],user=usr,topic=topic,bookSection=bookSection)

                try:
                    if i['solutionVideo']:
                        file_name = i['solutionVideo'].split('/')[-1].split('_')[-1]
                        img_temp = NamedTemporaryFile(delete=True)
                        img_temp.write(urllib2.urlopen(i['solutionVideo']).read())
                        img_temp.flush()
                        quesObj.solutionVideo.save(file_name, File(img_temp))
                except:
                    pass

                for j in i['quesParts']:
                    qpObj , created = QPart.objects.get_or_create(pk=j['pk'],mode=j['mode'],txt=j['txt'])
                    try:
                        if created and j['image']:
                            file_name = j['image'].split('/')[-1].split('_')[-1]
                            img_temp = NamedTemporaryFile(delete=True)
                            img_temp.write(urllib2.urlopen(j['image']).read())
                            img_temp.flush()
                            qpObj.image.save(file_name, File(img_temp))
                    except:
                        pass
                    quesObj.quesParts.add(qpObj)

                for j in i['optionsParts']:
                    qpObj , created = QPart.objects.get_or_create(pk=j['pk'],mode=j['mode'],txt=j['txt'])
                    try:
                        if created and j['image']:
                            file_name = j['image'].split('/')[-1].split('_')[-1]
                            img_temp = NamedTemporaryFile(delete=True)
                            img_temp.write(urllib2.urlopen(j['image']).read())
                            img_temp.flush()
                            qpObj.image.save(file_name, File(img_temp))
                    except:
                        pass
                    quesObj.optionsParts.add(qpObj)

                for j in i['solutionParts']:
                    qpObj , created = QPart.objects.get_or_create(pk=j['pk'],mode=j['mode'],txt=j['txt'])
                    try:
                        if created and j['image']:
                            file_name = j['image'].split('/')[-1].split('_')[-1]
                            img_temp = NamedTemporaryFile(delete=True)
                            img_temp.write(urllib2.urlopen(j['image']).read())
                            img_temp.flush()
                            qpObj.image.save(file_name, File(img_temp))
                    except:
                        pass
                    quesObj.solutionParts.add(qpObj)
                print 'quess createddddddddddd',i['pk']

        # print questionsData
        return Response([] , status = status.HTTP_200_OK)


class GetLevelsAndBooks(APIView):
    permission_classes = (permissions.AllowAny, )
    renderer_classes = (JSONRenderer,)
    def get(self , request , format = None):
        print 'hereeeeeeee'
        LevelsAndBooks = []
        allLevels =  list(Subject.objects.filter().values_list('level',flat = True).distinct())
        for i in allLevels:
            book = list(Book.objects.filter(subject__level = i).values('title',subjectName = F('subject__title')))
            # print book,'bookbookbookbook'
            toAppend = {'level': i, 'book': book}
            LevelsAndBooks.append(toAppend)
            print toAppend
        return Response({'LevelsAndBooks':LevelsAndBooks} , status = status.HTTP_200_OK)


class BookCourseMapViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = BookCourseMapSerializer
    queryset = BookCourseMap.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['course']

class NoteViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = NoteSerializer
    queryset = Note.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['course']

class NotesSectionViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = NotesSectionSerializer
    queryset = NotesSection.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['note']

class AnnouncementViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = AnnouncementSerializer
    queryset = Announcement.objects.all()

class HomeworkViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = HomeworkSerializer
    queryset = Homework.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['course']
