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
    class Meta:
        model = Products
        fields = ('pk', 'created', 'part_no','description_1','description_2','parent','weight','price','customs_no','sheet')



class ProductSheetSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSheet
        fields = ('pk','created','sheet','file_name')


class ProjectsSerializer(serializers.ModelSerializer):
    # responsible = userSearchSerializer(many = True , read_only = True)
    service = serviceLiteSerializer(many = False , read_only = True)

    class Meta:
        model = Projects
        fields  = ('pk', 'created', 'title', 'service', 'date', 'responsible','machinemodel','comm_nr','customer_ref','approved1','approved2','approved1_user','approved2_user','approved1_date','approved2_date','status')

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
        if 'customer_ref' in self.context['request'].data:
            p.customer_ref = self.context['request'].data['customer_ref']
        if 'date' in self.context['request'].data:
            p.date = self.context['request'].data['date']
        p.save()
        if 'responsible' in self.context['request'].data:
            for i in self.context['request'].data['responsible']:
                p.responsible.add(User.objects.get(pk = i))
            p.save()
        return p

    def update (self, instance, validated_data):
        if 'responsible' in self.context['request'].data:
            instance.responsible.clear()
            for i in self.context['request'].data['responsible']:
                instance.responsible.add(User.objects.get(pk = i))
        if 'service' in self.context['request'].data:
            instance.service = service.objects.get(pk=int(self.context['request'].data['service']))
        if 'date' in self.context['request'].data:
            instance.date = self.context['request'].data['date']
        if 'title' in self.context['request'].data:
            instance.title = self.context['request'].data['title']
        instance.save()
        if 'status' in validated_data:
            instance.status = validated_data['status']
        instance.save()
        if 'approved2' in validated_data:
            instance.approved2 = validated_data['approved2']
        instance.save()
        if 'approved2_date' in validated_data:
            instance.approved2_date = validated_data['approved2_date']
        instance.save()
        if 'approved2_user' in validated_data:
            instance.approved2_user = validated_data['approved2_user']
        instance.save()
        if 'machinemodel' in validated_data:
            instance.machinemodel = validated_data['machinemodel']
        instance.save()
        if 'comm_nr' in validated_data:
            instance.comm_nr = validated_data['comm_nr']
        instance.save()
        if 'customer_ref' in validated_data:
            instance.customer_ref = validated_data['customer_ref']
        instance.save()
        return instance

class BoMSerializer(serializers.ModelSerializer):
    products = ProductsSerializer(many = False , read_only = True)
    project =  ProjectsSerializer(many = True  , read_only =True)
    class Meta:
        model = BoM
        fields = ('pk','created','user' , 'products','project','quantity1','quantity2','price','customer_price')

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
            for key in ['pk','created','user' , 'products','project','quantity1','quantity2','price']:
                try:
                    setattr(instance , key , validated_data[key])
                except:
                    pass
            instance.save()
            return instance

# <<<<<<< HEAD
#     def update (self, instance, validated_data):
#
#         if 'price' in validated_data:
#             instance.price = validated_data['price']
#         instance.save()
#         if 'quantity2' in validated_data:
#             instance.quantity2 = validated_data['quantity2']
#         instance.save()
#         return instance

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
