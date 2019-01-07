"""
Django settings for libreERP project.

Generated by 'django-admin startproject' using Django 1.8.5.

For more information on this file, see
https://docs.djangoproject.com/en/1.8/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.8/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os
from django.contrib.messages import constants as messages

MESSAGE_TAGS = {
    messages.ERROR: 'danger'
}

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# DEFAULT_APPS_ON_REGISTER = ['app.tutor.account' , 'app.tutor.previousSessions' , 'app.tutor.studentHome']
DEFAULT_APPS_ON_REGISTER = []
# the apps to which the user will be given access to upon registeration through public registeration site

ON_REGISTRATION_SUCCESS_REDIRECT = '/ERP' # when signup using google the user will be redirected to this url

SITE_ADDRESS = 'http://sterlingselect.com' # the url prefix of the site

ROOT_APP = 'ERP' # the default app
ECOMMERCE_APP = {
    'ui': 'food', # the options can be food , rental, shop
    # food UI is like Fassos or Zomatto
    # rental UI is like zoomcar
    # shop UI is like Amazon
    'offtime':[23, 9],
}

LOGIN_PAGE_IMAGE = '/static/images/ecommerce2.jpeg'
LOGIN_PAGE_LOGO = '/static/images/company_icon.svg'
ICON_LOGO = '/static/images/bni_logo.png'

SHOW_COMMON_APPS = False

LOGIN_URL = 'login' # this can be 'login' or 'account_login'
REGISTER_URL = 'register' # this can be 'register' or 'account_signup'

LOGIN_TEMPLATE = 'login.html'

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.8/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'apfwdssalfeag7)cp4jve5gfb%l8wbn4cyvym(tez^m@z1o#3f'
MOBILE_SECRET_KEY = '1234'

GITOLITE_KEY = '123' # the gitolite server push notification secret key, all git operations are
# computationaly heavy and can be used to overload with git operations. So the server will have
# to pass this key in the HTTP request

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['192.168.1.151','192.168.1.153', 'cioc.co.in', 'localhost', '127.0.0.1', '192.168.1.114', '192.168.0.105' ,'172.20.10.8' , 'skinstore.monomerce.com', '192.168.1.110' , '192.168.1.104', '192.168.43.183','192.168.43.9 ','192.168.1.114','192.168.1.123','192.168.1.123','192.168.1.119','192.168.43.9','sterlingselect.in' , '192.168.0.15', '192.168.1.101','192.168.0.10','192.168.1.111','192.168.1.102','192.168.0.112']


LOGIN_REDIRECT = 'ecommerce' # the url to which the user will be redirected once successfully loggedin
# Options are : ERP , ecommerce , blogs , corporate

LOGOUT_REDIRECT = 'root' # similarly the url to which the user will be directed one logged out

USE_CDN = False # when turned on the application will use the cndjs.com and other similar
#content delivery network for css and jss libraries
# Application definition
BRAND_NAME = 'sterlingselect.com'
SERVICE_NAME = 'Inventory, Sales and Ecommerce'
BRAND_LOGO = '/static/images/bni-2.svg'
BRAND_LOGO_INVERT = '/static/images/mono_icon_inverted.svg'
SMART_REGISTRATION = True
AUTO_ACTIVE_ON_REGISTER = False

SEO_TITLE = 'BNI'
SEO_DESCRIPTION = 'Sterling Select Online Shopping'
SEO_IMG = '/static/images/company_icon.png'
SEO_IMG_WIDTH = 1024
SEO_IMG_HEIGHT = 719

SEO_AUTHOR = 'sterlingselect.com'
SEO_TWITTER_CREATOR = '@sterlingselect'
SEO_TWITTER_SITE = '@sterlingselect'
SEO_SITE_NAME = 'STERLING SELECT'
SEO_URL = 'https://sterlingselect.com/'
SEO_PUBLISHER = 'https://plus.google.com/b/105723801328437605094/'


ECOMMERCE_THEME = '#631516' ##631516
INVENTORY_ENABLED = False

LITE_REGISTRATION = False
AUTH_PASSWORD = 'titan@1'

# FEDEX_AUTH_KEY = 'abOhatnikLWCa8Hj'
# FEDEX_PASSWORD = 'Yk1agUkfxS1P3ABNemVGYJFOB'
# FEDEX_ACCOUNT_NUMBER = '870648022'
# FEDEX_METER_NUMBER = '113921415'

FEDEX_AUTH_KEY = 'TAQDL2KcVX0ijQOQ'
FEDEX_PASSWORD = '7UAEID6HfVBLfmiHnFH4EhRfH'
FEDEX_ACCOUNT_NUMBER = '510087500'
FEDEX_METER_NUMBER = '119097717'
FEDEX_TEST_MODE = True

SMS_API_PREFIX = "http://sms.azmobia.com/http-api.php?username=CIOC&password=cioc567&senderid=CIOCPL&route=1&"

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    'rest_framework',
    'corsheaders',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    'allauth.socialaccount.providers.facebook',
    'bootstrapform',
    'robots',
    'API', # uncategorised REST points
    'ERP', # permissions, overall management of the platform
    'HR', # people aspect of the platform
    'PIM', # personal information manager
    'social', # social networking client
    'homepage', # landing page
    'businessManagement', # BM application
    'ecommerce', # ecommerce
    'blogs', # publically accesible blogging site
	# 'clientRelationships',# CRM like sales force
	'POS',# POS terminal like tally
    'support',# canvas
	'productsInventory',# inventory for POS products
    'paypal.standard.ipn', # payubiz payment integration
    #payu
)


#payu payment gateway settings
PAYU_MERCHANT_KEY = "gtKFFx"
PAYU_MERCHANT_SALT = "eCwWELxi"
# And add the PAYU_MODE to 'TEST' for testing and 'LIVE' for production.
PAYU_MODE = "TEST"
EBS_PAYMENT_MODE = "TEST"

PAYMENT_MODE = 'EBS' # options are EBS , paypal , paytm , PAYU


# paypal payment gateway details
PAYPAL_RECEIVER_EMAIL = 'online@papered.in'
PAYPAL_TEST = True

SITE_ID = 1

ACCOUNT_ADAPTER = 'ERP.views.AccountAdapter'

SOCIALACCOUNT_PROVIDERS = \
        {'google':
            { 'SCOPE': ['profile', 'email'],
            'AUTH_PARAMS': { 'access_type': 'online' } },
        'facebook':
            {'METHOD': 'oauth2',
            'SCOPE': ['email', 'public_profile', 'user_friends'],
            'AUTH_PARAMS': {'auth_type': 'reauthenticate'},
            'FIELDS': [
                'id',
                'email',
                'name',
                'first_name',
                'last_name',
                'verified',
                'locale',
                'timezone',
                'link',
                'gender',
                'updated_time'],
            'EXCHANGE_TOKEN': True,
            'LOCALE_FUNC': lambda request: 'en_US',
            'VERIFIED_EMAIL': False,
            'VERSION': 'v2.4'}
        }

ACCOUNT_USER_MODEL_USERNAME_FIELD = 'email'
ACCOUNT_EMAIL_REQUIRED = False
ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_AUTHENTICATION_METHOD = 'username'
SOCIALACCOUNT_AUTO_SIGNUP = True
SOCIALACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_UNIQUE_EMAIL = False
VERIFY_MOBILE = True

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'API.middleware.simple_middleware',
)

ROOT_URLCONF = 'libreERP.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'HR', 'templates'),
            os.path.join(BASE_DIR, 'libreERP', 'templates'),
            os.path.join(BASE_DIR, 'ecommerce', 'templates'),
            # os.path.join(BASE_DIR, 'clientRelationships', 'templates'),
            os.path.join(BASE_DIR, 'LMS', 'templates'),
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'django.template.context_processors.media',
                'libreERP.settings_context.global_settings',
            ],
        },
    },
]

WSGI_APPLICATION = 'libreERP.wsgi.application'


AUTHENTICATION_BACKENDS = (
    'allauth.account.auth_backends.AuthenticationBackend',
    'django.contrib.auth.backends.ModelBackend',
)


# Database
# https://docs.djangoproject.com/en/1.8/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.mysql',
#         'NAME': 'sterling',
#         'USER': 'root',
#         'PASSWORD': 'cioc',
#         'HOST': '127.0.0.1',   # Or an IP Address that your DB is hosted on
#         'PORT': '3306',
#     }
# }


# AUTH_PROFILE_MODULE = 'HR.userProfile'
# Internationalization
# https://docs.djangoproject.com/en/1.8/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True

EMAIL_HOST_SUFFIX = '24tutors.com'

EMAIL_HOST = 'email.cioc.in'
EMAIL_HOST_USER = 'testmail@cioc.in'
EMAIL_HOST_PASSWORD = 'Titan@1234'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
# EMAIL_BACKEND = 'django.core.mail.backends.console.Sendgrid'


EMAIL_API=True
G_FROM='onlinestore@bni-india.in'
G_KEY='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'
G_ADMIN=["vikas.motla@gmail.com"]



DEFAULT_FROM_EMAIL = 'do_not_reply@24tutors.com'
# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.8/howto/static-files/

STATIC_URL = '/static/'

CORS_ORIGIN_ALLOW_ALL = True

CORS_ALLOW_HEADERS = (
    'x-requested-with',
    'content-type',
    'accept',
    'origin',
    'authorization',
    'X-CSRFToken'
)

CORS_ALLOW_CREDENTIALS = True

STATIC_ROOT = (
    os.path.join(BASE_DIR , 'static_root')
)
STATICFILES_DIRS = (
   os.path.join(BASE_DIR , 'static_shared'),
)
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR , 'media_root')

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': ('rest_framework.permissions.IsAuthenticated',),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.LimitOffsetPagination',
    'DEFAULT_METADATA_CLASS': 'rest_framework.metadata.SimpleMetadata',
    # 'DEFAULT_RENDERER_CLASSES': ('rest_framework.renderers.JSONRenderer',),
}

# WAMP_SERVER = 'pradeepyadav.net'
WAMP_SERVER = 'wamp.cioc.in'

PAYMENT_SUCCESS_REDIRECT ='http://24tutors.com/ERP/#/studentHome?mode=success'

PAYTM_MERCHANT_KEY = "pvB_a%zTlH81EA6p"
PAYTM_MERCHANT_ID = "CIOCFM10126867273379"

if DEBUG:
    PAYTM_MERCHANT_KEY = "pvB_a%zTlH81EA6p"
    PAYTM_MERCHANT_ID = "CIOCFM10126867273379"
    '''
    In sandbox enviornment you can use following wallet credentials to login and make payment.
    Mobile Number : 7777777777
    Password : Paytm12345
    This test wallet is topped-up to a balance of 7000 Rs. every 5 minutes.
    '''


REGISTRATION_EXTRA_FIELD = [
                            {'name':'GST', 'type' : 'text' , 'icon' : 'fa-map-marker' , 'placeholder' : 'GSTIN'},
                            {'name':'Company', 'type' : 'text' , 'icon' : 'fa-building' , 'placeholder' : 'Company Name'},
                            {'name':'Address', 'type' : 'text' , 'icon' : 'fa-building' , 'placeholder' : 'Company Address'},
                            {'name':'pincode', 'type' : 'text' , 'icon' : 'fa-map-marker' , 'placeholder' : 'Pincode'},
                            {'name' : 'designation', 'type' : 'choice', 'option' : ['manager', 'admin', 'director' ], 'icon' : 'fa-id-card-o' , 'placeholder' : 'Please select your role'
                            },
                            {'name' : 'statecode',
                            'type' : 'choice',
                            'option' : ['KA', 'MH', 'AP' , 'AR' , 'AS' , 'BR' , 'CT' , 'GA' , 'GJ' , 'HR' , 'HP' , 'JK' , 'JH' , 'KL' , 'MP' , 'MN' , 'ML' , 'MZ' , 'NL' , 'OR' , 'PB' , 'RJ' , 'SK' , 'TN' , 'TG' , 'TR' , 'UT' , 'UP' , 'WB' , 'AN' , 'CH' , 'DN' , 'DD' , 'DL' , 'LD' , 'PY' , 'TS'] ,
                            'icon' : 'fa-id-card-o' , 'placeholder' : 'Please select your State code'
                            },
                            ]
