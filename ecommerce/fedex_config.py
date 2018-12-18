"""
This file holds various configuration options used for all of the examples.
You will need to change the values below to match your test account.
"""
import os
import sys

# Use the fedex directory included in the downloaded package instead of
# any globally installed versions.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from fedex.config import FedexConfig
from django.conf import settings as globalSettings



# Change these values to match your testing account/meter number.
CONFIG_OBJ = FedexConfig(key= 'TAQDL2KcVX0ijQOQ' ,
                         password= '7UAEID6HfVBLfmiHnFH4EhRfH',
                         account_number= '510087500' ,
                         meter_number= '119097717',
                         # freight_account_number='510087020',
use_test_server=True)
