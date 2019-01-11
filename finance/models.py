from __future__ import unicode_literals
from django.contrib.auth.models import User
from django.db import models
from ERP.models import service
from time import time
# Create your models here.
# from projects.models import project

def getInvoicesPath(instance , filename ):
    return 'finance/invoices/%s_%s_%s' % (str(time()).replace('.', '_'),instance.user.username, filename)

def getInflowAttachmentsPath(instance , filename ):
    return 'finance/inflows/%s_%s_%s' % (str(time()).replace('.', '_'),instance.user.username, filename)

def getcontentDocsPath(instance , filename ):
    return 'finance/vendor/%s_%s_%s' % (str(time()).replace('.', '_'), instance.contactPerson, filename)

def getInvoiceUploadPath(instance,filename):
    return "finance/vendor/%s_%s__%s"% (str(time()).replace('.','_'),instance.approver, filename)

class Account(models.Model):
    title = models.CharField(max_length = 20 , null = True , blank = True)
    created = models.DateTimeField(auto_now_add=True)
    number = models.PositiveIntegerField()
    ifsc = models.CharField(max_length = 15 , null = False)
    bank = models.CharField(max_length = 50 , null = False)
    bankAddress = models.TextField(max_length = 500 , null = False)
    contactPerson = models.ForeignKey(User , null = False , related_name = 'accountsManaging')
    authorizedSignaturies = models.ManyToManyField(User , related_name = 'checkingAccounts')
    personal = models.BooleanField(default = False) # if this account is personal account , in that case the authorized person will be the person to which this account belongs
    balance = models.FloatField(default = 0)
    def __unicode__(self):
        return '<Number : %s > , <responsible : %s > , <bank : %s>' %(self.number , self.contactPerson.username , self.bank)


class CostCenter(models.Model):
    head = models.ForeignKey(User , null = False)
    name = models.CharField(max_length = 100 , blank = False)
    code = models.CharField(max_length = 50 , blank = False)
    created = models.DateTimeField(auto_now_add=True)
    account = models.ForeignKey(Account)

    def __unicode__(self):
        return '<name : %s > , <head : %s > , <code : %s>' %(self.name , self.head.username , self.code)

INFLOW_TYPES = (
    ('cash' , 'cash'),
    ('cheque' , 'cheque'),
    ('wire' , 'wire'),
)

CURRENCY_CHOICES = (
    ('INR' , 'INR'),
    ('USD' , 'USD'),
)




