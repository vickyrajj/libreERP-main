import os
from os import path
from django.conf import settings as globalSettings
from django.core.mail import send_mail , EmailMessage
import sendgrid


def send_email(email_body, email_to, email_subject,email_cc,email_bcc, email_type):
    # email_to, email_cc and email_bcc should be a list
    # if isinstance(email_to, list):
    #     print 'list'
    # else:
    #     print 'not list'
    if globalSettings.EMAIL_API:
        sg = sendgrid.SendGridAPIClient(apikey= globalSettings.G_KEY)
        emailIDs = []
        bccIds = []
        ccIds = []
        for i in email_to:
            emailIDs.append({"email":i})
        for i in globalSettings.G_ADMIN:
            emailIDs.append({"email":i})
        for i in email_bcc:
            bccIds.append({"email":i})
        for i in email_cc:
            ccIds.append({"email":i})
        print emailIDs ,'emailIDs'
        print bccIds ,'bccIds'
        print ccIds ,'ccIds'
        data = {
          "personalizations": [
            {
              "to": emailIDs,
              "subject": email_subject
            }
          ],
          "from": {
            "email": globalSettings.G_FROM,
            "name":globalSettings.SEO_TITLE
          },
          "content": [
            {
              "type": "text/html",
              "value": email_body
            }
          ]
        }
        response = sg.client.mail.send.post(request_body=data)
    else:
        for i in globalSettings.G_ADMIN:
            email_to.append(i)
        msg = EmailMessage(email_subject , email_body, to= email_to )
        if email_type=='html':
            msg.content_subtype = 'html'
        msg.cc = email_cc
        msg.bcc = email_bcc
        msg.send()
    return {'EmailSent':True}

# if __name__ == '__main__':
#     res = send_email('Hello Hi' , ['vikas.motla@gmail.com'] , 'This is just subject' ,' ', '',['vikky.motla@gmail.com'],['bhrthkshr@gmail.com'])
