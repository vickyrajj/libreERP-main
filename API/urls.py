from django.conf.urls import include, url

urlpatterns = [
    url(r'^HR/', include('HR.urls')),
    url(r'^ERP/', include('ERP.urls')),
    url(r'^social/', include('social.urls')),
    url(r'^mail/', include('mail.urls')),
    url(r'^PIM/', include('PIM.urls')),
    url(r'^git/', include('gitweb.urls')),
    url(r'^projects/', include('projects.urls')),
    url(r'^taskBoard/', include('taskBoard.urls')),
    url(r'^virtualWorkforce/', include('virtualWorkforce.urls')),
    url(r'^finance/', include('finance.urls')),
    url(r'^tools/', include('tools.urls')),
    url(r'^clientRelationships/', include('clientRelationships.urls')),
    url(r'^organization/', include('organization.urls')),
    url(r'^recruitment/', include('recruitment.urls')),
    url(r'^payroll/', include('payroll.urls')),
    url(r'^assets/', include('assets.urls')),
    url(r'^performance/', include('performance.urls')),
    url(r'^marketing/', include('marketing.urls')),
    # url(r'^support/', include('support.urls')),
    url(r'^employees/', include('employees.urls')),



]
