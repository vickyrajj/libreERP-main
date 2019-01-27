from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
import random, string
from HR.serializers import userSearchSerializer

# class TopicLiteSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Topic
#         fields = ('pk' , 'created' , 'title' , 'description' )

class SubjectSerializer(serializers.ModelSerializer):
    topic_count = serializers.SerializerMethodField()
    # topic = serializers.SerializerMethodField()
    class Meta:
        model = Subject
        fields = ('pk' , 'created' , 'title', 'level' , 'description' , 'dp' , 'topic_count')

    def get_topic_count(self, obj):
        return obj.topics.all().count()
    # def get_topic(self, obj):
    #     return obj.topics.all()

class TopicSerializer(serializers.ModelSerializer):
    subject = SubjectSerializer(many = False , read_only = True)
    class Meta:
        model = Topic
        fields = ('pk' , 'created' , 'subject', 'title' , 'description' )

    def create(self , validated_data):
        print 'came here'
        print self.context['request'].data['subject']
        t = Topic(**validated_data)
        t.subject = Subject.objects.get(pk = self.context['request'].data['subject'])
        t.save()
        return t


class SectionSerializer(serializers.ModelSerializer):
    # book = BookSerializer(many = False , read_only = True)
    class Meta:
        model = Section
        fields = ('pk' , 'title' , 'book','sequence' ,'shortUrl','description','seoTitle')


class BookSerializer(serializers.ModelSerializer):
    subject = SubjectSerializer(many = False , read_only = True)
    sections = SectionSerializer(many = True , read_only = True)
    class Meta:
        model = Book
        fields = ('pk' , 'title' ,'subject', 'description', 'dp', 'author', 'ISSN'  , 'volume', 'version', 'license' ,'sections' )

    def create(self , validated_data):
        b = Book(**validated_data)
        b.subject = Subject.objects.get(pk = self.context['request'].data['subject'])
        b.save()
        return b

class QPartSerializer(serializers.ModelSerializer):
    class Meta:
        model = QPart
        fields = ('pk' , 'mode' , 'txt', 'image' ,'sequence')

class SubjectLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ('pk'  , 'title', 'level' )

class TopicLiteSerializer(serializers.ModelSerializer):
    subject = SubjectLiteSerializer(many = False , read_only = True)
    class Meta:
        model = Topic
        fields = ('pk', 'title' , 'subject' )

class BookLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ('pk'  , 'title')

class SectionLiteSerializer(serializers.ModelSerializer):
    book = BookLiteSerializer(many = False , read_only = True)
    class Meta:
        model = Section
        fields = ('pk', 'title' , 'book' ,'shortUrl')

class QuestionSerializer(serializers.ModelSerializer):
    quesParts = QPartSerializer(many = True , read_only = True)
    optionsParts = QPartSerializer(many = True , read_only = True)
    solutionParts = QPartSerializer(many = True , read_only = True)
    topic = TopicLiteSerializer(many = False , read_only = True)
    bookSection = SectionLiteSerializer(many = False , read_only = True)

    class Meta:
        model = Question
        fields = ('pk' , 'created' , 'updated', 'ques' , 'quesParts' , 'optionsParts' , 'solutionParts' , 'status', 'archived' , 'topic', 'level' , 'marks' , 'qtype' , 'codeLang' , 'user' , 'typ','bookSection', 'solutionVideoLink' , 'objectiveAnswer' , 'solutionVideo', 'solutionParts')
        read_only_fields = ('archived', 'approved', 'reviewed', 'forReview' , 'user')

    def create(self , validated_data):
        print '*****************'
        print validated_data,self.context['request'].data
        q = Question(**validated_data)
        q.user = self.context['request'].user
        if 'topic' in self.context['request'].data:
            q.topic = Topic.objects.get(pk=self.context['request'].data['topic'])
        if 'bookSection' in self.context['request'].data:
            q.bookSection = Section.objects.get(pk=self.context['request'].data['bookSection'])
        q.save()
        return q

    def update(self , instance , validated_data):
        if 'qPartToAdd' in self.context['request'].data:
            instance.quesParts.add(QPart.objects.get(pk = self.context['request'].data['qPartToAdd'] ))

        if 'qOptionToAdd' in self.context['request'].data:
            instance.optionsParts.add(QPart.objects.get(pk = self.context['request'].data['qOptionToAdd'] ))

        if 'qSolutionToAdd' in self.context['request'].data:
            instance.solutionParts.add(QPart.objects.get(pk = self.context['request'].data['qSolutionToAdd'] ))

        if 'ques' in validated_data:
            instance.ques = validated_data.pop('ques')
            instance.level = validated_data.pop('level')
            instance.qtype = validated_data.pop('qtype')
            if 'objectiveAnswer' in validated_data:
                instance.objectiveAnswer = validated_data.pop('objectiveAnswer')
            if 'solutionVideoLink' in validated_data:
                instance.solutionVideoLink = validated_data.pop('solutionVideoLink')

        if 'solutionVideo' in validated_data:
            instance.solutionVideo = validated_data.pop('solutionVideo')

        if 'topic' in validated_data:
            instance.topic_id = self.context['request'].data['topic']

        if 'typ' in validated_data:
            instance.typ = validated_data.pop('typ')


        if instance.qtype not in ['mcq' , 'mcc']:
            instance.optionsParts.clear()

        instance.save()

        return instance

