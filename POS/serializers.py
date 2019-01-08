from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
from PIM.serializers import *
from HR.serializers import userSearchSerializer
from ERP.serializers import serviceLiteSerializer , serviceSerializer , addressSerializer
from rest_framework.response import Response
from fabric.api import *
import os
from django.conf import settings as globalSettings
# from clientRelationships.models import ProductMeta
# from clientRelationships.serializers import ProductMetaSerializer
from ERP.models import service , appSettingsField

import json
from bs4 import BeautifulSoup
import textwrap


#------------------------- Printer Code ------------

# from __future__ import print_function
from os import environ
from django.forms.models import model_to_dict
import os
import argparse
# from twisted.internet import reactor
# from twisted.internet.defer import inlineCallbacks
#
# from autobahn.twisted.wamp import ApplicationSession, ApplicationRunner
import requests
from django.db.models import Sum

# from escpos import printer
# Epson = printer.Usb(0x154f,0x154f,0,0x81,0x02)
# Print text
from datetime import datetime
date_obj = datetime.now()
date = date_obj.strftime('%d/%m/%Y')
time_sec = date_obj.strftime('%H:%M:%S')


class ProductMetaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductMeta
        fields = ('pk'  ,'description' , 'typ' , 'code' , 'taxRate')



class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ('pk' , 'user' ,'name', 'company', 'email', 'mobile' , 'notes' , 'pan' , 'gst' , 'street' , 'city' , 'state' , 'pincode' , 'country' ,  'streetBilling' , 'cityBilling' , 'stateBilling' , 'pincodeBilling' , 'countryBilling' , 'sameAsShipping')
        read_only_fields = ( 'user' , )
    def create(self , validated_data):
        c = Customer(**validated_data)
        c.user = self.context['request'].user
        c.save()
        return c


class ProductLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ('pk' , 'user' ,'name',  'price', 'displayPicture','serialNo', 'cost','haveComposition' , 'inStock','discount','alias','howMuch','grossWeight')


class ProductSerializer(serializers.ModelSerializer):
    productMeta=ProductMetaSerializer(many=False,read_only=True)
    compositions=ProductLiteSerializer(many=True,read_only=True)
    skuUnitpack = serializers.SerializerMethodField()
    productOption = serializers.SerializerMethodField()
    # masterStock = serializers.SerializerMethodField()
    # StoreStock = serializers.SerializerMethodField()
    class Meta:
        model = Product
        fields = ('pk' , 'user' ,'name', 'productMeta', 'price', 'displayPicture', 'serialNo', 'description','discount', 'inStock','cost','logistics','serialId','reorderTrashold' , 'haveComposition' , 'compositions' , 'compositionQtyMap','unit','skuUnitpack','alias','howMuch','productOption','grossWeight')

        read_only_fields = ( 'user' , 'productMeta', 'compositions')
    def create(self , validated_data):
        print self.context['request'].data
        print 'entered','***************'
        print validated_data
        p = Product(**validated_data)
        p.user = self.context['request'].user
	p.save()
        if 'compositions' in self.context['request'].data:
            p.compositions.clear()
            for c in self.context['request'].data['compositions']:
                p.compositions.add(Product.objects.get(pk = c))
        if 'productMeta' in self.context['request'].data:
            print self.context['request'].data['productMeta']
            p.productMeta = ProductMeta.objects.get(pk=int(self.context['request'].data['productMeta']))
        # if 'storeQty' in self.context['request'].data:
        #     p.storeQty.clear()
        #     for c in self.context['request'].data['storeQty']:
        #         p.storeQty.add(StoreQty.objects.get(pk = c))
        p.save()
        return p




    # def update(self ,instance, validated_data):
    #     print 'entered','***************'
    #     # print self.context['request'].data
    #     # print int(self.context['request'].data['productMeta'])
    #     # p = Product(**validated_data)
    #     # p.user = self.context['request'].user
    #     instance.productMeta = ProductMeta.objects.get(pk=int(self.context['request'].data['productMeta']))
    #     instance.save()
    #     return instance
    def update(self ,instance, validated_data):
        print 'entered in updating ************************************'
        print self.context['request'].data

        print 'entered','***************'
        print validated_data

        if 'typ' in self.context['request'].data and self.context['request'].data['typ']=='user':
            il = InventoryLog(before = instance.inStock , after = validated_data['inStock'],product = instance,typ = 'user' , user = self.context['request'].user)
            il.save()

        for key in ['name', 'price', 'displayPicture', 'serialNo', 'description','discount' ,'inStock','cost','logistics','serialId','reorderTrashold', 'haveComposition' , 'compositionQtyMap','unit','alias','howMuch','grossWeight']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        if 'productMeta' in self.context['request'].data:
            print self.context['request'].data['productMeta']
            instance.productMeta = ProductMeta.objects.get(pk=int(self.context['request'].data['productMeta']))

        if 'compositions' in self.context['request'].data:
            instance.compositions.clear()
            if len(self.context['request'].data['compositions'])!=0:

                print self.context['request'].data['compositions'],type(self.context['request'].data['compositions'])
                for c in self.context['request'].data['compositions'].split(','):
                    instance.compositions.add(Product.objects.get(pk = int(c)))
                # if 'storeQty' in self.context['request'].data:
                #     print self.context['request'].data['storeQty'],'ssssssssssssssssssss',len(self.context['request'].data['storeQty'])
                #     if len(self.context['request'].data['storeQty']) > 0:
                #         instance.storeQty.clear()
                #         for c in self.context['request'].data['storeQty'].split(','):
                #             print type(c), c
                #             instance.storeQty.add(StoreQty.objects.get(pk = int(c)))


        instance.save()
        return instance

    def get_skuUnitpack(self, obj):
        if 'search' in self.context['request'].GET and len(self.context['request'].GET['search'])>0:
            pvObj = ProductVerient.objects.filter(sku__icontains=self.context['request'].GET['search'],parent=obj.pk).values('unitPerpack')
            if len(pvObj)>0:
                return list(pvObj)[0]['unitPerpack']
        return None
    def get_productOption(self, obj):
        try:
            settingObj = appSettingsField.objects.filter(app=int(25), name = 'posProduct')
            return settingObj[0].flag
        except:
            return None
    # def get_masterStock(self, obj):
    #     return obj.inStock
    # def get_StoreStock(self, obj):
    #     try:
    #         val = obj.storeQty.all().aggregate(Sum('quantity'))['quantity__sum']
    #         toSend = val if val else 0
    #     except:
    #         toSend = None
    #     return toSend


