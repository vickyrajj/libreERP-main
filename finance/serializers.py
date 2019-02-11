from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
from gitweb.serializers import repoLiteSerializer
from ERP.serializers import serviceSerializer
from ERP.models import service
from projects.models import *
from projects.serializers import projectLiteSerializer
from datetime import datetime
from HR.serializers import userSearchSerializer
from HR.models import designation

from organization.serializers import *

from organization.serializers import UnitsLiteSerializer
from organization.models import Division , Unit

from clientRelationships.models import ProductMeta
from clientRelationships.serializers import ProductMetaSerializer

class AccountSerializer(serializers.ModelSerializer):
    contactPerson = userSearchSerializer(many=False,read_only=True)
    # authorizedSignaturies = userSearchSerializer(many=True,read_only=True)
    class Meta:
        model = Account
        fields = ('pk', 'personal','title', 'created' , 'number' , 'ifsc' , 'bank'  , 'bankAddress' , 'contactPerson' , 'authorizedSignaturies','balance')
        read_only_fields = ('contactPerson','authorizedSignaturies')

    def create(self , validated_data):
        acc = Account(**validated_data)
        if 'contactPerson' in self.context['request'].data:
            acc.contactPerson = User.objects.get(pk=int(self.context['request'].data['contactPerson']))
        acc.save()
        if 'authorizedSignaturies' in self.context['request'].data:
            for u in self.context['request'].data['authorizedSignaturies']:
                acc.authorizedSignaturies.add(User.objects.get(pk = int(u)))
        return acc

    def update(self ,instance, validated_data):
        for key in ['personal','title', 'number' , 'ifsc', 'bank' , 'bankAddress' , 'balance']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                print "Error while saving " , key
                pass
        if 'contactPerson' in self.context['request'].data:
            instance.contactPerson = User.objects.get(pk=int(self.context['request'].data['contactPerson']))
        if 'addMoney' in self.context['request'].data:
            instance.balance += int(self.context['request'].data['addMoney'])
        instance.save()
        if 'authorizedSignaturies' in self.context['request'].data:
            instance.authorizedSignaturies.clear()
            for u in self.context['request'].data['authorizedSignaturies']:
                instance.authorizedSignaturies.add(User.objects.get(pk = int(u)))
        return instance

class AccountLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ('pk', 'title' , 'number', 'ifsc', 'bank')

class CostCenterSerializer(serializers.ModelSerializer):
    head = userSearchSerializer(many=False,read_only=True)
    account = AccountLiteSerializer(many=False,read_only=True)
    unit = UnitsLiteSerializer(many=False,read_only=True)
    class Meta:
        model = CostCenter
        fields = ('pk', 'head' , 'name' , 'code' , 'created' , 'account','unit' )

    def create(self , validated_data):
        cc = CostCenter(**validated_data)
        if 'head' in self.context['request'].data:
            userObj = User.objects.get(pk=int(self.context['request'].data['head']))
            cc.head = userObj
            desgObj = designation.objects.get(user=userObj)
            if desgObj.unit:
                print 'adding unittttttttttttttt'
                cc.unit = desgObj.unit
        if 'account' in self.context['request'].data:
            cc.account = Account.objects.get(pk=int(self.context['request'].data['account']))
        cc.save()
        return cc
    def update(self ,instance, validated_data):
        for key in ['name' , 'code']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                print "Error while saving " , key
                pass
        if 'head' in self.context['request'].data:
            userObj = User.objects.get(pk=int(self.context['request'].data['head']))
            instance.head = userObj
            desgObj = designation.objects.get(user=userObj)
            if desgObj.unit:
                print 'updatingggggg unittttttttttttttt'
                instance.unit = desgObj.unit
            else:
                print 'deleteeee unittttttttttttttt'
                instance.unit = None
        if 'account' in self.context['request'].data:
            instance.account = Account.objects.get(pk=int(self.context['request'].data['account']))
        instance.save()
        return instance

class CostCenterLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CostCenter
        fields = ('pk', 'head' , 'name' , 'code' , 'account' )

class TransactionSerializer(serializers.ModelSerializer):
    fromAcc = AccountLiteSerializer(many = False , read_only = True)
    toAcc = AccountLiteSerializer(many = False , read_only = True)
    class Meta:
        model = Transaction
        fields = ('pk', 'created','fromAcc' , 'toAcc' , 'user' , 'amount' , 'balance', 'externalReferenceID', 'externalConfirmationID', 'api', 'apiCallParams')
        read_only_fields = ('user',)
    def create(self , validated_data):
        tcs = Transaction(**validated_data)
        tcs.user = self.context['request'].user
        if 'toAcc' in self.context['request'].data:
            toAc = Account.objects.get(pk=int(self.context['request'].data['toAcc']))
            toAc.balance += self.context['request'].data['amount']
            toAc.save()
            tcs.toAcc = toAc
            tcs.balance = toAc.balance
        if 'fromAcc' in self.context['request'].data:
            frmAc = Account.objects.get(pk=int(self.context['request'].data['fromAcc']))
            frmAc.balance -= self.context['request'].data['amount']
            frmAc.save()
            tcs.fromAcc = frmAc
        tcs.save()
        return tcs

