from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
from HR.views import generateOTPCode
import hashlib
import random, string
from django.core.exceptions import ObjectDoesNotExist , SuspiciousOperation
from django.contrib.auth import authenticate , login , logout
from django.shortcuts import redirect , get_object_or_404
from django.conf import settings as globalSettings
from ERP.models import application, permission , module
import requests
from HR.models import profile
from django.template.loader import render_to_string, get_template
from django.core.mail import send_mail, EmailMessage
import ast


class sheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = ('pk','created','dated','slot','name','emailId')
