from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
from HR.serializers import userSearchSerializer
from rest_framework.response import Response
from fabric.api import *
import os
import json
import operator
from django.db.models import Q
from django.conf import settings as globalSettings
from datetime import date,timedelta
from dateutil.relativedelta import relativedelta
from django.core.mail import send_mail , EmailMessage


def campaigncontactsList(campId):
    campObj = Campaign.objects.get(pk=campId)
    tagsList = list(campObj.tags.all().values_list('id',flat=True))
    sourceList = []
    print tagsList
    if campObj.source:
        for i in json.loads(campObj.source):
            # print i,type(i)
            sourceList.append(str(i['source']))
    print sourceList
    if campObj.filterFrom and campObj.filterTo:
        fromDate = str(campObj.filterFrom).split('-')
        toDate = str(campObj.filterTo).split('-')
        fd = date(int(fromDate[0]), int(fromDate[1]), int(fromDate[2]))
        td = date(int(toDate[0]), int(toDate[1]), int(toDate[2]))
        print fd,td
        if len(sourceList) > 0:
            query = reduce(operator.or_, (Q(source = item) for item in sourceList))
            dataSend = Contacts.objects.filter(query | Q(tags__in = tagsList) , created__range=(fd,td)).distinct().values('name','email','mobile','source','pinCode','pk')
        else:
            dataSend = Contacts.objects.filter(tags__in = tagsList , created__range=(fd,td)).distinct().values('name','email','mobile','source','pinCode','pk')
        # print dataSend
        # print Contacts.objects.filter(query & Q(created__range=(fd,td)))
    else:
        query = reduce(operator.or_, (Q(source = item) for item in sourceList))
        dataSend = Contacts.objects.filter(query | Q(tags__in = tagsList)).distinct().values('name','email','mobile','source','pinCode','pk')
        # print dataSend
    return dataSend


class TagSerializer(serializers.ModelSerializer):
    tagsCount = serializers.SerializerMethodField()
    class Meta:
        model = Tag
        fields = ('pk' , 'created' , 'name' ,'tagsCount')
    def get_tagsCount(self,obj):
        if 'fd' in self.context['request'].GET and len(self.context['request'].GET['fd']) > 0:
            fromDate = self.context['request'].GET['fd'].split('-')
            toDate = self.context['request'].GET['td'].split('-')
            print fromDate,toDate
            fd = date(int(fromDate[0]), int(fromDate[1]), int(fromDate[2]))
            td = date(int(toDate[0]), int(toDate[1]), int(toDate[2]))
            # fromDate = fd + relativedelta(days=1)
            # toDate = td + relativedelta(days=1)
            print fd,td,obj.contacts_set.filter(created__range=(fd,td))
            return obj.contacts_set.filter(created__range=(str(fd),str(td))).count()
        else:
            return obj.contacts_set.all().count()

class ContactsSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True,read_only=True)
    # srcCount = serializers.SerializerMethodField()
    class Meta:
        model = Contacts
        fields = ('pk' , 'created' , 'referenceId' , 'name', 'email', 'mobile' , 'source' , 'pinCode' , 'notes' , 'tags' ,'subscribe' )
        read_only_fields=('subscribe',)
    def create(self , validated_data):
        print self.context['request'].data['tags'],validated_data
        try:
            contatcObj = Contacts.objects.get(email=self.context['request'].data['email'],source=self.context['request'].data['source'])
            contatcObj.subscribe = True
            for key in ['referenceId' , 'name','mobile' ,'notes' , 'pinCode']:
                try:
                    setattr(contatcObj , key , validated_data[key])
                except:
                    pass
            contatcObj.save()
            print 'contact already thereeeeeeeee'
        except:
            pass

        if 'tags' in validated_data:
            del validated_data['tags']
        c = Contacts(**validated_data)
        c.subscribe = True
        c.save()
        if 'tags' in self.context['request'].data:
            for i in self.context['request'].data['tags']:
                c.tags.add(Tag.objects.get(pk = int(i)))
        return c
    def update(self ,instance, validated_data):
        for key in ['referenceId' , 'name', 'email', 'mobile' , 'source' , 'notes' , 'pinCode']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        instance.save()
        instance.tags.clear()
        for i in self.context['request'].data['tags']:
            instance.tags.add(Tag.objects.get(pk = int(i)))
        return instance

    # def get_srcCount(self,obj):
    #     return Contacts.objects.filter(source = obj.source).count()


class CampaignSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True,read_only=True)
    class Meta:
        model = Campaign
        fields = ('pk' , 'created' ,  'name', 'source' , 'tags' ,'filterFrom' , 'filterTo' , 'status' , 'typ' , 'participants' , 'msgBody' , 'emailSubject' , 'emailBody' , 'directions')
    def create(self , validated_data):
        print self.context['request'].data,validated_data
        if 'tags' in validated_data:
            del validated_data['tags']
        c = Campaign(**validated_data)
        c.save()
        if 'tags' in self.context['request'].data :
            for i in self.context['request'].data['tags']:
                c.tags.add(Tag.objects.get(pk = int(i)))
        return c
    def update(self ,instance, validated_data):
        print validated_data,self.context['request'].data,instance.pk
        for key in ['name', 'source' ,'filterFrom' , 'filterTo' , 'status' , 'typ' , 'msgBody' , 'emailSubject' , 'emailBody' , 'directions']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        instance.save()
        if 'tags' in self.context['request'].data:
            instance.tags.clear()
            for i in self.context['request'].data['tags']:
                instance.tags.add(Tag.objects.get(pk = int(i)))
        if 'participants' in self.context['request'].data:
            instance.participants.clear()
            for i in self.context['request'].data['participants']:
                instance.participants.add(User.objects.get(pk = int(i)))
        if 'logs' in self.context['request'].data :
            if self.context['request'].data['typ'] == 'email' or self.context['request'].data['typ'] == 'sms':
                if self.context['request'].data['typ'] == 'email':
                    data = {'typ':'emailSent'}
                else:
                    data = {'typ':'smsSent'}
                userData = campaigncontactsList(instance.pk)
                for i in list(userData):
                    c = CampaignLogs(**data)
                    c.user = self.context['request'].user
                    c.contact = Contacts.objects.get(pk = int(i['pk']))
                    c.campaign = Campaign.objects.get(pk = instance.pk)
                    c.save()
                    print i

        return instance

class CampaignLogsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampaignLogs
        fields = ('pk' , 'created' , 'user' , 'contact', 'campaign', 'data' , 'typ' , 'followupDate')
    def create(self , validated_data):
        print self.context['request'].data,validated_data
        c = CampaignLogs(**validated_data)
        c.user = self.context['request'].user
        c.contact = Contacts.objects.get(pk = self.context['request'].data['contact'])
        c.campaign = Campaign.objects.get(pk = self.context['request'].data['campaign'])
        c.save()
        return c

# class LeadsSerializer(serializers.ModelSerializer):
#     logs = serializers.SerializerMethodField()
#     class Meta:
#         model = Contacts
#         fields = ('pk' , 'created' , 'referenceId' , 'name', 'email', 'mobile' , 'source' , 'pinCode' , 'notes' , 'tags' , 'logs')

    def get_logs(self,obj):
        return CampaignLogs.objects.filter(contact = obj.pk).values('pk' , 'created' , 'user' , 'contact', 'campaign', 'data' , 'typ' , 'followupDate')

class SheduleSerializer(serializers.ModelSerializer):
    organizer = userSearchSerializer(many=False,read_only=True)
    participants = userSearchSerializer(many=True,read_only=True)
    class Meta:
        model = Schedule
        fields = ('pk','created','dated','slot','name','emailId','organizer','participants','status')

    def create(self , validated_data):
        print self.context['request'].data,validated_data
        s = Schedule(**validated_data)
        s.save()
        if 'source' in self.context['request'].data:
            try:
                contatcObj = Contacts.objects.get(email=self.context['request'].data['emailId'],source=self.context['request'].data['source'])
                print 'contact already thereeeeeeeee'
            except:
                dt = {'email':self.context['request'].data['emailId'],'source':self.context['request'].data['source']}
                contatcObj = Contacts.objects.create(**dt)
                print 'new contact createddddddddddd'
        return s
    def update(self ,instance, validated_data):
        for key in ['dated','slot','name','emailId','status']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        instance.save()
        if 'organizer' in self.context['request'].data:
            instance.organizer = User.objects.get(pk=int(self.context['request'].data['organizer']))
            instance.save()
        emailUserList = []
        if 'participantsPksList' in self.context['request'].data:
            instance.participants.clear()
            for i in self.context['request'].data['participantsPksList']:
                userObj = User.objects.get(pk = int(i))
                emailUserList.append(userObj.email)
                instance.participants.add(userObj)
        try:
            if instance.status == 'Assigned' and len(emailUserList) > 0:
                print emailUserList,'sending emailllllllll'
                email_subject = 'Invitation For Demo'
                email_body = 'Hi , \nYou Have Been Invited For Demo on {0} at {1}\nThe Organizer For This Demo is {2} {3}'.format(instance.dated,instance.slot,instance.organizer.first_name,instance.organizer.last_name)
                msg = EmailMessage(email_subject , email_body, to= emailUserList)
                msg.send()
        except:
            print 'invalid user emals'
            pass
        return instance

class LeadsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Leads
        fields = ('pk','created','name','emailId','requirements','jobLevel','company','companyCategory','companyExpertise','country','mobileNumber')

    def create(self , validated_data):
        print self.context['request'].data,validated_data
        l = Leads(**validated_data)
        l.save()
        if 'source' in self.context['request'].data:
            try:
                contatcObj = Contacts.objects.get(email=self.context['request'].data['emailId'],source=self.context['request'].data['source'])
                contatcObj.name = self.context['request'].data['name']
                if 'mobileNumber' in self.context['request'].data:
                    contatcObj.mobile = self.context['request'].data['mobileNumber']
                contatcObj.save()
                print 'contact already thereeeeeeeee'
            except:
                dt = {'email':self.context['request'].data['emailId'],'source':self.context['request'].data['source']}
                contatcObj = Contacts.objects.create(**dt)
                print 'new contact createddddddddddd'
        return l
