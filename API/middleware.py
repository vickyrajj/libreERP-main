import re
regex = re.compile('^HTTP_')
from tools.models import ApiAccount
from django.core.exceptions import PermissionDenied

class simple_middleware(object):
    def process_request(self, request):
        # print '*****************reqqqqqqqqqqq*************'
        print dict((regex.sub('', header), value) for (header, value) in request.META.items() if header.startswith('HTTP_'))
        return None

    def process_response(self, request,response):
        # print '*****************resssssssssssssssss*************'
        # print request.GET
        if 'api_key' in request.GET:
            try:
                apikeyVal = request.GET['api_key']
                apiAccountObj = ApiAccount.objects.get(apiKey = apikeyVal)
                apiAccountObj.remaining -= 1
                apiAccountObj.save()
            except:
                # pass
                raise PermissionDenied("Invalid API Account Key")
        return response
