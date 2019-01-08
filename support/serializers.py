from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
from HR.serializers import userSearchSerializer
from ERP.models import service
from ERP.serializers import serviceSerializer
from ERP.serializers import serviceLiteSerializer
from rest_framework.response import Response
from fabric.api import *
import os
from django.conf import settings as globalSettings
import datetime
from django.contrib.auth.hashers import make_password,check_password
from django.core.exceptions import SuspiciousOperation




class ProductsSerializer(serializers.ModelSerializer):
    total_quantity = serializers.SerializerMethodField()
    class Meta:
        model = Products
        fields = ('pk', 'created', 'part_no','description_1','description_2','replaced','customs_no','parent','weight','price','sheet','bar_code','gst','custom','total_quantity')
    def get_total_quantity(self , obj):
        inventory = Inventory.objects.filter(product=obj.pk)
        qty = 0
        for i in inventory:
            qty+= i.qty
        if qty>0:
            return qty
        else:
            return 0




class ProductSheetSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSheet
        fields = ('pk','created','sheet','file_name')


class VendorSerializer(serializers.ModelSerializer):

    class Meta:
        model = Vendor
        fields = ('pk','created','name' ,'personName' , 'city','street','state','pincode','country','mobile','gst','email')

class ProjectsSerializer(serializers.ModelSerializer):
    # responsible = userSearchSerializer(many = True , read_only = True)
    service = serviceLiteSerializer(many = False , read_only = True)
    vendor = VendorSerializer(many = False , read_only = True)

    class Meta:
        model = Projects
        fields  = ('pk', 'created', 'title', 'service', 'date', 'responsible','machinemodel','comm_nr','quote_ref','enquiry_ref','approved1','approved2','approved1_user','approved2_user','approved1_date','approved2_date','status','revision','savedStatus','invoiceValue','insurance','freight','assessableValue','gst1','gst2','clearingCharges1','clearingCharges2','packing','vendor','exRate','poNumber','invoiceNumber','boeRefNumber','profitMargin','quoteRefNumber','quoteValidity','terms','delivery','paymentTerms','junkStatus','poDate','quoteDate','shipmentMode','shipmentDetails','weightValue')

    def create(self , validated_data):
        p = Projects()
        if 'service' in self.context['request'].data:
            p.service = service.objects.get(pk=int(self.context['request'].data['service']))
        if 'title' in self.context['request'].data:
            p.title = self.context['request'].data['title']
        if 'machinemodel' in self.context['request'].data:
            p.machinemodel = self.context['request'].data['machinemodel']
        if 'comm_nr' in self.context['request'].data:
            p.comm_nr = self.context['request'].data['comm_nr']
        if 'quote_ref' in self.context['request'].data:
            p.quote_ref = self.context['request'].data['quote_ref']
        if 'enquiry_ref' in self.context['request'].data:
            p.enquiry_ref = self.context['request'].data['enquiry_ref']
        if 'date' in self.context['request'].data:
            p.date = self.context['request'].data['date']
        if 'revision' in self.context['request'].data:
            p.revision = self.context['request'].data['revision']
        if 'vendor' in self.context['request'].data:
            p.vendor = Vendor.objects.get(pk=int(self.context['request'].data['vendor']))
        p.save()
        if 'responsible' in self.context['request'].data:
            for i in self.context['request'].data['responsible']:
                p.responsible.add(User.objects.get(pk = i))
            p.save()
        return p

    def update (self, instance, validated_data):
        for key in ['title','status','approved2' , 'approved2_date','approved2_user','comm_nr','quote_ref','enquiry_ref','machinemodel','approved1','approved1_user','approved1_date','revision','savedStatus','invoiceValue','packing','insurance','freight','assessableValue','gst1','gst2','clearingCharges1','clearingCharges2','exRate','profitMargin','invoiceNumber','boeRefNumber','poNumber','quoteRefNumber','quoteValidity','terms','delivery','paymentTerms','junkStatus','poDate','quoteDate','shipmentMode','shipmentDetails','weightValue']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        if 'responsible' in self.context['request'].data:
            instance.responsible.clear()
            for i in self.context['request'].data['responsible']:
                instance.responsible.add(User.objects.get(pk = i))
        if 'service' in self.context['request'].data:
            instance.service = service.objects.get(pk=int(self.context['request'].data['service']))
        if 'vendor' in self.context['request'].data:
            instance.vendor = Vendor.objects.get(pk=int(self.context['request'].data['vendor']))
        if 'date' in self.context['request'].data:
            instance.date = self.context['request'].data['date']
        instance.save()
        return instance






