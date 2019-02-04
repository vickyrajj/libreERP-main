from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User
from time import time

# Create your models here.
def getQAttachmentPath(instance , filename ):
    return 'lms/questions/%s_%s' % (str(time()).replace('.', '_'), filename)

def getStudyMaterialAttachmentPath(instance , filename ):
    return 'lms/studyMaterial/%s_%s' % (str(time()).replace('.', '_'), filename)

def getAnswerAttachmentPath(instance , filename ):
    return 'lms/answers/%s_%s' % (str(time()).replace('.', '_'), filename)

def getCourseDPAttachmentPath(instance , filename ):
    return 'lms/DP/%s_%s' % (str(time()).replace('.', '_'), filename)

def getVideoPath(instance , filename ):
    return 'lms/videos/%s_%s' % (str(time()).replace('.', '_'), filename)


def getVideoThumbnailPath(instance , filename ):
    return 'lms/videoThumbnail/%s_%s' % (str(time()).replace('.', '_'), filename)

def getChannelDPPath(instance , filename ):
    return 'lms/courseDP/%s_%s' % (str(time()).replace('.', '_'), filename)

def getSolutionVideoPath(instance , filename):
    return 'lms/solution/%s_%s' % (str(time()).replace('.', '_'), filename)

def getNoteImagePath(instance , filename ):
    return 'lms/noteImage/%s_%s' % (str(time()).replace('.', '_'), filename)

def getNoteSectionPath(instance , filename ):
    return 'lms/noteSection/%s_%s' % (str(time()).replace('.', '_'), filename)


def getHomeworkPath(instance , filename ):
    return 'lms/homework/%s_%s' % (str(time()).replace('.', '_'), filename)






PART_TYPE_CHOICES = (
    ('text' , 'text'),
    ('image' , 'image'),
)

LANGUAGE_CHOICES = (
    ("python", "Python"),
    ("bash", "Bash"),
    ("c", "C Language"),
    ("cpp", "C++ Language"),
    ("java", "Java Language"),
    ("scilab", "Scilab"),
    ("any", "any"),
)