class ManufactureManifestSerializer(serializers.ModelSerializer):
    product = ProductLiteSerializer(many=False,read_only=True)
    class Meta:
        model = ManufactureManifest
        fields = ('pk','created','updated','user','product','quantity','status','specialInstruction')
    def create(self , validated_data):
        m = ManufactureManifest(**validated_data)
        m.product = Product.objects.get(pk=int(self.context['request'].data['product']))
        m.save()
        return m


class ProductVerientSerializer(serializers.ModelSerializer):
    # discountedPrice = serializers.SerializerMethodField()
    class Meta:
        model = ProductVerient
        fields = ('pk','created','updated','sku','unitPerpack','price','parent','discountedPrice','serialId','prodDesc')
    def create(self , validated_data):
        v = ProductVerient(**validated_data)
        v.parent = Product.objects.get(pk=int(self.context['request'].data['parent']))
        # if self.context['request'].data['price'] is None:
        #     price = 0
        # else:
        price = self.context['request'].data['price']
        v.discountedPrice = float(price) - (v.parent.discount / 100.00 ) *  float(price)
        v.save()
        return v
    # def get_discountedPrice(self , obj):
    #     if obj.price is None:
    #         obj.price = 0
    #     print obj.price , obj.parent.discount , '&&&&&&&&&'
    #     return obj.price - (obj.parent.discount / 100.00 ) *  obj.price

class StoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Store
        fields = ('pk' ,'created' , 'name' , 'address' , 'pincode' , 'mobile' , 'email')