class PaperQuesSerializer(serializers.ModelSerializer):
    ques = QuestionSerializer(many=False , read_only=True)
    class Meta:
        model = PaperQues
        fields = ('pk' , 'created' , 'updated', 'user', 'ques', 'marks','optional','negativeMarks' )
        read_only_fields = ('user', )

class PaperSerializer(serializers.ModelSerializer):
    questions = PaperQuesSerializer(many = True , read_only = True)
    class Meta:
        model = Paper
        fields = ('pk' , 'created' , 'updated', 'questions', 'active' , 'user','name','timelimit')
        read_only_fields = ('user', 'questions')
    def create(self , validated_data):
        m = Paper(**validated_data)
        m.user = self.context['request'].user
        if 'name' in self.context['request'].data:
            m.name = self.context['request'].data['name']
        if 'timelimit' in self.context['request'].data:
            m.timelimit = self.context['request'].data['timelimit']
        m.save()
        print self.context['request'].data['questions']
        for i in self.context['request'].data['questions']:
            i['ques']=Question.objects.get(id=i['ques'])
            pq = PaperQues(**i)
            pq.user = self.context['request'].user
            pq.save()
            m.questions.add(pq)
        m.save()
        return m

    def update(self , instance , validated_data):
        # for i in instance.questions.all():
        #     instance.questions.remove(i)
        instance.questions.clear()
        for i in self.context['request'].data['questions']:
            i['ques']=Question.objects.get(id=i['ques'])
            pq = PaperQues(**i)
            pq.user = self.context['request'].user
            pq.save()
            instance.questions.add(pq)
        if 'name' in self.context['request'].data:
            instance.name = self.context['request'].data['name']
        if 'timelimit' in self.context['request'].data:
            instance.timelimit = self.context['request'].data['timelimit']
        instance.save()
        return instance

class AnswerSerializer(serializers.ModelSerializer):
    subject = SubjectSerializer(many = False , read_only = True)
    class Meta:
        model = Answer
        fields = ('pk' , 'created' , 'question', 'paper' , 'evaluated' , 'correct', 'marksObtained' , 'attachment', 'txt' , 'subject')
        read_only_fields = ('user', )

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ('pk' , 'created' , 'txt', 'user')

class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ('pk' , 'created' , 'user' )

class StudyMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyMaterial
        fields = ('pk' , 'created' , 'typ', 'attachment', 'archived', 'course' , 'pinned' , 'likes'  , 'comments' , 'user', )
        read_only_fields = ('user', 'likes' , 'comments')
    def create(self , validated_data):
        sm = StudyMaterial(**validated_data)
        sm.user = self.context['request'].user
        sm.save()
        return sm

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = ('pk' , 'created' , 'course', 'addedBy', 'accepted', 'user' , 'active' )
        read_only_fields = ('addedBy',)
    def create(self , validated_data):
        e = Enrollment(**validated_data)
        e.addedBy = self.context['request'].user
        e.accepted = True
        e.save()
        return e

