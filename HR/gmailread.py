'''
Reading GMAIL using Python
	- Abhishek Chhibber
'''

'''
This script does the following:
- Go to Gmal inbox
- Find and read all the unread messages
- Extract details (Date, Sender, Subject, Snippet, Body) and export them to a .csv file / DB
- Mark the messages as Read - so that they are not read again
'''

'''
Before running this script, the user should get the authentication by following
the link: https://developers.google.com/gmail/api/quickstart/python
Also, client_secret.json should be saved in the same directory as this file
'''

# Importing required libraries
from apiclient import discovery
from apiclient import errors
from httplib2 import Http
from oauth2client import file, client, tools
import base64
from bs4 import BeautifulSoup
import re
import time
import dateutil.parser as parser
import datetime
import csv
import os
print os.getcwd()
# Creating a storage.JSON file with authentication details
SCOPES = 'https://www.googleapis.com/auth/gmail.modify' # we are using modify and not readonly, as we will be marking the messages Read
store = file.Storage(os.path.join( os.getcwd() , 'HR' , 'storage.json'))
creds = store.get()
print creds
if not creds or creds.invalid:
    flow = client.flow_from_clientsecrets('client_secret.json', SCOPES)
    creds = tools.run_flow(flow, store)
GMAIL = discovery.build('gmail', 'v1', http=creds.authorize(Http()))

user_id =  'me'
label_id_one = 'INBOX'
label_id_two = 'UNREAD'

def combineMessages(msgList):
    final_list = [ ]

    for mssg in msgList:
    	temp_dict = { }
    	m_id = mssg['id'] # get id of individual message
    	message = GMAIL.users().messages().get(userId=user_id, id=m_id).execute() # fetch the message using API
    	payld = message['payload'] # get payload of the message
    	headr = payld['headers'] # get header of the payload

    	for one in headr: # getting the Subject
            if one['name'] == 'Subject':
            	msg_subject = one['value']
            	temp_dict['Subject'] = msg_subject.encode('utf-8').strip()
                break
            else:
            	pass

    	for two in headr: # getting the date
            if two['name'] == 'Date':
            	msg_date = two['value']
            	date_parse = (parser.parse(msg_date))
            	temp_dict['Date'] = str(date_parse)
                break
            else:
            	pass

    	for three in headr: # getting the Sender
            if three['name'] == 'From':
            	msg_from = three['value']
            	temp_dict['Sender'] = msg_from
                break
            else:
            	pass

    	temp_dict['Snippet'] = message['snippet'].encode('utf-8').strip() # fetching message snippet

    	try:
    	    # Fetching message body
    	    mssg_parts = payld['parts'] # fetching the message parts
    	    part_one  = mssg_parts[0] # fetching first element of the part
    	    part_body = part_one['body'] # fetching body of the message
    	    part_data = part_body['data'] # fetching data from the body
    	    clean_one = part_data.replace("-","+") # decoding from Base64 to UTF-8
    	    clean_one = clean_one.replace("_","/") # decoding from Base64 to UTF-8
    	    clean_two = base64.b64decode(clean_one).decode('utf-8') # decoding from Base64 to UTF-8 (****base64.b64decode(clean_one).decode('utf-8')************  base64.b64decode(bytes(clean_one,'utf-8')) *******)
    	    soup = BeautifulSoup(clean_two , "lxml" )
    	    mssg_body = soup.body()
    	    # mssg_body is a readible form of message body
    	    # depending on the end user's requirements, it can be further cleaned
    	    # using regex, beautiful soup, or any other method
    	    temp_dict['Message_body'] = mssg_body
    	except :
    		pass
    	final_list.append(temp_dict) # This will create a dictonary item in the final list
        # This will mark the messagea as read
    	# GMAIL.users().messages().modify(userId=user_id, id=m_id,body={ 'removeLabelIds': ['UNREAD']}).execute()

    print ("Total messaged retrived: ", str(len(final_list)))
    return final_list