class StoreQtySerializer(serializers.ModelSerializer):
    store = StoreSerializer(many = False , read_only = True)
    product = ProductSerializer(many = False , read_only = True)
    productVariant = ProductVerientSerializer(many = False , read_only = True)
    # some = serializers.SerializerMethodField()
    class Meta:
        model = StoreQty
        fields = ('pk' ,'created', 'store' , 'quantity' ,'product','productVariant','master')
    def create(self , validated_data):
        s = StoreQty(**validated_data)
        if 'store' in self.context['request'].data:
            s.store = Store.objects.get(pk=self.context['request'].data['store'])
        if 'productVariant' in self.context['request'].data:
            s.productVariant = ProductVerient.objects.get(pk=self.context['request'].data['productVariant'])
        if 'product' in self.context['request'].data:
            s.product = Product.objects.get(pk=self.context['request'].data['product'])
        if 'master' in self.context['request'].data:
            s.master = self.context['request'].data['master']
        s.save()
        return s

    def update(self ,instance, validated_data):
        for key in ['quantity']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        if 'store' in self.context['request'].data:
            instance.store = Store.objects.get(pk=self.context['request'].data['store'])
        instance.save()
        return instance

    # def get_some(self, obj):
    #     print obj,'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
    #     print model_to_dict(obj)
    #     return StoreSerializer( Store.objects.get(pk=3) ).data



# class StoreQtyLiteSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = StoreQty
#         fields = ('pk' ,'created', 'store' , 'quantity' ,'product','productVariant','master')

# class ProductVerientLiteInventorySerializer(serializers.ModelSerializer):
#     storeProdVar = StoreQtyLiteSerializer(many = True , read_only = True)
#     class Meta:
#         model = ProductVerient
#         fields = ('pk','created','updated','sku','unitPerpack','price','storeProdVar','discountedPrice')


# class ProductInventorySerializer(serializers.ModelSerializer):
#     parentProducts = ProductVerientLiteInventorySerializer(many = True , read_only = True)
#     class Meta:
#         model = Product
#         fields = ('pk' , 'user' ,'name',  'price', 'displayPicture','serialNo', 'cost','haveComposition' , 'inStock','discount','alias','howMuch' , 'parentProducts')


