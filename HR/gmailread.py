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


# Creating a storage.JSON file with authentication details
SCOPES = 'https://www.googleapis.com/auth/gmail.modify' # we are using modify and not readonly, as we will be marking the messages Read
store = file.Storage('storage.json')
creds = store.get()
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
