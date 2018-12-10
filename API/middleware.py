# from django.core.exceptions import PermissionDenied
import re
regex = re.compile('^HTTP_')
apiList = ['api/marketing/schedule','api/marketing/leads','api/marketing/inviteMail']

class simple_middleware(object):
    def process_request(self, request):
        # print request.META.keys(),'itemssssssssssssss'
        try:
            if any(api in request.META['PATH_INFO'] for api in apiList):
                if 'HTTP_X_CSRFTOKEN' not in request.META:
                    request.META['HTTP_X_CSRFTOKEN'] = str(request.META['HTTP_COOKIE']).split(';')[0].split('csrftoken=')[1]
                    print 'updateddddddddddddddddd HTTP_X_CSRFTOKEN '
        except:
            pass

        print dict((regex.sub('', header), value) for (header, value) in request.META.items() if header.startswith('HTTP_'))
        return None