class Subject(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateField(auto_now=True)
    title = models.CharField(max_length = 30 , null = False)
    level = models.PositiveIntegerField(null=True) # class
    description = models.TextField(max_length=2000 , null = False)
    dp = models.FileField(upload_to = getCourseDPAttachmentPath , null = True)
    class Meta:
        unique_together = ('title', 'level',)

    def get_absolute_url(self):
        #class-11-Mathematics
        return '/class-' + str(self.level) +'-' + self.title + '/'

class Topic(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateField(auto_now=True)
    subject = models.ForeignKey(Subject , null = False , related_name='topics')
    title = models.CharField(max_length = 30 , null = False)
    description = models.TextField(max_length=2000 , null = False)
    seoTitle = models.CharField(max_length = 30 , null = True)
    syllabus = models.TextField(null = True)

    def get_absolute_url(self):
        return '/class-' + str(self.subject.level) +'-' + self.subject.title + '-' + self.seoTitle +'-online-course/'

class Book(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateField(auto_now=True)
    title = models.CharField(max_length = 100 , null = False)
    subject = models.ForeignKey(Subject , null = False , related_name='books')
    description = models.TextField(max_length=2000 , null = True)
    dp = models.FileField(upload_to = getCourseDPAttachmentPath , null = True)
    author = models.CharField(max_length = 100 , null = True)
    ISSN = models.CharField(max_length = 100 , null = True)
    volume = models.CharField(max_length = 100 , null = True)
    version = models.CharField(max_length = 100 , null = True)
    license = models.CharField(max_length = 100 , null = True)

class Section(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateField(auto_now=True)
    title = models.CharField(max_length = 100 , null = False)
    sequence = models.PositiveIntegerField(null = True)
    book = models.ForeignKey(Book , null = False , related_name='sections')
    shortUrl = models.CharField(max_length = 100 , null = True , unique = True)
    description = models.TextField(max_length=2000 , null = True)
    seoTitle = models.CharField(max_length = 100 , null = True , unique = True)


    def get_absolute_url(self):
        return '/'+ self.shortUrl + '/'

QUESTION_LEVEL_CHOICES = (
    ("easy", "easy"),
    ("moderate", "moderate"),
    ("difficult", "difficult"),
)

QUESTION_STATUS_CHOICES = (
    ('submitted' , 'submitted'),
    ('reviewed' , 'reviewed'),
    ('approved' , 'approved'),
)


QUESTION_TYPE_CHOICES = (
    ("mcq", "Single Correct Choice"),
    ("mcc", "Multiple Correct Choices"),
    ("code", "Code"),
    ("upload", "Assignment Upload"),
    ("integer", "Answer in Integer"),
    ("string", "Answer in String"),
    ("float", "Answer in Float"),
)


class QPart(models.Model):
    mode = models.CharField(choices = PART_TYPE_CHOICES , default = 'text' , null = False, max_length = 10)
    txt = models.CharField(max_length = 2000 , null = True)
    image = models.FileField(upload_to = getQAttachmentPath , null = True)
    sequence = models.PositiveIntegerField(null = True)
    class Meta:
        ordering = ['sequence']


class Question(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateField(auto_now=True)
    ques = models.CharField(max_length = 5000 , null = False)
    quesParts = models.ManyToManyField(QPart , related_name='questions' , blank = True)
    optionsParts = models.ManyToManyField(QPart , related_name='questionsOptions' , blank = True)
    solutionParts = models.ManyToManyField(QPart , related_name='questionsSolutions' , blank = True)
    status = models.CharField(choices = QUESTION_STATUS_CHOICES , default = 'submitted' , max_length = 20)
    archived = models.BooleanField(default = False)
    topic = models.ForeignKey(Topic , null = True , related_name='questions')
    bookSection = models.ForeignKey(Section , null = True , related_name='questions')
    level = models.CharField(null=True , choices= QUESTION_LEVEL_CHOICES , max_length = 15)
    marks = models.PositiveIntegerField(null=True)
    qtype = models.CharField(choices = QUESTION_TYPE_CHOICES , default = 'mcq' , null = False, max_length = 10)
    codeLang = models.CharField(choices = LANGUAGE_CHOICES , default = 'any' , null = False, max_length = 10)
    user = models.ForeignKey(User , null = False , related_name='questionsAuthored')
    solutionVideo = models.FileField(null = True , upload_to=getSolutionVideoPath)
    solutionVideoLink = models.CharField(null = True , max_length = 500)
    objectiveAnswer = models.CharField(null = True , max_length = 50)
    typ = models.CharField(max_length = 7 , null = True)

class PaperQues(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateField(auto_now=True)
    user = models.ForeignKey(User , null = False , related_name='paperQuesAuthored')
    ques=models.ForeignKey(Question,null=True,related_name="paperquestion")
    marks=models.PositiveSmallIntegerField(null=False)
    optional=models.BooleanField(default=False)
    negativeMarks=models.FloatField(null=False)

class PaperGroup(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateField(auto_now=True)
    user = models.ForeignKey(User , null = True , related_name='paperGroupUser')
    title = models.CharField(null = True , max_length = 100)
    description = models.TextField(null = True)
    subject = models.ForeignKey(Subject , null = False , related_name='paperGroupSubject')

class Paper(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateField(auto_now=True)
    questions = models.ManyToManyField(PaperQues , blank = True)
    active = models.BooleanField(default = False)
    user = models.ForeignKey(User , null = False , related_name='papersAuthored')
    name = models.CharField(null = True , max_length = 100)
    level = models.CharField(null=True , choices= QUESTION_LEVEL_CHOICES , max_length = 15)
    description = models.TextField(null = True)
    timelimit = models.PositiveIntegerField(default= 0)
    group = models.ForeignKey(PaperGroup , null = True , related_name='papergroup')

class PaperattemptHistory(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    paper = models.ForeignKey(Paper , null = False , related_name='paperAttempted')
    user = models.ForeignKey(User , null = False , related_name='attemptedUser')
    mark = models.FloatField(default=0)
    reviewed=models.PositiveIntegerField(default= 0)
    attempted=models.PositiveIntegerField(default= 0)
    notattempted=models.PositiveIntegerField(default= 0)
    notview=models.PositiveIntegerField(default= 0)


CORRECTION_CHOICES = (
    ('yes' , 'yes'),
    ('no' , 'no'),
    ('partial' , 'partial'),
)



class Answer(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateField(auto_now=True)
    question = models.ForeignKey(Question , null = False , related_name='answersSubmssions')
    paper = models.ForeignKey(Paper , null = False , related_name='answersSubmssions')
    user = models.ForeignKey(User , null = False , related_name='answersSubmssions')
    evaluated = models.BooleanField(default = False)
    correct = models.CharField(choices = CORRECTION_CHOICES , default = 'no' , max_length = 10)
    marksObtained = models.FloatField(default=0)
    attachment = models.FileField(upload_to = getAnswerAttachmentPath , null = True)
    txt = models.TextField(max_length=10000 , null = True)

STUDY_MATERIAL_TYPE = (
    ('file' , 'file'),
    ('presentation' , 'presentation'),
    ('video' , 'video'),
    ('quiz' , 'quiz'),
    ('notes' , 'notes'),
    ('announcement' , 'announcement'),
)

ENROLLMENT_STATUS_CHOICES = (
    ('open' , 'open'),
    ('onInvitation' , 'onInvitation'),
    ('admin' , 'admin'),
    ('onRequest' , 'onRequest'),
    ('closed' , 'closed'),
)

class Course(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateField(auto_now=True)
    title = models.CharField(max_length = 100 , null = False)
    topic = models.ForeignKey(Topic , null = False, related_name='courses')
    enrollmentStatus = models.CharField(choices = ENROLLMENT_STATUS_CHOICES , max_length = 20 , default = 'pdf')
    instructor = models.ForeignKey(User , related_name='lmsCoursesInstructing' , null = True)
    TAs = models.ManyToManyField(User , related_name='lmsCourseAssisting' , blank = True)
    user = models.ForeignKey(User , related_name='courseCreated' , null = False)
    description = models.TextField(max_length=2000 , null = False)
    dp = models.FileField(upload_to = getCourseDPAttachmentPath , null = True)
    urlSuffix = models.CharField(max_length = 100 , null = True)

class Enrollment(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateField(auto_now=True)
    course = models.ForeignKey(Course , null = False , related_name='enrollments')
    addedBy = models.ForeignKey(User , related_name='lmsUsersAdded')
    accepted = models.BooleanField(default = True)
    user = models.ForeignKey(User , null = False)
    active = models.BooleanField(default = True)

# class subjectEnrollment(models.Model):
#     created = models.DateTimeField(auto_now_add = True)
#     updated = models.DateField(auto_now=True)
#     subject = models.ForeignKey(Subject , null = False , related_name='enrollments')
#     addedBy = models.ForeignKey(User , related_name='lmsUsersAdded')
#     accepted = models.BooleanField(default = True)
#     user = models.ForeignKey(User , null = False)
#     active = models.BooleanField(default = True)



class StudyMaterial(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateField(auto_now=True)
    typ = models.CharField(choices = STUDY_MATERIAL_TYPE , max_length = 20 , default = 'pdf')
    attachment = models.FileField(upload_to = getStudyMaterialAttachmentPath , null = True)
    archived = models.BooleanField(default = False)
    course = models.ForeignKey(Course , null = False , related_name='studyMaterials')
    pinned = models.BooleanField(default = False)
    user = models.ForeignKey(User , null = False)
    data = models.CharField(max_length = 100 , null = True)


class Comment(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    txt = models.CharField(max_length = 500 , null = False)
    user = models.ForeignKey(User , related_name='lmsMaterialComments' , null = False)
    studyMaterial = models.ForeignKey(StudyMaterial , related_name='comments' , null = False)


class Like(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    user = models.ForeignKey(User , related_name='lmsMaterialLikes' , null = False)
    studyMaterial = models.ForeignKey(StudyMaterial , related_name='likes' , null = False)


TYP_CHOICES = (
    ('comment','comment'),
    ('like','like'),
)



class Channel(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateField(auto_now=True)
    user = models.ForeignKey(User ,null = False , related_name ="lmsChannels")
    title = models.CharField(max_length = 100 , null = False)
    description = models.CharField(max_length = 20000 , null = False)
    dp = models.ImageField(upload_to = getChannelDPPath , null = True)
    version =  models.CharField(max_length = 100 , null = False)


class Video(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateField(auto_now=True)
    user = models.ForeignKey(User ,null = False , related_name ="videoUploads")
    title = models.CharField(max_length = 100 , null = False)
    description = models.CharField(max_length = 100 , null = False)
    # feedbacks = models.ManyToManyField(Feedback ,blank = True)
    views = models.PositiveIntegerField(default = 0)
    attachment = models.FileField(upload_to = getVideoPath , null = True)
    thumbnail = models.ImageField(upload_to = getVideoThumbnailPath , null = True)
    channel = models.ForeignKey(Channel , null = True , related_name ="videos")
    course = models.ForeignKey(Course , related_name = 'videos' , null = True)


class Feedback(models.Model):
    typ = models.CharField(choices = TYP_CHOICES , max_length = 10 , null = True)
    user = models.ForeignKey(User ,null = False)
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateField(auto_now=True)
    comment = models.CharField(null = True , max_length = 1000)
    video = models.ForeignKey(Video , null = True , related_name="feedbacks")
    videoSeries = models.ForeignKey(Channel , null = True , related_name="feedbacks")

    class Meta:
        unique_together = ('user', 'video', 'typ')


class BookCourseMap(models.Model):
    book = models.ForeignKey(Book , null = True , related_name="book")
    course = models.ForeignKey(Course , null = True , related_name="course")
    referenceBook = models.BooleanField(default = False)
    class Meta:
        unique_together = ('book','course')

class Note(models.Model):
    title =  models.CharField(max_length = 100 , null = True)
    description = models.TextField( null = False)
    urlSuffix = models.CharField(max_length = 100 , null = True)
    image =  models.FileField(upload_to = getNoteImagePath , null = True)
    course = models.ForeignKey(Course , null = True , related_name="courseNote")
    subject = models.ForeignKey(Subject , null = True , related_name='subject')


    def get_absolute_url(self):
        return '/'+ self.urlSuffix + '/'


class NotesSection(models.Model):
    note = models.ForeignKey(Note , null = True , related_name="note")
    txt = models.TextField( null = True)
    image = models.FileField(upload_to = getNoteSectionPath , null = True)
    mode = models.CharField(choices = PART_TYPE_CHOICES , default = 'text' , null = False, max_length = 10)
    sequence = models.PositiveIntegerField(null = True)
    class Meta:
        ordering = ['sequence']

NOTIFICATION_TYPE = (
    ('sms' , 'sms'),
    ('email' , 'email'),
    ('sms&email' , 'sms&email'),
)
ANNOUNCEMENT_TYP_CHOICES = (
    ('general','general'),
    ('quiz','quiz'),
    ('onlineclass','onlineclasss'),
    ('class','class'),
    ('offlinequiz','offlinequiz')
)

class Announcement(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    announcer = models.ForeignKey(User ,null = False , related_name ="announcements")
    notified = models.BooleanField(default = False)
    notification =  models.CharField(choices = NOTIFICATION_TYPE , max_length = 10 , null = True)
    typ = models.CharField(choices = ANNOUNCEMENT_TYP_CHOICES , max_length = 10 , null = True)
    paper = models.ForeignKey(Paper , null = True , related_name="paper")
    paperDueDate =  models.DateField(auto_now = False,null = True)
    time = models.DateTimeField(auto_now = False,null = True)
    venue =  models.CharField(max_length = 100 , null = True)
    txt =  models.TextField(null = True)
    meetingId = models.CharField(max_length = 100 , null = True)
    date = models.DateTimeField(auto_now = False,null= True)

class Homework(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    course = models.ForeignKey(Course , null = True , related_name="homeworkCourse")
    paper = models.ForeignKey(Paper , null = True , related_name="homeworkPaper")
    pdf = models.FileField(upload_to = getHomeworkPath , null = True)
    comment = models.TextField(null = True)