class InflowSerializer(serializers.ModelSerializer):
    toAcc = AccountLiteSerializer(many = False , read_only = True)
    class Meta:
        model = Inflow
        fields = ('pk', 'toAcc' , 'created' ,'amount', 'referenceID' , 'user', 'service', 'currency', 'dated', 'attachment', 'description', 'verified' , 'fromBank', 'chequeNo' , 'mode','gstCollected')
        read_only_fields = ('user' , 'amount')
    def create(self , validated_data):
        u = self.context['request'].user
        inf = Inflow(**validated_data)
        inf.user = u
        inf.save()
        return inf

class InvoiceSerializer(serializers.ModelSerializer):
    service = serviceSerializer(many = False , read_only = True)
    class Meta:
        model = Invoice
        fields = ('pk', 'user' , 'created' , 'service' ,'code', 'amount' , 'currency' , 'dated' , 'attachment','sheet' , 'description','approved')
        read_only_fields = ('user',)

    def create(self , validated_data):
        u = self.context['request'].user
        print 'came to create an Invoce' , u
        inv = Invoice(**validated_data)
        inv.user = u
        inv.service = service.objects.get(pk = self.context['request'].data['service'])
        inv.approved = False
        inv.save()
        return inv

    def update(self, instance, validated_data):
        # if the user is manager or something then he can update the approved flag
        reqData = self.context['request'].data
        if 'approved' in reqData:
            instance.approved = validated_data.pop('approved')
            instance.save()
            return instance
        if 'service' in reqData:
            instance.service = service.objects.get(pk = reqData['service'])
        if 'dated':
            dateStr = reqData['dated']
            instance.dated = datetime.strptime(dateStr, '%Y-%m-%d').date()
        for f in ['amount' , 'currency' , 'sheet' , 'description']:
            setattr(instance , f , validated_data.pop(f))
        if 'attachment' in reqData:
            instance.attachment = validated_data.pop('attachment')
        instance.save()
        # print instance.service
        return instance

class ExpenseSheetSerializer(serializers.ModelSerializer):
    # invoice = InvoiceSerializer(many = True , read_only = True)
    project = projectLiteSerializer(many = False , read_only = True)
    class Meta:
        model = ExpenseSheet
        fields = ('pk','created','approved','approvalMatrix','approvalStage','dispensed','notes' , 'project','transaction','submitted' )
        read_only_fields = ( 'project', 'user',)
    def create(self , validated_data):
        u = self.context['request'].user
        reqData = self.context['request'].data
        es = ExpenseSheet(**validated_data)
        es.approvalStage = 0
        if 'project' in reqData:
            es.project = project.objects.get(id = int(reqData['project']))
        else:
            raise ValidationError(detail= 'project ID not found')
        es.dispensed = False
        es.submitted = False
        es.user = u
        es.save()
        return es
    def update(self , instance , validated_data):
        print 'came'
        reqData = self.context['request'].data
        if 'notes' in reqData:
            instance.notes = validated_data.pop('notes')
        if 'approved' in reqData:
                    instance.approved = validated_data.pop('approved')
        if 'project' in reqData:
            instance.project = project.objects.get(pk = int(reqData['project']))
        if instance.user == self.context['request'].user and 'submitted' in reqData:
            if not instance.submitted:
                instance.submitted = True
        instance.save()
        return instance

from ERP.serializers import serviceLiteSerializer

class VendorProfileSerializer(serializers.ModelSerializer):
    service = serviceLiteSerializer(many = False , read_only = True)
    class Meta:
        model = VendorProfile
        fields = ('pk', 'service' , 'contactPerson', 'created' , 'email' , 'mobile' , 'paymentTerm' ,  'contentDocs' )
    def create(self , validated_data):
        v = VendorProfile(**validated_data)
        if 'service' in self.context['request'].data:
            serviceObj = service.objects.get(pk=int(self.context['request'].data['service']))
            serviceObj.vendor = True
            serviceObj.save()
            v.service = serviceObj
        v.save()
        return v

class VendorServiceSerializer(serializers.ModelSerializer):
    vendorProfile = VendorProfileSerializer(many = False , read_only = True)
    class Meta:
        model = VendorService
        fields = ('pk', 'vendorProfile' , 'particular', 'rate' )
    def create(self , validated_data):
        i = VendorService(**validated_data)
        if 'vendorProfile' in self.context['request'].data:
            i.vendorProfile = VendorProfile.objects.get(pk=int(self.context['request'].data['vendorProfile']))
        i.save()
        return i