class InvoiceSerializer(serializers.ModelSerializer):
    customer=CustomerSerializer(many=False,read_only=True)
    class Meta:
        model = Invoice
        fields = ('pk' ,'created', 'serialNumber', 'invoicedate' ,'reference' ,'duedate' ,'returnquater' ,'customer' ,'products', 'amountRecieved','modeOfPayment','received','grandTotal','totalTax','paymentRefNum','receivedDate','status','barCVal','orderBy')
        read_only_fields = ( 'user' , 'customer')

    def create(self , validated_data):
        print validated_data,'**************'
        print '****************************'
        print self.context['request'].data

        inv = Invoice(**validated_data)
        if 'customer' in self.context['request'].data:
            inv.customer = Customer.objects.get(pk=int(self.context['request'].data['customer']))
        inv.save()
        td = datetime.now()
        bcVal = 'BCOFF'+str(td.day)+str(td.month)+str(td.year)[2:]+str(inv.pk)
        inv.barCVal = bcVal
        inv.save()
        if 'products' in validated_data:
            productList = json.loads(validated_data['products'])
            for i in productList:
                print i['data']['pk'],'$$$$$$$$$$$$$$$$$$$$$$$$$$$$'
                storeQtyObj = StoreQty.objects.get(pk= i['data']['pk'])
                storeQtyObj.quantity = storeQtyObj.quantity - i['quantity']
                storeQtyObj.save()
                # data = {'user':self.context['request'].user,'product':pObj,'typ':'system','after':i['quantity'],'internalInvoice':inv}
                # InventoryLog.objects.create(**data)
        if 'connectedDevice' in self.context['request'].data:
            if inv.status == 'Completed':
                # try:
                #     doubleCopyObj = appSettingsField.objects.get(name='doubleInvoiceCopy')
                #     if doubleCopyObj.flag:
                #         billTimes = 2
                #     else:
                #         billTimes = 1
                # except:
                #     billTimes = 1
                try:
                    companyName = appSettingsField.objects.get(app__id=25,name='companyName').value
                    companyAddress = appSettingsField.objects.get(app__id=25,name='companyAddress').value
                    soup1 = BeautifulSoup(companyName)
                    companyName = str(soup1.text)
                    soup2 = BeautifulSoup(companyAddress)
                    companyAddress = str(soup2.text)

                except:
                    companyName = ''
                    companyAddress = ''

                try:
                    toSend = model_to_dict(inv)
                    if 'storepk' in self.context['request'].data:
                        storeObj = Store.objects.get(pk=int(self.context['request'].data['storepk']))
                        storeName = ''
                        storeAddress = ''
                        if storeObj.name:
                            storeName = storeObj.name
                        if storeObj.address:
                            storeAddress = storeObj.address
                            if storeObj.pincode:
                                storeAddress += ' ' + str(storeObj.pincode)

                    else:
                        storeName = ''
                        storeAddress = ''
                    date_obj = datetime.now()
                    c_date = date_obj.strftime('%d/%m/%Y')
                    c_time = date_obj.strftime('%H:%M:%S')
                    toSend['date'] = c_date
                    toSend['time'] = c_time
                    toSend['companyName'] = companyName
                    toSend['companyAddress'] = companyAddress
                    toSend['storeName'] = storeName
                    toSend['storeAddress'] = storeAddress
                    print 'postinggggggggggggggggg',date_obj

                    # for tim in range(billTimes):
                    if inv.modeOfPayment != 'cashOnDelivery':
                        requests.post("http://"+globalSettings.WAMP_SERVER+":8080/notify",json={'topic': 'service.POS.Printer.{0}'.format(self.context['request'].data['connectedDevice']),'args': [{'data':toSend}]})
                except:
                    print 'Server Has Not Connected'
        return inv


    def update(self ,instance, validated_data):
        oldData = json.loads(instance.products)
        if 'products' in validated_data:
            productList = json.loads(validated_data['products'])
        else:
            productList = []
        print 'sssssssssssssss',oldData,productList

        for i in oldData:
            for j in productList:
                if i['data']['pk']==j['data']['pk']:
                    print i['data']['pk'],'pkppppppppppppppp'
                    if i['quantity'] > j['quantity']:
                        print 'reduced'
                        try:
                            storeQtyObj = StoreQty.objects.get(pk = i['data']['pk'])
                        except:
                            raise PermissionDenied(detail={'PARAMS' : 'Product doesnt exist anymore'} )
                        storeQtyObj.quantity = storeQtyObj.quantity + (i['quantity'] - j['quantity'])
                        storeQtyObj.save()
                    elif j['quantity'] > i['quantity']:
                        print 'increased'
                        try:
                            storeQtyObj = StoreQty.objects.get(pk = i['data']['pk'])
                        except:
                            raise PermissionDenied(detail={'PARAMS' : 'Product doesnt exist anymore'} )
                        storeQtyObj.quantity = storeQtyObj.quantity - (j['quantity'] - i['quantity'])
                        storeQtyObj.save()
                    else:
                        print 'no changes'
        # for idx1,i in enumerate(oldData):
        #     pObj = Product.objects.get(pk=i['data']['pk'])
        #     for idx2,j in enumerate(productList):
        #         if i['data']['pk']==j['data']['pk']:
        #             if i['quantity'] > j['quantity']:
        #                 print 'increasedddddddddddddddd and inventory created'
        #                 if 'storepk' in self.context['request'].data:
        #                     print 'multistoreeeeeeeeeeeeeeeeee'
        #                     storeObj = Store.objects.get(pk=int(self.context['request'].data['storepk']))
        #                     storeQtyObj = pObj.storeQty.get(store__id=storeObj.pk)
        #                     storeQtyObj.quantity = storeQtyObj.quantity + (i['quantity'] - j['quantity'])
        #                     storeQtyObj.save()
        #                 else:
        #                     print 'singlestoreeeeeeeeeeeeeeeeeee'
        #                     pObj.inStock = pObj.inStock + (i['quantity'] - j['quantity'])
        #                 pObj.save()
        #                 data = {'user':self.context['request'].user,'product':pObj,'typ':'system','before':i['quantity'],'after':j['quantity'],'internalInvoice':instance}
        #                 InventoryLog.objects.create(**data)
        #             elif j['quantity'] > i['quantity']:
        #                 print 'decreasedddddddddddddddd and inventory created'
        #                 if 'storepk' in self.context['request'].data:
        #                     print 'multistoreeeeeeeeeeeeeeeeee'
        #                     storeObj = Store.objects.get(pk=int(self.context['request'].data['storepk']))
        #                     storeQtyObj = pObj.storeQty.get(store__id=storeObj.pk)
        #                     storeQtyObj.quantity = storeQtyObj.quantity - (j['quantity'] - i['quantity'])
        #                     storeQtyObj.save()
        #                 else:
        #                     print 'singlestoreeeeeeeeeeeeeeeeeee'
        #                     pObj.inStock = pObj.inStock - (j['quantity'] - i['quantity'])
        #                 pObj.save()
        #                 data = {'user':self.context['request'].user,'product':pObj,'typ':'system','before':i['quantity'],'after':j['quantity'],'internalInvoice':instance}
        #                 InventoryLog.objects.create(**data)
        #             else:
        #                 print 'no changeeeeeeeeee'
        #             del productList[idx2]
        #             break
        #     else:
        #         print 'deletedddddddddddddddd and inventory created'
        #         pObj.inStock = pObj.inStock + i['quantity']
        #         pObj.save()
        #         data = {'user':self.context['request'].user,'product':pObj,'typ':'system','before':i['quantity'],'internalInvoice':instance}
        #         InventoryLog.objects.create(**data)
        # for idx3,i in enumerate(productList):
        #     print 'new producttttttttttttttt and inventory created'
        #     pObj = Product.objects.get(pk=i['data']['pk'])
        #     pObj.inStock = pObj.inStock - i['quantity']
        #     pObj.save()
        #     data = {'user':self.context['request'].user,'product':pObj,'typ':'system','after':i['quantity'],'internalInvoice':instance}
        #     InventoryLog.objects.create(**data)


        for key in ['serialNumber', 'invoicedate' ,'reference' ,'duedate' ,'returnquater' ,'products', 'amountRecieved','modeOfPayment','received','grandTotal','totalTax','paymentRefNum','receivedDate','status']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        if 'userId' in self.context['request'].data:
            try:
                userObj = User.objects.get(pk=int(self.context['request'].data['userId']))
                instance.orderBy = userObj
                instance.save()
            except:
                pass
        if 'customer' in self.context['request'].data:
            instance.customer = Customer.objects.get(pk=int(self.context['request'].data['customer']))
        instance.save()
        return instance



