
from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
from HR.views import generateOTPCode
import hashlib
import random, string
from django.core.exceptions import ObjectDoesNotExist , SuspiciousOperation
from django.contrib.auth import authenticate , login , logout
from django.shortcuts import redirect , get_object_or_404
from django.conf import settings as globalSettings
from ERP.models import application, permission , module
import requests
from HR.models import profile
from django.template.loader import render_to_string, get_template
from django.core.mail import send_mail, EmailMessage
import ast
import sendgrid
import os
import unicodedata
from ERP.models import appSettingsField
from ERP.send_email import send_email


def merge_two_dicts(x, y):
    z = x.copy()   # start with x's keys and values
    z.update(y)    # modifies z with y's keys and values & returns None
    return z


def sendMail(d):
    ctx = {
        'user':d,
        'brandName':globalSettings.SEO_TITLE
    }
    email_body = get_template('app.ecommerce.newUserEmail.html').render(ctx)
    email_subject = 'New User'

    # if globalSettings.EMAIL_API:
    #     sg = sendgrid.SendGridAPIClient(apikey= globalSettings.G_KEY)
    #     # sg = sendgrid.SendGridAPIClient(apikey=os.environ.get('SENDGRID_API_KEY'))
    #     for i in globalSettings.G_ADMIN:
    #         emails.append({"email":i})
    #     data = {
    #       "personalizations": [
    #         {
    #           "to": emails,
    #           "subject": email_subject
    #         }
    #       ],
    #       "from": {
    #         "email": globalSettings.G_FROM,
    #         "name":globalSettings.SEO_TITLE
    #       },
    #       "content": [
    #         {
    #           "type": "text/html",
    #           "value": email_body
    #         }
    #       ]
    #     }
    #     response = sg.client.mail.send.post(request_body=data)
    #     print(response.body,"bodyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy")
    # else:
    #     sentEmail=[]
    #     sentEmail.append(str(email))
    #     # msg = EmailMessage(email_subject, email_body, to= sentEmail , from_email= 'do_not_reply@cioc.co.in' )
    #     msg = EmailMessage(email_subject, email_body, to= sentEmail)
    #     msg.content_subtype = 'html'
    #     msg.send()

    email_body = get_template('app.ecommerce.newUserEmail.html').render(ctx)
    email_subject = 'New User'
    email_to=[]
    for i in globalSettings.G_ADMIN:
        email_to.append(str(i))
    email_cc = []
    email_bcc = []
    send_email(email_body,email_to,email_subject,email_cc,email_bcc,'html')




    try:
        phone = appSettingsField.objects.filter(name='phone')[0].value
    except:
        phone = ''

    try:
        email = appSettingsField.objects.filter(name='email')[0].value
    except:
        email = ''

    websiteAddress = globalSettings.SITE_ADDRESS
    ctx = {
        'user':d,
        'brandName':globalSettings.SEO_TITLE,
        'brandLogo': globalSettings.ICON_LOGO,
        'phone':phone,
        'email':email,
        'websiteAddress':websiteAddress
    }
    email_body = get_template('app.ecommerce.mailToNewUser.html').render(ctx)
    email_subject = 'Welcome!'
    email_to=[]
    email_to.append(str(d['email']))
    email_cc = []
    email_bcc = []
    send_email(email_body,email_to,email_subject,email_cc,email_bcc,'html')



class EnquiryAndContactsSerializer(serializers.ModelSerializer):
    class Meta:
        model = EnquiryAndContacts
        fields = ('pk', 'created' , 'name' , 'mobile' , 'email' , 'notes')