class BoMSerializer(serializers.ModelSerializer):
    products = ProductsSerializer(many = False , read_only = True)
    project =  ProjectsSerializer(many = True  , read_only =True)
    class Meta:
        model = BoM
        fields = ('pk','created','user' , 'products','project','quantity1','quantity2','price','landed_price','invoice_price','customer_price','gst','custom','customs_no')

    def create(self, validated_data):

        b = BoM(**validated_data)
        if 'products' in self.context['request'].data:
            b.products = Products.objects.get(pk=int(self.context['request'].data['products']))
            print b.products,'bbbbbbbbb'
        b.save()
        if 'project' in self.context['request'].data:
            for i in self.context['request'].data['project']:
                b.project.add(Projects.objects.get(pk = i))
        b.save()
        return b
        def update (self, instance, validated_data):
            for key in ['pk','created','user' , 'products','project','quantity1','quantity2','price','landed_price','invoice_price','customer_price','gst','custom','customs_no']:
                try:
                    setattr(instance , key , validated_data[key])
                except:
                    pass
            instance.save()
            return instance


class InventorySerializer(serializers.ModelSerializer):
    product = ProductsSerializer(many = False , read_only = True)
    class Meta:
        model = Inventory
        fields = ('pk','created','product','qty','rate')
    def create(self, validated_data):
        b = Inventory(**validated_data)
        if 'product' in self.context['request'].data:
            b.product = Products.objects.get(pk=int(self.context['request'].data['product']))
        b.save()
        return b

class MaterialIssueSerializer(serializers.ModelSerializer):
    product = ProductsSerializer(many = False , read_only = True)
    class Meta:
        model = MaterialIssue
        fields = ('pk','created','product','qty','price')
    def create(self, validated_data):
        b = MaterialIssue(**validated_data)
        if 'product' in self.context['request'].data:
            b.product = Products.objects.get(pk=int(self.context['request'].data['product']))
        b.save()
        return b

class MaterialIssueMainSerializer(serializers.ModelSerializer):
    materialIssue = MaterialIssueSerializer(many = True , read_only = True)
    project = ProjectsSerializer(many = False , read_only = True)
    user = userSearchSerializer(many = False , read_only = True)
    class Meta:
        model = MaterialIssueMain
        fields = ('pk','created','project','materialIssue','user')
    def create(self, validated_data):
        b = MaterialIssueMain(**validated_data)
        if 'materialIssue' in self.context['request'].data:
            for i in self.context['request'].data['materialIssue']:
                materialIssue.add(MaterialIssue.objects.get(pk = i))
            b.save()
        if 'project' in self.context['request'].data:
            b.project = Projects.objects.get(pk=int(self.context['request'].data['project']))
        if 'user' in self.context['request'].data:
            b.user = User.objects.get(pk=int(self.context['request'].data['user']))
        b.save()
        return b

class StockCheckSerializer(serializers.ModelSerializer):
    # inventory = InventorySerializer(many = False , read_only = True)
    class Meta:
        model = StockCheck
        fields = ('pk','date','inventory','count','status')

        # def create(self, validated_data):
        #     s = StockCheck(**validated_data)
        #     if 'inventory' in self.context['request'].data:
        #        s.product = Inventory.objects.get(pk=int(self.context['request'].data['inventory']))
        #     s.save()
        #     return s

class StockCheckLogSerializer(serializers.ModelSerializer):

    class Meta:
        model = StockCheckLog
        fields = ('pk','product')

class StockSummaryReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockSummaryReport
        fields = ('pk','created','dated','stockValue')

class ProjectStockSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectStockSummary
        fields = ('pk','created','stockReport','value','title')