class CourseSerializer(serializers.ModelSerializer):
    enrollments = EnrollmentSerializer(many = True , read_only = True)
    studyMaterials = StudyMaterialSerializer(many = True , read_only = True)
    instructor = userSearchSerializer(many = False , read_only = True)
    topic = TopicSerializer(many = False , read_only = True)
    class Meta:
        model = Course
        fields = ('pk' , 'created' , 'updated', 'topic', 'enrollmentStatus', 'instructor' , 'TAs' , 'user' , 'description' , 'title' , 'enrollments' , 'studyMaterials')
        read_only_fields = ('user', 'TAs')
    def create(self , validated_data):
        c = Course(**validated_data)
        c.user = self.context['request'].user
        c.topic = Topic.objects.get(pk = self.context['request'].data['topic'])
        c.instructor = User.objects.get(pk = self.context['request'].data['instructor'])
        c.save()
        for u in self.context['request'].data['TAs'].split(','):
            c.TAs.add(User.objects.get(pk = int(u)))
        c.save()
        return c
    def update(self , instance , validated_data):
        for key in ['enrollmentStatus', 'description' , 'title' , 'enrollments' , 'studyMaterials','user']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        if 'topic' in self.context['request'].data:
            instance.topic = Topic.objects.get(pk =self.context['request'].data['topic'])

        if 'instructor' in self.context['request'].data:
            instance.instructor = User.objects.get(pk =self.context['request'].data['instructor'])

        for u in self.context['request'].data['TAs'].split(','):
            instance.TAs.add(User.objects.get(pk = int(u)))

        instance.save()
        return instance



class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ('pk' , 'created' , 'typ','user', 'comment' , 'video' , 'videoSeries','updated')
        read_only_fields = ('user',)
    def create(self , validated_data):
        f = Feedback(**validated_data)
        f.user = self.context['request'].user
        f.save()
        return f

class VideoSerializer(serializers.ModelSerializer):
    feedbacks = FeedbackSerializer(many = True , read_only = True)
    class Meta:
        model = Video
        fields = ('pk' , 'created' , 'description', 'title', 'user', 'channel' , 'thumbnail' , 'attachment','updated' ,'views' , 'feedbacks')
        read_only_fields = ('user',)
    def create(self , validated_data):
        v = Video(**validated_data)
        v.user = self.context['request'].user
        v.save()
        return v


class ChannelSerializer(serializers.ModelSerializer):
    videos = VideoSerializer(many = True , read_only = True)
    class Meta:
        model = Channel
        fields = ('pk' , 'created' , 'description', 'title', 'user', 'dp' ,'updated' , 'videos','version')
        read_only_fields = ('user',)
    def create(self , validated_data):
        print '@@@@@@@@@@@@@@'
        c = Channel(**validated_data)
        c.user = self.context['request'].user
        c.save()
        return c


class BookCourseMapSerializer(serializers.ModelSerializer):
    book = BookLiteSerializer(many = False , read_only = True)
    class Meta:
        model = BookCourseMap
        fields = ('pk' , 'book' , 'course', 'referenceBook' )
    def create(self , validated_data):
        print '@@@@@@@@@@@@@@'
        b = BookCourseMap(**validated_data)
        book = Book.objects.get(pk = self.context['request'].data['book'])
        b.book = book
        b.save()
        return b


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ('pk' , 'title' , 'description', 'urlSuffix', 'image' )

class NoteLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ('pk' , 'title')

class NotesSectionSerializer(serializers.ModelSerializer):
    note = NoteLiteSerializer(many = False , read_only = True)
    class Meta:
        model = NotesSection
        fields = ('pk' , 'note' , 'txt', 'image', 'mode' )
    def create(self , validated_data):
        n = NotesSection(**validated_data)
        note = Note.objects.get(pk = self.context['request'].data['note'])
        n.note = note
        n.save()
        return n

class AnnouncementSerializer(serializers.ModelSerializer):
    paper = PaperSerializer(many = False , read_only = True)
    # announcer = userSearchSerializer(many = False , read_only = True)
    class Meta:
        model = Announcement
        fields = ('pk' , 'created' , 'announcer', 'notified', 'notification', 'typ',  'paperDueDate', 'time', 'venue', 'txt' ,'meetingId','paper','date')
    def create(self , validated_data):
        p = Announcement(**validated_data)
        if 'paper' in  self.context['request'].data:
            paper = Paper.objects.get(pk = self.context['request'].data['paper'])
            p.paper = paper
        p.save()
        return p

class HomeworkSerializer(serializers.ModelSerializer):
    paper = PaperSerializer(many = False , read_only = True)
    class Meta:
        model = Homework
        fields = ('pk' , 'created' , 'course', 'paper', 'pdf', 'comment')
    def create(self , validated_data):
        p = Homework(**validated_data)
        if 'paper' in  self.context['request'].data:
            paper = Paper.objects.get(pk = self.context['request'].data['paper'])
            p.paper = paper
        p.save()
        return p
