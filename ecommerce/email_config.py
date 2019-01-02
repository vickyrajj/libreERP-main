import os
from os import path
from django.conf import settings as globalSettings
from django.core.mail import send_mail , EmailMessage
import sendgrid


def send_email(email_body, email_to, email_subject):
    # email_to should be a list
    print type(email_body)
    if globalSettings.EMAIL_API:
        sg = sendgrid.SendGridAPIClient(apikey= globalSettings.G_KEY)
        emailIDs = []
        for i in email_to:
            emailIDs.append({"email":i})
        for i in globalSettings.G_ADMIN:
            emailIDs.append({"email":i})
        print emailIDs ,'emailIDs'
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
        print email_to,'email_to'
        msg = EmailMessage(email_subject , email_body, to= email_to )
        msg.content_subtype = 'html'
        msg.send()
    print 'in send_email **********'
    return {'msgSent':True}