class VendorInvoiceSerializer(serializers.ModelSerializer):
    vendorProfile = VendorProfileSerializer(many = False , read_only = True)
    class Meta:
        model = VendorInvoice
        fields = ('pk', 'vendorProfile' , 'approver', 'invoice' , 'disbursedOn', 'amount', 'approvedOn', 'dueDate', 'dated','approved','disbursed')
    def create(self , validated_data):
        d = VendorInvoice(**validated_data)
        if 'vendorProfile' in self.context['request'].data:
            d.vendorProfile = VendorProfile.objects.get(pk=int(self.context['request'].data['vendorProfile']))
        d.save()
        return d
    def update(self , instance , validated_data):
        reqData = self.context['request'].data
        if 'approved' in self.context['request'].data:
            print reqData
            instance.approvedOn = datetime.now()
            instance.approved = reqData['approved']
        if 'disbursed' in self.context['request'].data:
            print 'iiiiiiiiiiiiiiiiiiii-----------'
            instance.disbursedOn = datetime.now()
            instance.disbursed = reqData['disbursed']
        instance.save()
        return instance

class PurchaseOrderSerializer(serializers.ModelSerializer):
    costcenter = CostCenterSerializer(many = False , read_only = True)
    bussinessunit = UnitsLiteSerializer(many = False , read_only = True)
    project = projectLiteSerializer(many = False , read_only = True)
    class Meta:
        model = PurchaseOrder
        fields = ('pk', 'created' , 'name' , 'address' , 'personName' , 'phone', 'email' , 'pincode' , 'user' , 'status', 'poNumber' , 'quoteNumber' ,'quoteDate', 'deliveryDate' , 'terms' , 'costcenter' , 'bussinessunit' , 'project' , 'isInvoice','pin_status','country','city','state','accNo','ifsc','bankName','paymentDueDate','gstIn','invoiceTerms')
        read_only_fields = ('user', )
    def create(self , validated_data):
        u = self.context['request'].user
        po = PurchaseOrder(**validated_data)
        po.user = u
        if 'costcenter' in self.context['request'].data:
            po.costcenter = CostCenter.objects.get(pk=int(self.context['request'].data['costcenter']))
        if 'bussinessunit' in self.context['request'].data:
            po.bussinessunit = Unit.objects.get(pk=int(self.context['request'].data['bussinessunit']))
        if 'project' in self.context['request'].data:
            po.project = project.objects.get(pk=int(self.context['request'].data['project']))
        po.save()
        # po.poNumber = po.pk
        # po.save()
        return po
    def update(self , instance , validated_data):
        for key in ['pk', 'created' , 'name' , 'address' , 'personName' , 'phone', 'email' , 'pincode' , 'user' , 'status', 'poNumber' , 'quoteNumber' ,'quoteDate', 'deliveryDate' , 'terms' , 'costcenter' , 'bussinessunit' , 'project' , 'isInvoice','pin_status','country','city','state','accNo','ifsc','bankName','paymentDueDate','gstIn','invoiceTerms']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                print "Error while saving " , key
                pass
        if 'costcenter' in self.context['request'].data:
            instance.costcenter = CostCenter.objects.get(pk=int(self.context['request'].data['costcenter']))
        if 'bussinessunit' in self.context['request'].data:
            instance.bussinessunit = Unit.objects.get(pk=int(self.context['request'].data['bussinessunit']))
        if 'project' in self.context['request'].data:
            instance.project = project.objects.get(pk=int(self.context['request'].data['project']))
        instance.save()
        return instance

class PurchaseOrderQtySerializer(serializers.ModelSerializer):
    productMeta = ProductMetaSerializer(many = False , read_only = True)
    purchaseorder = PurchaseOrderSerializer(many = False , read_only = True)
    class Meta:
        model = PurchaseOrderQty
        fields = ('pk', 'created' , 'product' , 'qty' , 'price','purchaseorder' , 'hsn' , 'tax' , 'total' , 'receivedQty','productMeta' )
    def create(self , validated_data):
        d = PurchaseOrderQty(**validated_data)
        if 'purchaseorder' in self.context['request'].data:
            d.purchaseorder = PurchaseOrder.objects.get(pk=int(self.context['request'].data['purchaseorder']))
        if 'productMeta' in self.context['request'].data:
            d.productMeta = ProductMeta.objects.get(pk=int(self.context['request'].data['productMeta']))
        d.save()
        return d
    def update(self ,instance, validated_data):
        for key in ['pk', 'created' , 'product' , 'qty' , 'price','purchaseorder' , 'hsn' , 'tax' , 'total' , 'receivedQty','productMeta' ]:
            try:
                setattr(instance , key , validated_data[key])
            except:
                print "Error while saving " , key
                pass
        if 'purchaseorder' in self.context['request'].data:
            instance.purchaseorder = PurchaseOrder.objects.get(pk=int(self.context['request'].data['purchaseorder']))
        if 'productMeta' in self.context['request'].data:
            instance.productMeta = ProductMeta.objects.get(pk=int(self.context['request'].data['productMeta']))
        instance.save()
        return instance

class ExpenseHeadingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseHeading
        fields = ('pk', 'title')

class OutBoundInvoiceSerializer(serializers.ModelSerializer):
    costcenter = CostCenterLiteSerializer(many = False , read_only = True)
    bussinessunit = UnitsLiteSerializer(many=False,read_only=True)
    total = serializers.SerializerMethodField()
    tax = serializers.SerializerMethodField()
    class Meta:
        model = OutBoundInvoice
        fields=('pk','created','user','status','isInvoice','poNumber','name','personName','phone','email','address','pincode','state','city','country','pin_status','deliveryDate','payDueDate','gstIn','costcenter','bussinessunit','total','tax')
    def create(self , validated_data):
        obi = OutBoundInvoice(**validated_data)
        obi.user = self.context['request'].user
        if 'costcenter' in self.context['request'].data:
            ccObj = CostCenter.objects.get(pk=int(self.context['request'].data['costcenter']))
            obi.costcenter = ccObj
        if 'bussinessunit' in self.context['request'].data:
            unitObj = Unit.objects.get(pk=int(self.context['request'].data['bussinessunit']))
            obi.bussinessunit = unitObj
        obi.save()
        if 'project' in self.context['request'].data:
            projObj = project.objects.get(pk=int(self.context['request'].data['project']))
            projObj.ourBoundInvoices.add(obi)
            projObj.save()
        return obi
    def get_total(self , obj):
        tot = 0
        objData = OutBoundInvoiceQty.objects.filter(outBound=obj.pk)
        tot = sum(i.total for i in objData)
        return tot
    def get_tax(self , obj):
        taxTot = 0
        objData = OutBoundInvoiceQty.objects.filter(outBound=obj.pk)
        for i in objData:
            tot = round((i.total*i.tax)/100)
            taxTot+=tot
        return taxTot


class OutBoundInvoiceQtySerializer(serializers.ModelSerializer):
    hsn = ProductMetaSerializer(many = False , read_only = True)
    class Meta:
        model = OutBoundInvoiceQty
        fields=('pk','created','outBound','product','qty','price','hsn','tax','total')
    def create(self , validated_data):
        obiq = OutBoundInvoiceQty(**validated_data)
        if 'outBound' in self.context['request'].data:
            obiq.outBound = OutBoundInvoice.objects.get(pk=int(self.context['request'].data['outBound']))
        if 'hsn' in self.context['request'].data:
            obiq.hsn = ProductMeta.objects.get(pk=int(self.context['request'].data['hsn']))
        obiq.save()
        return obiq
    def update(self ,instance, validated_data):
        for key in ['product','qty','price','tax','total']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                print "Error while saving " , key
                pass
        if 'outBound' in self.context['request'].data:
            instance.outBound = OutBoundInvoice.objects.get(pk=int(self.context['request'].data['outBound']))
        if 'hsn' in self.context['request'].data:
            instance.hsn = ProductMeta.objects.get(pk=int(self.context['request'].data['hsn']))
        instance.save()
        return instance

class InventorySerializer(serializers.ModelSerializer):
    total = serializers.SerializerMethodField()
    totalRef = serializers.SerializerMethodField()
    class Meta:
        model = Inventory
        fields=('pk','created','name','value','rate','total','qtyAdded','refurnished','refurnishedAdded','totalRef')
    def get_total(self , obj):
        tot = 0
        objData = InventoryLog.objects.filter(inventory=obj.pk)
        tot = sum(int(i.value) for i in objData)
        return tot
    def get_totalRef(self , obj):
        totRef = 0
        objData = InventoryLog.objects.filter(inventory=obj.pk)
        totRef = sum(int(i.refurnished) for i in objData)
        return totRef

class InventoryLogSerializer(serializers.ModelSerializer):
    inventory = InventorySerializer(many = False , read_only = True)
    class Meta:
        model = InventoryLog
        fields=('pk','created','inventory','user','value','refurnished')
        read_only_fields = ('user', )
    def create(self , validated_data):
        u = self.context['request'].user
        inv = InventoryLog(**validated_data)
        inv.user = u
        if 'inventory' in self.context['request'].data:
            inv.inventory = Inventory.objects.get(pk=int(self.context['request'].data['inventory']))
        inv.save()
        return inv