class Inflow(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    ammount = models.PositiveIntegerField()
    toAcc = models.ForeignKey(Account , null = False , related_name = 'inflowCredits')
    referenceID = models.CharField(max_length = 30 , null = False)
    user = models.ForeignKey(User , related_name='inflowsTransacted' , null = False)
    service = models.ForeignKey(service , null = True, related_name="inflow")
    currency = models.CharField(max_length = 5 , choices = CURRENCY_CHOICES)
    dated = models.DateField(null = False)
    attachment = models.FileField(upload_to = getInflowAttachmentsPath ,  null = True)
    description = models.TextField(max_length = 200 , null = False) # describe the inflow
    verified = models.BooleanField(default = False)
    fromBank = models.CharField(max_length = 30 , null = True)
    chequeNo = models.CharField(max_length = 30 , null = True)
    mode = models.CharField(choices = INFLOW_TYPES , max_length = 20, default = 'cash')
    balance =  models.PositiveIntegerField()

class Transaction(models.Model):
    fromAcc = models.ForeignKey(Account , null = False , related_name = 'debits')
    toAcc = models.ForeignKey(Account , null = False , related_name = 'credits')
    ammount = models.PositiveIntegerField()
    user = models.ForeignKey(User , related_name='transactions' , null = False)
    balance = models.PositiveIntegerField()
    externalReferenceID = models.CharField(max_length = 30 , null = False)
    externalConfirmationID = models.CharField(max_length = 30 , null = False)
    created = models.DateTimeField(auto_now_add=True)
    api = models.CharField(max_length = 20 , null = True)
    apiCallParams = models.CharField(max_length = 1500 , null = True)

    def __unicode__(self):
        return '<from : %s > , <to : %s > , <amount : %s> , < user : %s>' %(self.fromAcc , self.toAcc , self.ammount , self.user.username)

APPROVAL_CHOICES = (
    ('Yes' , 'Yes'),
    ('No' , 'No'),
    ('Pending' , 'Pending')
)

class ExpenseSheet(models.Model):
    user = models.ForeignKey(User , related_name='expenseGeneratedOrSubmitted' , null = False)
    created = models.DateTimeField(auto_now_add=True)
    approved = models.CharField(default = 'No' ,max_length = 5 ,choices = APPROVAL_CHOICES)
    approvalMatrix = models.PositiveSmallIntegerField(default=1)
    approvalStage = models.PositiveSmallIntegerField(default=0)
    dispensed = models.BooleanField(default = False)
    notes =  models.CharField(max_length = 30 , null = True)
    # project = models.ForeignKey(project , null = False)
    transaction = models.ForeignKey(Transaction , null = True , related_name = 'expenseSheet')
    submitted = models.BooleanField(default = False)
    totalDisbursed = models.FloatField(default=0)
    # def __unicode__(self):
    #     return '<notes : %s > , <approved : %s > , <project : %s > , < user : %s >' %(self.notes , self.approved , self.project , self.user.username)

class ExpenseHeading(models.Model):
    title = models.CharField(max_length = 40 , null = False)

class Invoice(models.Model):
    user = models.ForeignKey(User , related_name='invoiceGeneratedOrSubmitted' , null = False)
    created = models.DateTimeField(auto_now_add=True)
    service = models.ForeignKey(service , null = False)
    code =  models.ForeignKey(ExpenseHeading , null = True , related_name='employeeInvoice')
    amount = models.PositiveIntegerField(null=False , default=0)
    currency = models.CharField(max_length = 5 , choices = CURRENCY_CHOICES)
    dated = models.DateField(null = False)
    attachment = models.FileField(upload_to = getInvoicesPath ,  null = True)
    sheet = models.ForeignKey(ExpenseSheet , related_name='invoices' , null = True)
    transaction = models.ForeignKey(Transaction , null = True , related_name = 'directInvoicePayments')
    description = models.TextField(max_length = 200 , null = False) # describe or justify the expense
    approved = models.BooleanField(default = False) # it is possible to have a sheet with some of the invoices rejected and if the sheet is approved the amount to be paid will be the sum of claims in the approved invoices only
    dispensed = models.BooleanField(default = False)
    def __unicode__(self):
        return '<service : %s > , <amount : %s > , <sheet : %s > , < user : %s >' %(self.service , self.amount , self.sheet , self.user.username)


class VendorProfile(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    contactPerson = models.CharField(max_length = 100 , null = False)
    mobile = models.CharField(max_length = 12 , null = True)
    email = models.EmailField(null = True)
    paymentTerm = models.PositiveIntegerField(null=True , default=0)
    contentDocs =  models.FileField(upload_to = getcontentDocsPath ,  null = True , blank = True)
    service = models.ForeignKey(service , related_name='vendorprofiles' , null = False)

class VendorService(models.Model):
    vendorProfile = models.ForeignKey(VendorProfile , null = True , related_name='vendorservices')
    particular= models.CharField(max_length = 100 , null = False, unique = True)
    rate = models.PositiveIntegerField(null=True , default=0)

class VendorInvoice(models.Model):
    vendorProfile = models.ForeignKey(VendorProfile , null = True , related_name='vendorInvoices')
    approver = models.ForeignKey(User , related_name='invoiceApprovedBy' , null = True)
    invoice =  models.FileField(upload_to = getInvoiceUploadPath ,  null = False)
    settled = models.BooleanField(default = False)
    disbursedOn = models.DateTimeField(null = True)
    approvedOn = models.DateTimeField(null = True)
    dueDate = models.DateField(null = False)
    dated = models.DateField(null = False)
    amount= models.FloatField(null=True , default=0)
    approved = models.NullBooleanField(null = True)
    disbursed = models.NullBooleanField(null = True)

STATUS_CHOICES = (
    ('created' , 'created'),
    ('Sent' , 'Sent'),
    ('Approved' , 'Approved'),
    ('Final' , 'Final'),
)

class PurchaseOrder(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length = 100 , null = True)
    address = models.CharField(max_length = 100 , null = True)
    personName = models.CharField(max_length = 100 , null = True)
    user = models.ForeignKey(User , related_name='purchaseUser' , null = True)
    status = models.CharField(default = 'created' ,max_length = 5 ,choices = STATUS_CHOICES)
    poNumber = models.CharField(max_length = 500,null=True)
    quoteNumber = models.CharField(max_length = 500,null=True)
    deliveryDate = models.DateField(null = True)
    terms = models.CharField(max_length = 500 , null = True)

class PurchaseOrderQty(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    product = models.CharField(max_length = 100 , null = True)
    qty = models.PositiveIntegerField(null=True , default=0)
    price = models.FloatField(null=True , default=0)
    purchaseorder = models.ForeignKey(PurchaseOrder , related_name='productorder' , null = True)