class VendorProfileSerializer(serializers.ModelSerializer):
    service = serviceSerializer(many = False , read_only = True)
    class Meta:
        model = VendorProfile
        fields = ('pk','created','updated','service','contactDoc','paymentTerm','contactPersonName','contactPersonNumber','contactPersonEmail')
    def create(self , validated_data):
        p = VendorProfile(**validated_data)
        p.service = service.objects.get(pk=self.context['request'].data['service'])

        try:
            p.save()
        except:
            raise ValidationError(detail={'PARAMS' : 'Service Profile already exists'} )
        return p

class PurchaseOrderSerializer(serializers.ModelSerializer):
    service = serviceSerializer(many = False , read_only = True)
    class Meta:
        model = PurchaseOrder
        fields = ('pk','user','created','updated','status','products','totalamount','service')
    def create(self , validated_data):
        p = PurchaseOrder(**validated_data)
        p.user = self.context['request'].user
        p.service = service.objects.get(pk=self.context['request'].data['service'])
        p.save()
        return p

class VendorServicesSerializer(serializers.ModelSerializer):
    product = ProductSerializer(many = False , read_only = True)
    class Meta:
        model = VendorServices
        fields = ('pk','vendor','product','rate','fulfilmentTime','logistics')
        read_only_fields = ( 'vendor' , 'product')
    def create(self , validated_data):
        p = VendorServices(**validated_data)
        p.vendor = VendorProfile.objects.get(pk=self.context['request'].data['vendor'])
        p.product = Product.objects.get(pk=self.context['request'].data['product'])
        p.save()
        return p

class VendorServicesLiteSerializer(serializers.ModelSerializer):
    service = serviceSerializer(many = False , read_only = True)
    vendor = VendorProfileSerializer(many = False , read_only = True)
    class Meta:
        model = VendorServices
        fields = ('pk','vendor','product','rate','fulfilmentTime','logistics','service')


class ExternalOrdersSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalOrders
        fields = ('pk','created','updated','marketPlace','orderID','products','status','buyersPrice','tax','shipper','shipperAWB','shippingFees','shippingTax','marketPlaceTax','earnings','buyerPincode')
    # def create(self , validated_data):
    #     e = ExternalOrders(**validated_data)
    #     e.user = self.context['request'].user
    #     e.save()
    #     return e

class ExternalOrdersliteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalOrders
        fields = ('pk','marketPlace','orderID')

class InventoryLogSerializer(serializers.ModelSerializer):
    externalOrder = ExternalOrdersliteSerializer(many = False , read_only = True)
    class Meta:
        model = InventoryLog
        fields = ('pk','user','created','updated','product','typ','before','after','externalOrder')

class ExternalOrdersQtyMapSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalOrdersQtyMap
        fields = ('pk','product','qty')