def convertTOCsv(dataList,fileName):
	'''
	The dataList will have dictionary in the following format:
	[{
	  'Sender': '"email.com" <name@email.com>',
	  'Subject': 'Lorem ipsum dolor sit ametLorem ipsum dolor sit amet',
	  'Date': 'yyyy-mm-dd',
	  'Snippet': 'Lorem ipsum dolor sit amet'
	  'Message_body': 'Lorem ipsum dolor sit amet'
	}]
	The dictionary can be exported as a .csv or into a databse
	'''
	#exporting the values as .csv
	with open(fileName, 'w') as csvfile:
	    fieldnames = ['Sender','Subject','Date','Snippet','Message_body']
	    writer = csv.DictWriter(csvfile, fieldnames=fieldnames, delimiter = ',')
	    writer.writeheader()
	    for val in dataList:
			writer.writerow(val)
	return


# ************ Dates Formate Should Be '%Y/%m/%d'  ************
def btwDates(after,before):
    print "after : {0} and before : {1}".format(after,before)
    query = "after:{0} before:{1}".format(after,before)
    messagesList = GMAIL.users().messages().list(userId=user_id,q=query).execute()
    mssg_list = messagesList.get('messages',[])
    # print ("Total messages between These Dates are : ", str(len(mssg_list)))
    data_list = combineMessages(mssg_list)

# ************ Dates Formate Should Be '%Y/%m/%d' and typ Should Be Either 'after' or before ************
def fromOrBeforeDate(dt,typ):
	print typ,dt
	if typ == 'after':
	    query = "after:{0}".format(dt)
	elif typ == 'before':
	    query = "before:{0}".format(dt)
	else:
	    query = ''
	if len(query)>0:
	    messagesList = GMAIL.users().messages().list(userId=user_id,q=query).execute()
	else:
	    messagesList = {}
	mssg_list = messagesList.get('messages',[])
	# print ("Total messages are : ", str(len(mssg_list)))
	data_list = combineMessages(mssg_list)
	# convertTOCsv(data_list,'CSV_NAME1.csv')

# ************ Fetching All Messages ************
def allData():
    print 'Fetching All Messages'
    # Getting all the unread messages from Inbox
    # labelIds can be changed accordingly
    # messagesList = GMAIL.users().messages().list(userId=user_id,labelIds=[label_id_one , label_id_two],).execute()
    messagesList = GMAIL.users().messages().list(userId=user_id).execute()
    # print messagesList['nextPageToken']
    # print messagesList['resultSizeEstimate']
    # We get a dictonary. Now reading values for the key 'messages'
    mssg_list = messagesList.get('messages',[])
    # print ("Total messages are : ", str(len(mssg_list)))
    data_list = combineMessages(mssg_list)

import html2text
def getFirstMessage():
	print '.............. fetching first message ................'
	firstmessage = {}
	for i in range(2004,datetime.datetime.now().year+1):
		query = "before:{0}".format(str(i)+'/01/01')
		# print query
		messagesList = GMAIL.users().messages().list(userId=user_id,maxResults=500,q=query).execute()
		if 'messages' in messagesList and len(messagesList['messages'])>0:
			while True:
				if 'nextPageToken' in messagesList:
					# print 'next page is thereeeeeee'
					datas = GMAIL.users().messages().list(userId=user_id,maxResults=500,q=query,pageToken=messagesList['nextPageToken']).execute()
					if 'messages' in datas and len(datas['messages'])>0:
						messagesList = datas
					else:
						lm = messagesList['messages'][-1]
						firstmessage = combineMessages([lm])[0]
						break
				else:
					# print 'no next pageeeeeeee'
					lm = messagesList['messages'][-1]
					firstmessage = combineMessages([lm])[0]
					break
			break
	return firstmessage




# btwDates('2018/09/1','2018/09/03')
# fromOrBeforeDate('2018/09/23','after')
# fromOrBeforeDate('2013/01/23','before')
firstmessage = getFirstMessage()
print firstmessage

