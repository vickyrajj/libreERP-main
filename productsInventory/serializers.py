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
