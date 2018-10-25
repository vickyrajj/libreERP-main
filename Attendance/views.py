# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from rest_framework import viewsets , permissions
from django.shortcuts import render
from url_filter.integrations.drf import DjangoFilterBackend
# from .serializers import *
from API.permissions import *
from models import *
import json

# Create your views here.
class calendarViewSet(viewsets.ModelViewSet):
    # permission_classes = (permissions.IsAuthenticated, )
    # serializer_class = calendarSerializer
    # filter_backends = [DjangoFilterBackend]
    # filter_fields = ['text' , 'originator' , 'data']
    def get_queryset(self):
    #     qs1 = calendar.objects.filter(user =  self.request.user).order_by('when')
    #     qs2 = self.request.user.calendarItemsFollowing.all().order_by('when')
    #
    #     toReturn = qs1 | qs2
    #     toReturn = toReturn.distinct()
    #
    #     if 'clients__in' in self.request.GET:
    #         clients = json.loads(self.request.GET['clients__in'])
    #         # print type(clients) , type(clients[0])
    #         toReturn = toReturn.filter(clients__in = clients)

        return Return