htmlTxt = """
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title></title>
<style>@media only screen and (max-width:767px){table.devicewidth-color{width:565px!important;text-align:center!important}table.devicewidth{width:500px!important;text-align:center!important}.color-border{height:20px!important}img.responsive-image{width:100%!important}.banner-image{width:250px!important}.text1{font-size:14px!important;line-height:20px!important}.text2{font-size:20px!important;line-height:26px!important}.text3{text-align:center!important}.text4{text-align:center!important;font-size:12px!important}.auto-height{height:auto!important}.header-space{text-align:center!important;padding-bottom:10px!important}.hidden-mobile{display:none!important}.apps{height:30px!important}.no-margin{margin-right:0!important;padding-bottom:10px!important;display:block!important;width:100%!important}.user-info{text-align:left!important;padding-left:68px!important}.full-width{width:100%!important}.small-height{height:10px!important}.mobile-responsive{width:100%!important;max-width:none!important;max-height:none!important}}@media only screen and (max-width:480px){table.devicewidth-color{width:300px!important;text-align:center!important}table.devicewidth{width:270px!important;text-align:center!important}.color-border{height:20px!important}}</style>


<!-- Start matter -->
<table width="100%" bgcolor="#f7f7f7" cellpadding="0" cellspacing="0" border="0" id="backgroundTable" style="border-collapse: collapse; border-spacing: 0;">
<tbody><tr>
<td><!-- Top -->
<table bgcolor="#f7f7f7" width="600" cellpadding="0" cellspacing="0" border="0" align="center" class="devicewidth-color" style="border-collapse: collapse; border-spacing: 0; background-color:#f7f7f7;">
<tbody><tr>
<td style="padding:0px; margin:0px; "><table bgcolor="#f7f7f7" cellpadding="0" cellspacing="0" border="0" align="center" class="devicewidth-inner" style="border-collapse: collapse; border-spacing: 0;">
<tbody><tr>
<td><table bgcolor="#f7f7f7" width="551" cellpadding="0" cellspacing="0" border="0" align="center" class="devicewidth" style="border-collapse: collapse; border-spacing: 0;">
<tbody><tr>
<td style="padding:0px;"><table width="100%" border="0" style="border-collapse: collapse; border-spacing: 0;">
<tbody><tr>
<td style="padding:0px;"><table align="left" width="100%" border="0" style="border-collapse: collapse; border-spacing: 0;">
<tbody><tr>
<td class="small-height" style="line-height: 0;font-size: 0;vertical-align: top;padding: 0px; text-align: left;" height="16">&nbsp;</td>
</tr>
<tr>
<td style="padding:0px; text-align:center"><img src="https://www.techgig.com/files/nicUploads/516203159871438.png" alt="speaker"></td>
</tr>
<tr>
<td class="small-height" style="line-height: 0;font-size: 0;vertical-align: top;padding: 0px; text-align: left;" height="16">&nbsp;</td>
</tr>
</tbody></table></td>
</tr>
</tbody></table></td>
</tr>
</tbody></table></td>
</tr>
</tbody></table></td>
</tr>
</tbody></table>
<!-- /Top -->
<!-- Header -->
<table bgcolor="#2d1846" width="600" cellpadding="0" cellspacing="0" border="0" align="center" class="devicewidth-color" style="border-collapse: collapse; border-spacing: 0; background-color:#2d1846;">
<tbody><tr>
<td style="padding:0px; margin:0px; border-bottom:4px solid #2d1846;"><table bgcolor="#2d1846" cellpadding="0" cellspacing="0" border="0" align="center" class="devicewidth-inner" style="border-collapse: collapse; border-spacing: 0;">
<tbody><tr>
<td><table bgcolor="#2d1846" width="551" cellpadding="0" cellspacing="0" border="0" align="center" class="devicewidth" style="border-collapse: collapse; border-spacing: 0;">
<tbody><tr>
<td style="padding:0px; vertical-align:top; text-align:center"><img style="max-width:200px; vertical-align:bottom" src="https://www.techgig.com/files/nicUploads/824168872795083.png" alt="logo"></td>
</tr>
<tr>
<td style="padding:0px;"><table width="100%" border="0" style="border-collapse: collapse; border-spacing: 0;">
<tbody><tr>
<td style="padding:0px;"><table align="left" class="devicewidth" width="100%" border="0" style="border-collapse: collapse; border-spacing: 0;">
<tbody><tr>
<td style="padding:0px; padding-left:10px"><table width="100%" border="0" style="border-collapse: collapse; border-spacing: 0;" class="device-width">
<tbody><tr>
<td style="line-height: 0;font-size: 0;vertical-align: top;padding: 0px; text-align: left;" height="16">&nbsp;</td>
</tr>
<tr>
<td class="text3" style=" margin:0; padding:0; font-size:24px; text-align:center; color:#ffffff; line-height:28px; font-family: Helvetica, Arial,sans-serif; font-weight:bold; text-transform:uppercase">LIVE WEBINAR October 29, 2018, 03:00 PM</td>
</tr>
<tr>
<td style="line-height: 0;font-size: 0;vertical-align: top;padding: 0px; text-align: left;" height="4">&nbsp;</td>
</tr>
<tr>
<td class="text4" style=" margin:0; padding:0; font-size:14px; text-align:center; color:#ffffff; line-height:21px; font-family: Helvetica, Arial,sans-serif; font-weight:bold;">Hosted by: A Nandini, Vice President Delivery India Head Delivery Assurance, GlobalLogic</td>
</tr>
<tr>
<td style="line-height: 0;font-size: 0;vertical-align: top;padding: 0px; text-align: left;" height="16">&nbsp;</td>
</tr>
<tr>
<td style=" margin:0; padding:0; font-size:18px; text-align:center; color:#ffffff; line-height:22px; font-family: Helvetica, Arial,sans-serif; font-weight:bold; text-transform:capitalize">Digital Transformation with Digital Assurance</td>
</tr>
<tr>
<td style="line-height: 0;font-size: 0;vertical-align: top;padding: 0px; text-align: left;" height="16">&nbsp;</td>
</tr>
<tr>
<td align="center"><table style="border-collapse: collapse; border-spacing: 0;" width="188">
<tbody>
<tr>
<td style="background-color:#d7263d; text-align:center;color:#ffffff; border-radius:3px; font-size:16px; text-decoration:none; font-weight:bold;"><a href="https://techgig.com/mail_redirect.php?url=webinar%2FDigital-Transformation-with-Digital-Assurance-1370%3Futm_source%3DTG_batch%26utm_medium%3Demail%26utm_campaign%3Dwebinar_2018-10-04%26date%3D2018-09-27%26auto_login=U09wK3YwcUpkak4wZGU5TDNmQWQrNkdDSnVIL0J0WUczU0NUWEIwWE0rVjRUTEp5cmw2Y2lNdDU1VGlQSCsycg==%26%26etoken=cGt5aXNreUBnbWFpbC5jb20=%26activity_name%3DNDI3NDAx%26template_type%3D0" target="_blank" style="margin:0; padding:0px 3px 0px 3px; display:block; color:#ffffff; font-size:16px; line-height:18px; font-family:Arial, Helvetica, sans-serif; text-align:center; font-weight:bold; text-align:center; text-decoration:none; border:10px solid #d7263d;border-radius:3px;">SAVE MY SPOT</a></td>
</tr>
</tbody>
</table></td>
</tr>
</tbody></table></td>
</tr>
<tr>
<td style="line-height: 0;font-size: 0;vertical-align: top;padding: 0px; text-align: left;" height="16">&nbsp;</td>
</tr>
</tbody></table></td>
</tr>
</tbody></table></td>
</tr>
</tbody></table></td>
</tr>
</tbody></table></td>
</tr>
</tbody></table></td>
</tr>
</tbody></table>
<!-- /Header -->
<!-- Content -->
<table bgcolor="#ffffff" width="600" cellpadding="0" cellspacing="0" border="0" align="center" class="devicewidth-color" style="border-collapse: collapse; border-spacing: 0; background-color:#ffffff;">
<tbody><tr>
<td style="padding:0px; margin:0px;"><table bgcolor="#ffffff" cellpadding="0" cellspacing="0" border="0" align="center" class="devicewidth-inner" style="border-collapse: collapse; border-spacing: 0;">
<tbody><tr>
<td><table bgcolor="#ffffff" width="551" cellpadding="0" cellspacing="0" border="0" align="center" class="devicewidth" style="border-collapse: collapse; border-spacing: 0;">
<tbody><tr>
<td style="padding:0px;"><table width="100%" border="0" style="border-collapse: collapse; border-spacing: 0;">
<tbody><tr>
<td style="padding:0px;"><table width="100%" border="0" style="border-collapse: collapse; border-spacing: 0;">
<tbody><tr>
<td style="padding:0px;"></td>
</tr>
</tbody></table>
<table width="375" class="devicewidth" align="left" border="0" style="border-collapse: collapse; border-spacing: 0;">
<!-- Top -->
<tbody><tr>
<td style="padding:0px;"><table width="100%" border="0" style="border-collapse: collapse; border-spacing: 0;">
<tbody><tr>
<td style="line-height: 0;font-size: 0;vertical-align: top;padding: 0px; text-align: left;" height="20">&nbsp;</td>
</tr>
<tr>
<td style=" margin:0; padding:0; font-size:16px; text-align:left; color:#4b4649; line-height:22px; font-family: Helvetica, Arial,sans-serif; font-weight:bold;">Hi Pradeep Kumar</td>
</tr>
<tr>
<td style="line-height: 0;font-size: 0;vertical-align: top;padding: 0px; text-align: left;" height="12">&nbsp;</td>
</tr>
<tr>
<td style="margin: 0px; padding: 0px; font-size: 14px; text-align: left; color: rgb(75, 70, 73); line-height: 21px; font-family: Helvetica, Arial, sans-serif;"><span style="font-weight: normal;">We would like to invite you for an exclusive </span><b>Live Webinar</b> to see Digital Transformation is when people, things and business connect to disrupt existing business models. The focus of this webinar is the radically different approach to Digital Assurance.</td>
</tr>
<tr>
<td style="line-height: 0;font-size: 0;vertical-align: top;padding: 0px; text-align: left;" height="15">&nbsp;</td>
</tr>
<tr>
<td align="center"><table style="border-collapse: collapse; border-spacing: 0;" width="250">
<tbody>
<tr>
<td style="background-color:#d7263d; text-align:center;color:#ffffff; border-radius:3px; font-size:16px; text-decoration:none; font-weight:bold;"><a href="https://techgig.com/mail_redirect.php?url=webinar%2FDigital-Transformation-with-Digital-Assurance-1370%3Futm_source%3DTG_batch%26utm_medium%3Demail%26utm_campaign%3Dwebinar_2018-10-04%26date%3D2018-09-27%26auto_login=U09wK3YwcUpkak4wZGU5TDNmQWQrNkdDSnVIL0J0WUczU0NUWEIwWE0rVjRUTEp5cmw2Y2lNdDU1VGlQSCsycg==%26%26etoken=cGt5aXNreUBnbWFpbC5jb20=%26activity_name%3DNDI3NDAx%26template_type%3D0" target="_blank" style="margin:0; padding:0px 3px 0px 3px; display:block; color:#ffffff; font-size:16px; line-height:18px; font-family:Arial, Helvetica, sans-serif; text-align:center; font-weight:bold; text-align:center; text-decoration:none; border:10px solid #d7263d;border-radius:3px;">Yes! Save My Spot Now</a></td>
</tr>
</tbody>
</table></td>
</tr>
</tbody></table></td>
</tr>
<!-- /Top -->
<!-- Section News -->
<tr>
<td style="padding:0px;"><table width="100%" border="0" style="border-collapse: collapse; border-spacing: 0;">
<tbody><tr>
<td style="line-height: 0;font-size: 0;vertical-align: top;padding: 0px; text-align: left;" height="24">&nbsp;</td>
</tr>
<tr>
<td style="margin:0; padding:0; font-size:16px; text-align:left; color:#4b4649; line-height:21px; font-family: Helvetica, Arial,sans-serif; font-weight:bold;">During this FREE Webinar, our expert will:</td>
</tr>
<tr>
<td style="line-height: 0;font-size: 0;vertical-align: top;padding: 0px; text-align: left;" height="7">&nbsp;</td>
</tr>
<tr>
<td style="margin:0; padding:0; font-size:14px; text-align:left; color:#4b4649; line-height:21px; font-family: Helvetica, Arial,sans-serif; font-weight:normal;">
<ul><li>Explain Digital Transformation and Digital Assurance</li><li>Help understand Digital Business Technology Platform Components</li><li>Discuss factors that require remodeling in the Digital Transformation Journey</li><li>Ways to enhance Customer Experience and how to deliver it consistently</li><li>Intelligent life-cycle Automation process with Monitoring &amp; Alerting</li><li>Importance of Predictive and Prescriptive Analytics in Digital Assurance</li></ul>	</td>
</tr>
</tbody></table></td>
</tr>
</tbody></table>
<table width="165" class="devicewidth" align="right" border="0" style="border-collapse: collapse; border-spacing: 0;">
<tbody><tr>
<td style="line-height: 0;font-size: 0;vertical-align: top;padding: 0px; text-align: left;" height="16">&nbsp;</td>
</tr>
<!-- Interview Box -->
<tr>
<td style="padding:0px;"><table width="100%" border="0" style="border-collapse: collapse; border-spacing: 0;">
<tbody><tr>
<td style="padding:0px; background-color:#f2f2f2; border:1px solid #f2f2f2;"><table width="100%" border="0" style="border-collapse: collapse; border-spacing: 0;">
<tbody><tr>
<td width="8" style="padding:0px;">&nbsp;</td>
<td style="padding:0px;"><table width="100%" border="0">
<tbody><tr>
<td style="line-height: 0;font-size: 0;vertical-align: top;padding: 0px; text-align: left;" height="8">&nbsp;</td>
</tr>
<tr>
<td style=" margin:0; padding:0; font-size:16px; text-align:left; color:#4b4649; line-height:21px; font-family: Helvetica, Arial,sans-serif; font-weight:bold;">Speaker Details:</td>
</tr>
<tr>
<td style="line-height: 0;font-size: 0;vertical-align: top;padding: 0px; text-align: left;" height="8">&nbsp;</td>
</tr>
</tbody></table></td>
<td width="8" style="padding:0px;">&nbsp;</td>
</tr>
</tbody></table></td>
</tr>
<tr>
<td style="padding:0px; border:1px solid #dadada; border-top:none;"><table width="100%" border="0" style="border-collapse: collapse; border-spacing: 0;">
<tbody><tr>
<td width="8" style="padding:0px;">&nbsp;</td>
<td style="padding:0px;">
<table width="100%" border="0" style="border-collapse: collapse; border-spacing: 0;">
<tbody><tr>
<td style="line-height: 0;font-size: 0;vertical-align: top;padding: 0px; text-align: left;" height="8">&nbsp;</td>
</tr>
<tr>
<td style="padding:0px;text-align:center;"><img style="width:100%; max-height:150px;" src="https://engage.techgig.com/files/image_1538020048.png" class="mobile-responsive" alt="image"></td>
</tr>
<tr>
<td style="line-height: 0;font-size: 0;vertical-align: top;padding: 0px; text-align: left;" height="8">&nbsp;</td>
</tr>
<tr>
<td style=" margin:0; padding:0; font-size:16px; text-align:left; color:#4b4649; line-height:21px; font-family: Helvetica, Arial,sans-serif; font-weight:bold;">A Nandini</td>
</tr>
<tr>
<td style=" margin:0; padding:0; font-size:13px; text-align:left; color:#4b4649; line-height:20px; font-family: Helvetica, Arial,sans-serif; font-weight:normal;">Vice President - Delivery, GlobalLogic</td>
</tr>
<tr>
<td style="line-height: 0;font-size: 0;vertical-align: top;padding: 0px; text-align: left;" height="8">&nbsp;</td>
</tr>
<tr>
<td align="center"><table style="border-collapse: collapse; border-spacing: 0;" width="100%">
<tbody>
<tr>
<td style="background-color:#d7263d; text-align:center;color:#ffffff; border-radius:3px; font-size:16px; text-decoration:none; font-weight:bold;"><a href="https://techgig.com/mail_redirect.php?url=webinar%2FDigital-Transformation-with-Digital-Assurance-1370%3Futm_source%3DTG_batch%26utm_medium%3Demail%26utm_campaign%3Dwebinar_2018-10-04%26date%3D2018-09-27%26auto_login=U09wK3YwcUpkak4wZGU5TDNmQWQrNkdDSnVIL0J0WUczU0NUWEIwWE0rVjRUTEp5cmw2Y2lNdDU1VGlQSCsycg==%26%26etoken=cGt5aXNreUBnbWFpbC5jb20=%26activity_name%3DNDI3NDAx%26template_type%3D0" target="_blank" style="margin:0; padding:0px; display:block; color:#ffffff; font-size:14px; line-height:18px; font-family:Arial, Helvetica, sans-serif; text-align:center; font-weight:bold; text-align:center; text-decoration:none; border:10px solid #d7263d;border-radius:3px;">Book Your Seat</a></td>
</tr>
</tbody>
</table></td>
</tr>
<tr>
<td style="line-height: 0;font-size: 0;vertical-align: top;padding: 0px; text-align: left;" height="8">&nbsp;</td>
</tr>
</tbody></table>
</td>
<td width="8" style="padding:0px;">&nbsp;</td>
</tr>
</tbody></table></td>
</tr>
</tbody></table></td>
</tr>
<!-- /Interview Box -->
<tr>
<td style="line-height: 0;font-size: 0;vertical-align: top;padding: 0px; text-align: left;" height="16">&nbsp;</td>
</tr>
</tbody></table></td>
</tr>
</tbody></table></td>
</tr>
</tbody></table></td>
</tr><tr>
<td style="line-height: 0;font-size: 0;vertical-align: top;padding: 0px; text-align: left;" height="40">&nbsp;</td>
</tr>
<tr>
<td style="margin:0; color:#4b4649; font-size:14px; line-height:21px; font-family:Arial, Helvetica, sans-serif; font-style:normal; font-weight:normal; text-align:left;">Warm Regards,<br>
Team TechGig </td>
</tr>
<tr>
<td style="line-height: 0;font-size: 0;vertical-align: top;padding: 0px; text-align: left;" height="16">&nbsp;</td>
</tr>

</tbody></table></td>
</tr>
</tbody></table>
<!-- /Content -->
<!-- Bottom -->
<!-- Footer -->
<table bgcolor="#f7f7f7" width="600" cellpadding="0" cellspacing="0" border="0" align="center" class="devicewidth-color" style="border-collapse: collapse; border-spacing: 0; background-color:#f7f7f7;">
<tbody><tr>
<td style="padding:0px; margin:0px; "><table bgcolor="#f7f7f7" cellpadding="0" cellspacing="0" border="0" align="center" class="devicewidth-inner" style="border-collapse: collapse; border-spacing: 0;">
<tbody><tr>
<td><table bgcolor="#f7f7f7" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" class="devicewidth" style="border-collapse: collapse; border-spacing: 0;">
<tbody><tr>
<td style="line-height: 0;font-size: 0;vertical-align: top;padding: 0px; text-align: center;" height="24">&nbsp;</td>
</tr>
<tr>
<td style="padding:0px;"><table class="devicewidth" align="left" width="290" border="0" style="border-collapse: collapse; border-spacing: 0;">
<tbody><tr>
<td style=" margin:0; padding:0; font-size:14px; text-align:left; color:#c2c2c2; line-height:18px; font-family: Arial, Helvetica,sans-serif; font-weight:normal;">TechGig.com </td>
</tr>
<tr>
<td style="line-height: 0;font-size: 0;vertical-align: top;padding: 0px; text-align: center;" height="4">&nbsp;</td>
</tr>
<tr>
<td style=" margin:0; padding:0; font-size:12px; text-align:left; color:#c2c2c2; line-height:18px; font-family: Arial, Helvetica,sans-serif; font-weight:normal;">Times Center, FC - 6, Sector 16 A, Film City,<br>
Noida - 201301, Uttar Pradesh, India </td>
</tr>
</tbody></table>
<table align="right" class="devicewidth" width="290" border="0" style="border-collapse: collapse; border-spacing: 0;">
<tbody><tr>
<td style="padding:0px;"><table width="100%" border="0" style="border-collapse: collapse; border-spacing: 0;">
<tbody><tr>
<td width="185" class="follow" style="padding:0px;"><table width="100%" border="0" style="border-collapse: collapse; border-spacing: 0;">
<tbody><tr>
<td style=" margin:0; padding:0; font-size:14px; text-align:left; color:#c2c2c2; line-height:18px; font-family: Arial, Helvetica,sans-serif; font-weight:normal;">Follow Us on</td>
</tr>
<tr>
<td style="line-height: 0;font-size: 0;vertical-align: top;padding: 0px; text-align: center;" height="4">&nbsp;</td>
</tr>
<tr>
<td style="padding:0px; text-align:left"><a style="padding-right:4px;" href="http://www.facebook.com/TechGig"><img src="https://www.techgig.com/files/nicUploads/475110113538406.png"></a> <a style="padding-right:4px;" href="https://twitter.com/#!/techgigdotcom"><img src="https://www.techgig.com/files/nicUploads/988866088855306.png"></a> <a style="padding-right:4px;" href="https://www.linkedin.com/company/techgig-com"><img src="https://www.techgig.com/files/nicUploads/943957694855144.png"></a> <a style="padding-right:4px;" href="https://plus.google.com/u/0/117998831806893066529"><img src="https://www.techgig.com/files/nicUploads/160885537204132.png"></a></td>
</tr>
</tbody></table></td>
<td style="padding:0px;"><table align="right" width="100%" border="0" style="border-collapse: collapse; border-spacing: 0;">
<tbody><tr>
<td style=" margin:0; padding:0; font-size:14px; text-align:left; color:#c2c2c2; line-height:18px; font-family: Arial, Helvetica,sans-serif; font-weight:normal;">Download App</td>
</tr>
<tr>
<td style="line-height: 0;font-size: 0;vertical-align: top;padding: 0px; text-align: center;" height="4">&nbsp;</td>
</tr>
<tr>
<td style="padding:0px;"><a href="https://play.google.com/store/apps/details?id=com.timesgroup.techgig&amp;hl=en&amp;utm_source=Email&amp;utm_medium=app_icon&amp;utm_campaign=TgAppIcon" target="_blank"><img class="apps" src="https://www.techgig.com/files/nicUploads/874250402864600.png"></a> <a href="https://itunes.apple.com/in/app/techgig/id948609992?mt=8&amp;utm_source=Email&amp;utm_medium=app_icon&amp;utm_campaign=TgAppIcon" target="_blank"><img class="apps" src="https://www.techgig.com/files/nicUploads/472692611483647.png"></a></td>
</tr>
</tbody></table></td>
</tr>
</tbody></table></td>
</tr>
</tbody></table></td>
</tr>
<tr>
<td style="line-height: 0;font-size: 0;vertical-align: top;padding: 0px; text-align: center; border-bottom:1px solid #dadada;" height="30">&nbsp;</td>
</tr>
<tr>
<td style="line-height: 0;font-size: 0;vertical-align: top;padding: 0px; text-align: center;" height="7">&nbsp;</td>
</tr>
<tr>
<td style=" margin:0; padding:0; font-size:12px; text-align:left; color:#c2c2c2; line-height:18px; font-family: Arial, Helvetica,sans-serif; font-weight:normal;">Note: For your privacy and protection, please do not forward this mail to anyone as it allows you to get automatically logged into your account.<br> If you do not want to receive this mailer, please<a href="https://www.techgig.com/block_invitations.php?block_etoken=cGt5aXNreUBnbWFpbC5jb20=&amp;receiverUid=pkyisky@gmail.com&amp;master_ref_id=NDI3NDAx&template_type=0&activity_id=MQ==" style="color:#8a858d;"> unsubscribe here. </a> To make sure this email is not sent to your "junk/spam" folder, select the email and add the sender to your Address Book. <div style="display:none;"><img src="https://www.techgig.com/mis/tj_mailer_opened_count_all.php?etoken=cGt5aXNreUBnbWFpbC5jb20=&amp;activity_name=NDI3NDAx%26template_type%3D0&amp;subject_line=%5BLIVE+WEBINAR%5D+Business+Assurance%3A+Digital+Change+with+Digital+Transformation&amp;current_date=2018-10-04" style="display:none;"></div></td>
</tr>
<tr>
<td style="line-height: 0;font-size: 0;vertical-align: top;padding: 0px; text-align: center;" height="24">&nbsp;</td>
</tr>
</tbody></table></td>
</tr>
</tbody></table></td>
</tr>
</tbody></table>
<!-- /Footer -->
<!-- end Address -->

"""

print html2text.html2text(htmlTxt)