class RegistrationSerializer(serializers.ModelSerializer):
    # to be used in the typehead tag search input, only a small set of fields is responded to reduce the bandwidth requirements
    class Meta:
        model = Registration
        fields = ('pk', 'created' , 'token' , 'mobileOTP' , 'emailOTP' , 'email', 'mobile')
        read_only_fields = ( 'token' , 'mobileOTP' , 'emailOTP')



    def update(self , instance , validated_data):
        print "updateeeeaaaaaaaaaaa", self.context['request'].data;
        print instance
        print validated_data
        if 'emailOTP' in self.context['request'].data:
            print 'coommmmmmmmmreeeeeeeeherere'
            d = self.context['request'].data;
            if not globalSettings.VERIFY_MOBILE:
                if( d['token'] == instance.token and d['emailOTP']== instance.emailOTP ):
                    print "will create a new user"
                    print d,'bodyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy'
                    u = User(username = d['email'].split('@')[0])
                    u.first_name = d['firstName']
                    u.email = d['email']
                    u.last_name = d['lastName']
                    u.set_password(d['password'])
                    if globalSettings.AUTO_ACTIVE_ON_REGISTER == False:
                        u.is_active = False
                        adminData =  User.objects.get(pk=1)
                        print adminData.email,'*************************888'
                        msgBody = ['Provide the user permission for new registered customer Name : <strong>%s</strong> with EmailID : <strong>%s</strong>' %(u.first_name , u.email) ]

                        try:
                            fbUrl = appSettingsField.objects.filter(name='facebookLink')[0].value
                        except:
                            fbUrl = 'https://www.facebook.com/'

                        try:
                            twitterUrl = appSettingsField.objects.filter(name='twitterLink')[0].value
                        except:
                            twitterUrl = 'twitter.com'

                        try:
                            linkedinUrl = appSettingsField.objects.filter(name='linkedInLink')[0].value
                        except:
                            linkedinUrl = 'https://www.linkedin.com/'

                        try:
                            sendersAddress = appSettingsField.objects.filter(name='companyAddress')[0].value
                        except:
                            sendersAddress = ''

                        try:
                            sendersPhone =  appSettingsField.objects.filter(name='phone')[0].value
                        except:
                            sendersPhone = ''


                        ctx = {
                            'heading' : 'Welcome to Ecommerce',
                            'recieverName' : 'Admin',
                            'message': msgBody,
                            # 'linkUrl': 'sterlingselect.com',
                            # 'linkText' : 'View Online',
                            'sendersAddress' : sendersAddress,
                            'sendersPhone' : sendersPhone,
                            'linkedinUrl' : linkedinUrl,
                            'fbUrl' : twitterUrl,
                            'twitterUrl' : twitterUrl,
                            'brandName' : globalSettings.BRAND_NAME,
                        }
                        email_body = get_template('app.homepage.permission.html').render(ctx)
                        email_subject = 'Permission for the new user'
                        # if globalSettings.EMAIL_API:
                        #     sg = sendgrid.SendGridAPIClient(apikey= globalSettings.G_KEY)
                        #     # sg = sendgrid.SendGridAPIClient(apikey=os.environ.get('SENDGRID_API_KEY'))
                        #     data = {
                        #       "personalizations": [
                        #         {
                        #           "to": [
                        #             {
                        #               "email": str(globalSettings.G_ADMIN[0])
                        #               # str(orderObj.user.email)
                        #             }
                        #           ],
                        #           "subject": email_subject
                        #         }
                        #       ],
                        #       "from": {
                        #         "email": globalSettings.G_FROM,
                        #         "name":globalSettings.SEO_TITLE
                        #       },
                        #       "content": [
                        #         {
                        #           "type": "text/html",
                        #           "value": email_body
                        #         }
                        #       ]
                        #     }
                        #     response = sg.client.mail.send.post(request_body=data)
                        #     print(response.body,"bodyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy")
                        # else:
                        #     sentEmail=[]
                        #     sentEmail.append(str(adminData.email))
                        #     # msg = EmailMessage(email_subject, email_body, to= sentEmail , from_email= 'do_not_reply@cioc.co.in' )
                        #     msg = EmailMessage(email_subject, email_body, to= sentEmail)
                        #     msg.content_subtype = 'html'
                        #     msg.send()


                        email_body = get_template('app.homepage.permission.html').render(ctx)
                        email_subject = 'Permission for the new user'
                        email_to=[]
                        for i in globalSettings.G_ADMIN:
                            email_to.append(str(i))
                        email_cc = []
                        email_bcc = []
                        send_email(email_body,email_to,email_subject,email_cc,email_bcc,'html')


                    else:
                        u.is_active = True
                    if d['designation']:
                        if d['designation'] == 'manager' or 'admin' or 'director':
                            u.is_staff = True
                        else:
                            u.is_staff = False

                    # u.is_active = True
                    u.save()

                    if 'email' in d:
                        sendMail(d)
                    print u.profile.pk ,'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG'
                    pobj = profile.objects.get(pk=u.profile.pk)
                    try:
                        pobj.details = d
                        pobj.mobile = instance.mobile
                    except:
                        pass
                    pobj.save()
                    for a in globalSettings.DEFAULT_APPS_ON_REGISTER:
                        app = application.objects.get(name = a)
                        p = permission.objects.create(app =  app, user = u , givenBy = User.objects.get(pk=1))
                    login(self.context['request'] , u,backend='django.contrib.auth.backends.ModelBackend')
                    instance.delete()
                    return instance
                else:
                    raise SuspiciousOperation('Expired')
            else:
                if( d['token'] == instance.token and d['mobileOTP'] == instance.mobileOTP and d['emailOTP']== instance.emailOTP ):
                    print "will create a new user"
                    u = User(username = d['email'].split('@')[0])
                    u.first_name = d['firstName']
                    u.email = d['email']
                    u.last_name = d['lastName']
                    u.set_password(d['password'])
                    if globalSettings.AUTO_ACTIVE_ON_REGISTER == False:
                        u.is_active = False
                        adminData =  User.objects.get(pk=1)
                        print adminData.email
                        msgBody = ['Provide the user permission for new registered customer Name : <strong>%s</strong> with EmailID : <strong>%s</strong>' %(u.first_name , u.email) ]


                        try:
                            fbUrl = appSettingsField.objects.filter(name='facebookLink')[0].value
                        except:
                            fbUrl = 'https://www.facebook.com/'

                        try:
                            twitterUrl = appSettingsField.objects.filter(name='twitterLink')[0].value
                        except:
                            twitterUrl = 'twitter.com'

                        try:
                            linkedinUrl = appSettingsField.objects.filter(name='linkedInLink')[0].value
                        except:
                            linkedinUrl = 'https://www.linkedin.com/'

                        try:
                            sendersAddress = appSettingsField.objects.filter(name='companyAddress')[0].value
                        except:
                            sendersAddress = ''

                        try:
                            sendersPhone =  appSettingsField.objects.filter(name='phone')[0].value
                        except:
                            sendersPhone = ''



                        ctx = {
                            'heading' : 'Welcome to Ecommerce',
                            'recieverName' : 'Admin',
                            'message': msgBody,
                            # 'linkUrl': 'sterlingselect.com',
                            # 'linkText' : 'View Online',
                            'sendersAddress' : sendersAddress,
                            'sendersPhone' : sendersPhone,
                            'linkedinUrl' : linkedinUrl,
                            'fbUrl' : fbUrl,
                            'twitterUrl' : twitterUrl,
                            'brandName' : globalSettings.BRAND_NAME,
                        }

                        email_body = get_template('app.homepage.permission.html').render(ctx)
                        email_subject = 'Permission for the new user'
                        # if globalSettings.EMAIL_API:
                        #     sg = sendgrid.SendGridAPIClient(apikey= globalSettings.G_KEY)
                        #     # sg = sendgrid.SendGridAPIClient(apikey=os.environ.get('SENDGRID_API_KEY'))
                        #     data = {
                        #       "personalizations": [
                        #         {
                        #           "to": [
                        #             {
                        #               "email": str(globalSettings.G_ADMIN[0])
                        #               # str(orderObj.user.email)
                        #             }
                        #           ],
                        #           "subject": email_subject
                        #         }
                        #       ],
                        #       "from": {
                        #         "email": globalSettings.G_FROM,
                        #         "name":globalSettings.SEO_TITLE
                        #       },
                        #       "content": [
                        #         {
                        #           "type": "text/html",
                        #           "value": email_body
                        #         }
                        #       ]
                        #     }
                        #     response = sg.client.mail.send.post(request_body=data)
                        #     print(response.body,"bodyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy")
                        # else:
                        #     sentEmail=[]
                        #     sentEmail.append(str(adminData.email))
                        #     # msg = EmailMessage(email_subject, email_body, to= sentEmail , from_email= 'do_not_reply@cioc.co.in' )
                        #     msg = EmailMessage(email_subject, email_body, to= sentEmail)
                        #     msg.content_subtype = 'html'
                        #     msg.send()

                        email_body = get_template('app.homepage.permission.html').render(ctx)
                        email_subject = 'Permission for the new user'
                        email_to=[]
                        for i in globalSettings.G_ADMIN:
                            email_to.append(str(i))
                        email_cc = []
                        email_bcc = []
                        send_email(email_body,email_to,email_subject,email_cc,email_bcc,'html')


                    else:
                        u.is_active = True
                    if d['designation']:
                        if d['designation'] == 'manager' or 'admin' or 'director':
                            u.is_staff = True
                        else:
                            u.is_staff = False
                    u.save()
                    if 'email' in d:sendMail(d)
                    pobj = profile.objects.get(pk=u.profile.pk)
                    try:
                        pobj.details = d
                        pobj.mobile = instance.mobile
                    except:
                        pass
                    pobj.save()
                    for a in globalSettings.DEFAULT_APPS_ON_REGISTER:
                        app = application.objects.get(name = a)
                        p = permission.objects.create(app =  app, user = u , givenBy = User.objects.get(pk=1))
                    login(self.context['request'] , u,backend='django.contrib.auth.backends.ModelBackend')
                    instance.delete()
                    return instance
                else:
                    raise SuspiciousOperation('Expired')
        else:
            d = self.context['request'].data;
            if( d['token'] == instance.token and d['mobileOTP'] == instance.mobileOTP ):
                print "will create a new user"
                u = User(username = d['mobile'])
                u.first_name = d['mobile']
                u.email = ''
                u.last_name = ''
                u.set_password('titan@1')
                u.is_active = True
                u.save()
                if 'email' in d:sendMail(d)
                # pobj=profile()
                # pobj.mobile = d['mobile']
                # pobj.save()
                for a in globalSettings.DEFAULT_APPS_ON_REGISTER:
                    app = application.objects.get(name = a)
                    p = permission.objects.create(app =  app, user = u , givenBy = User.objects.get(pk=1))
                login(self.context['request'] , u,backend='django.contrib.auth.backends.ModelBackend')
                instance.delete()
                print u, u.profile, u.profile.pk, u.profile.mobile ,'ddddddddd'
                z  = merge_two_dicts(d, d)
                print z,'fffffffffffffffffffffffffffffffffffffffffffffff'
                pobj = profile.objects.get(user=u)
                pobj.mobile = d['mobile']
                try:
                    pobj.details = d
                except:
                    pass
                pobj.save()
                return instance
            else:
                raise SuspiciousOperation('Expired')

        return instance
    def create(self , validated_data):
        reg = Registration(**validated_data)
        salt = hashlib.sha1(str(random.random())).hexdigest()[:5]
        if reg.email!=None:
            username = reg.email.split('@')[0]
            key = hashlib.sha1(salt+validated_data.pop('email')).hexdigest()
            reg.token = key
        else:
            username = reg.mobile
            key = hashlib.sha1(salt+validated_data.pop('mobile')).hexdigest()
            reg.token = key
        u = User.objects.filter(username=username)
        if len(u)>0:
            raise ValidationError(detail={'PARAMS' : 'Username already taken'} )
        if not globalSettings.LITE_REGISTRATION:
            if globalSettings.VERIFY_MOBILE:
                reg.mobileOTP = generateOTPCode()
                print reg.mobileOTP
        else:
                reg.mobileOTP = generateOTPCode()
                print reg.mobileOTP

        if reg.email!=None:
            reg.emailOTP = generateOTPCode()
            print reg.emailOTP

            msgBody = ['Your OTP to verify your email ID is <strong>%s</strong>.' %(reg.emailOTP)]

            try:
                fbUrl = appSettingsField.objects.filter(name='facebookLink')[0].value
            except:
                fbUrl = 'https://www.facebook.com/'

            try:
                twitterUrl = appSettingsField.objects.filter(name='twitterLink')[0].value
            except:
                twitterUrl = 'twitter.com'

            try:
                linkedinUrl = appSettingsField.objects.filter(name='linkedInLink')[0].value
            except:
                linkedinUrl = 'https://www.linkedin.com/'

            try:
                sendersAddress = appSettingsField.objects.filter(name='companyAddress')[0].value
            except:
                sendersAddress = ''

            try:
                sendersPhone =  appSettingsField.objects.filter(name='phone')[0].value
            except:
                sendersPhone = ''

            ctx = {
                'heading' : 'Welcome to Ecommerce',
                'recieverName' : 'Customer',
                'message': msgBody,
                # 'linkUrl': 'sterlingselect.com',
                # 'linkText' : 'View Online',
                'sendersAddress' : sendersAddress,
                'sendersPhone' : sendersPhone,
                'linkedinUrl' : linkedinUrl,
                'fbUrl' : fbUrl,
                'twitterUrl' : twitterUrl,
                'brandName' : globalSettings.BRAND_NAME,
                'username':username
            }

            email_body = get_template('app.homepage.emailOTP.html').render(ctx)
            email_subject = 'Regisration OTP'
            # if globalSettings.EMAIL_API:
            #     sg = sendgrid.SendGridAPIClient(apikey= globalSettings.G_KEY)
            #     # sg = sendgrid.SendGridAPIClient(apikey=os.environ.get('SENDGRID_API_KEY'))
            #     data = {
            #       "personalizations": [
            #         {
            #           "to": [
            #             {
            #               # "email": 'bhanubalram5@gmail.com'
            #               "email": str(reg.email)
            #               # str(orderObj.user.email)
            #             }
            #           ],
            #           "subject": email_subject
            #         }
            #       ],
            #       "from": {
            #         "email": globalSettings.G_FROM,
            #         "name":globalSettings.SEO_TITLE
            #       },
            #       "content": [
            #         {
            #           "type": "text/html",
            #           "value": email_body
            #         }
            #       ]
            #     }
            #     response = sg.client.mail.send.post(request_body=data)
            #     print(response.body,"bodyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy")
            # else:
            #     sentEmail=[]
            #     sentEmail.append(str(reg.email))
            #     # msg = EmailMessage(email_subject, email_body, to= sentEmail , from_email= 'do_not_reply@cioc.co.in' )
            #     msg = EmailMessage(email_subject, email_body, to= sentEmail)
            #     msg.content_subtype = 'html'
            #     msg.send()

            email_body = get_template('app.homepage.emailOTP.html').render(ctx)
            email_subject = 'Regisration OTP'
            email_to=[]
            email_to.append(str(reg.email))
            email_cc = []
            email_bcc = []
            send_email(email_body,email_to,email_subject,email_cc,email_bcc,'html')
        if not globalSettings.LITE_REGISTRATION:
            if globalSettings.VERIFY_MOBILE:
                mobile = reg.mobile
                url = globalSettings.SMS_API_PREFIX.format(mobile , 'Dear Customer,\nPlease use OTP : %s to verify your mobile number' %(reg.mobileOTP))
                requests.get(url)
        else:
            mobile = reg.mobile
            url = globalSettings.SMS_API_PREFIX.format(reg.mobile , 'Dear Customer,\nPlease use OTP : %s to verify your mobile number' %(reg.mobileOTP))
            requests.get(url)
        reg.save()
        reg.emailOTP = ''
        reg.mobileOTP = ''
        return reg
