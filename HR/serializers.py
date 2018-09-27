
from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
from PIM.serializers import *
import datetime
from django.core.exceptions import ObjectDoesNotExist , SuspiciousOperation

class userProfileLiteSerializer(serializers.ModelSerializer):
    # to be used in the typehead tag search input, only a small set of fields is responded to reduce the bandwidth requirements
    class Meta:
        model = profile
        fields = ('displayPicture' , 'prefix' ,'pk' ,'mobile')

class userSearchSerializer(serializers.ModelSerializer):
    # to be used in the typehead tag search input, only a small set of fields is responded to reduce the bandwidth requirements
    profile = userProfileLiteSerializer(many=False , read_only=True)
    class Meta:
        model = User
        fields = ( 'pk', 'username' , 'first_name' , 'last_name' , 'profile' , 'social' , 'designation' )


class rankSerializer(serializers.ModelSerializer):
    class Meta:
        model = rank
        fields = ( 'title' , 'category' )

class userDesignationSerializer(serializers.ModelSerializer):
    class Meta:
        model = designation
        fields = ('pk' , 'user', 'reportingTo' , 'primaryApprover' , 'secondaryApprover' ,'division' ,'unit' ,'department' ,'role')

        read_only_fields=('user',)
        def create(self , validated_data):

            d = designation()
            d.user=User.objects.get(pk=self.context['request'].user)
            d.reportingTo=User.objects.get(pk=self.context['request'].data['reportingTo'])
            d.primaryApprover=User.objects.get(pk=self.context['request'].data['primaryApprover'])
            d.secondaryApprover=User.objects.get(pk=self.context['request'].data['secondaryApprover'])
            d.save()
            return d

        #  'unitType' , 'domain' , 'rank' , 'unit' , 'department' ,
class userProfileSerializer(serializers.ModelSerializer):
    """ allow all the user """
    class Meta:
        model = profile
        fields = ( 'pk' , 'mobile' , 'displayPicture' , 'website' , 'prefix' , 'almaMater', 'pgUniversity' , 'docUniversity' ,'email')
        read_only_fields = ('website' , 'prefix' , 'almaMater', 'pgUniversity' , 'docUniversity' , )

class userProfileAdminModeSerializer(serializers.ModelSerializer):
    """ Only admin """
    class Meta:
        model = profile
        fields = ( 'pk','empID', 'married', 'dateOfBirth' ,'displayPicture' , 'anivarsary' , 'permanentAddressStreet' , 'permanentAddressCity' , 'permanentAddressPin', 'permanentAddressState' , 'permanentAddressCountry','sameAsLocal',
        'localAddressStreet' , 'localAddressCity' , 'localAddressPin' , 'localAddressState' , 'localAddressCountry', 'prefix', 'gender' , 'email', 'mobile' , 'emergency' , 'website',
        'sign', 'IDPhoto' , 'TNCandBond' , 'resume' ,  'certificates', 'transcripts' , 'otherDocs' , 'almaMater' , 'pgUniversity' , 'docUniversity' , 'fathersName' , 'mothersName' , 'wifesName' , 'childCSV', 'resignation','vehicleRegistration', 'appointmentAcceptance','pan', 'drivingLicense','cheque','passbook',
        'note1' , 'note2' , 'note3', 'bloodGroup')
    def update(self , instance , validated_data):
        u = self.context['request'].user
        if not u.is_staff:
            raise PermissionDenied()

        for key in ['empID','married', 'dateOfBirth' , 'displayPicture' ,'anivarsary' ,'permanentAddressStreet' , 'permanentAddressCity' , 'permanentAddressPin', 'permanentAddressState' , 'permanentAddressCountry','sameAsLocal',
        'localAddressStreet' , 'localAddressCity' , 'localAddressPin' , 'localAddressState' , 'localAddressCountry', 'prefix', 'gender' , 'email', 'mobile' , 'emergency' , 'website',
        'sign', 'IDPhoto' , 'TNCandBond' , 'resume' ,  'certificates', 'transcripts' , 'otherDocs' , 'almaMater' , 'pgUniversity' , 'docUniversity' , 'fathersName' , 'mothersName' , 'wifesName' , 'childCSV', 'resignation','vehicleRegistration', 'appointmentAcceptance','pan', 'drivingLicense','cheque','passbook',
        'note1' , 'note2' , 'note3', 'bloodGroup']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass

        instance.save()
        # instance.user.email = validated_data['email']
        instance.user.save()
        return instance

class payrollSerializer(serializers.ModelSerializer):
    class Meta:
        model = payroll
        fields = ('pk','user','created','updated','hra','special','lta','basic','taxSlab','adHoc','policyNumber','provider','amount','noticePeriodRecovery','al','ml','adHocLeaves','joiningDate','off','accountNumber','ifscCode','bankName','deboarded','lastWorkingDate','alHold','mlHold','adHocLeavesHold','notice','probation','probationNotice')

    def update(self ,instance, validated_data):
        for key in ['hra','special','lta','basic','adHoc','policyNumber','provider','amount','noticePeriodRecovery','al','ml','adHocLeaves','joiningDate','off','accountNumber','ifscCode','bankName','deboarded','lastWorkingDate','alHold','mlHold','adHocLeavesHold','notice','probation','probationNotice']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        instance.save()
        return instance

class payrollLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = payroll
        fields = ('pk','user', 'al','ml','adHocLeaves','joiningDate','off','alHold','mlHold','adHocLeavesHold')

class userSerializer(serializers.ModelSerializer):
    profile = userProfileSerializer(many=False , read_only=True)
    payroll = payrollLiteSerializer(many = False , read_only = True)
    class Meta:
        model = User
        fields = ('pk' , 'username' , 'email' , 'first_name' , 'last_name' , 'designation' ,'profile'  ,'settings' , 'password' , 'social', 'payroll')
        read_only_fields = ('designation' , 'profile' , 'settings' ,'social', 'payroll' )
        extra_kwargs = {'password': {'write_only': True} }
    def create(self , validated_data):
        raise PermissionDenied(detail=None)
    def update (self, instance, validated_data):
        user = self.context['request'].user
        if authenticate(username = user.username , password = self.context['request'].data['oldPassword']) is not None:
            user = User.objects.get(username = user.username)
            user.set_password(validated_data['password'])
            user.save()
        else :
            raise PermissionDenied(detail=None)
        return user

class userAdminSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ('pk','url' , 'username' , 'email' , 'first_name' , 'last_name' , 'is_staff' ,'is_active' )
    def create(self , validated_data):
        if not self.context['request'].user.is_superuser:
            raise PermissionDenied(detail=None)
        user = User.objects.create(**validated_data)
        user.email = user.username + '@cioc.co.in'
        password =  self.context['request'].data['password']
        user.set_password(password)
        user.save()
        return user
    def update (self, instance, validated_data):
        user = self.context['request'].user
        print user,'*******************'
        if user.is_staff or user.is_superuser:
            u = User.objects.get(username = self.context['request'].data['username'])
            if (u.is_staff and user.is_superuser ) or user.is_superuser: # superuser can change password for everyone , staff can change for everyone but not fellow staffs
                if 'password' in self.context['request'].data:
                    u.set_password(self.context['request'].data['password'])
                u.first_name = validated_data['first_name']
                u.last_name = validated_data['last_name']
                u.is_active = validated_data['is_active']
                u.is_staff = validated_data['is_staff']
                u.save()
            else:
                raise PermissionDenied(detail=None)
        try:
            return u
        except:
            raise PermissionDenied(detail=None)

class groupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ('url' , 'name')


class leaveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Leave
        fields = ('pk','created','user','fromDate','toDate','days','approved','category','approvedBy','comment','approvedStage','approvedMatrix','status','leavesCount')
    def create(self , validated_data):
        print 'cameeeeeeeeeeeee'
        print validated_data
        print self.context['request'].data
        print datetime.date.today(),type(datetime.datetime.now())
        print validated_data['fromDate'],type(validated_data['fromDate'])

        if validated_data['fromDate'] < datetime.date.today():
            print 'lessssssssssss'
        elif datetime.date.today().isocalendar()[1] == validated_data['fromDate'].isocalendar()[1]:
            print 'sameeeeeeeeeee'
        elif validated_data['days'] > 15:
            print 'moreeeeeeeeeeee'
        payrollObj = payroll.objects.get(pk=int(self.context['request'].data['payroll']))
        if self.context['request'].data['category'] == 'ML':
            print 'mlllllllllllll',payrollObj.ml
            payrollObj.mlHold = payrollObj.mlHold + int(self.context['request'].data['holdDays'])
            payrollObj.ml = payrollObj.ml - int(self.context['request'].data['holdDays'])
        elif self.context['request'].data['category'] == 'AL':
            payrollObj.alHold = payrollObj.alHold + int(self.context['request'].data['holdDays'])
            payrollObj.al = payrollObj.al - int(self.context['request'].data['holdDays'])
        elif self.context['request'].data['category'] == 'casual':
            # print 'mlllllllllllll',payrollObj.adHocLeaves
            payrollObj.adHocLeavesHold = payrollObj.adHocLeavesHold + int(self.context['request'].data['holdDays'])
            payrollObj.adHocLeaves = payrollObj.adHocLeaves - int(self.context['request'].data['holdDays'])
        payrollObj.save()
        l = Leave(**validated_data)
        l.user = self.context['request'].user
        if validated_data['fromDate'] < datetime.date.today():
            l.approvedMatrix = 2
        elif datetime.date.today().isocalendar()[1] == validated_data['fromDate'].isocalendar()[1]:
            l.approvedMatrix = 2
        elif validated_data['days'] > 15:
            l.approvedMatrix = 2
        l.save()
        return l

    def update(self , instance , validated_data):
        if instance.user.designation in self.context['request'].user.managing.all():
            print 'came'
            print validated_data
            print self.context['request'].data
            instance.approvedStage += 1
            appObj = instance.approvedBy.all()
            instance.approvedBy.clear()
            for i in appObj:
                instance.approvedBy.add(i.user)
            instance.approvedBy.add(self.context['request'].user)
            if instance.approvedStage == instance.approvedMatrix:
                print 'cameeeeeee'
                payrolobj = instance.user.payroll
                if self.context['request'].data['typ'] == 'approve':
                    print 'approveddddd'
                    instance.approved = True
                    instance.status = 'approved'
                    if instance.approved == True:
                        if instance.category == 'AL':
                            payrolobj.alHold = payrolobj.alHold - instance.leavesCount
                        elif instance.category == 'ML':
                            payrolobj.mlHold = payrolobj.mlHold - instance.leavesCount
                        elif instance.category == 'casual':
                            payrolobj.adHocLeavesHold = payrolobj.adHocLeavesHold - instance.leavesCount
                        payrolobj.save()
                elif self.context['request'].data['typ'] == 'reject':
                    instance.status = 'rejected'
                    if instance.category == 'AL':
                        payrolobj.al = payrolobj.al + instance.leavesCount
                        payrolobj.alHold = payrolobj.alHold - instance.leavesCount
                    elif instance.category == 'ML':
                        payrolobj.ml = payrolobj.ml + instance.leavesCount
                        payrolobj.mlHold = payrolobj.mlHold - instance.leavesCount
                    elif instance.category == 'casual':
                        payrolobj.adHocLeaves = payrolobj.adHocLeaves + instance.leavesCount
                        payrolobj.adHocLeavesHold = payrolobj.adHocLeavesHold + instance.leavesCount
                    payrolobj.save()
            instance.save()
            return instance
        else:
            raise SuspiciousOperation('Not Authorized')

class ProfileOrgChartsSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()
    # user = userSerializer(many=False , read_only=True)
    # profile = userProfileSerializer(many=False , read_only=True)
    class Meta:
        model = designation
        fields = ( 'user' , 'reportingTo','profile' )
        read_only_fields = ('profile',)
    def get_profile(self, obj):
        return obj.user.profile.pk

class SMSSerializer(serializers.ModelSerializer):
    class Meta:
        model = SMS
        fields = ('pk', 'created' , 'frm','to','body','dated','user','spam' )
        read_only_fields=('user',)
    def create(self , validated_data):
        d = SMS(**validated_data)
        try:
            user = User.objects.get(profile__mobile__contains = self.context['request'].data['to'])
            d.user=user
        except:
            user = User.objects.get(profile__mobile__contains = self.context['request'].data['frm'])
            d.user=user
        finally:
            pass

        d.save()
        return d


class CallSerializer(serializers.ModelSerializer):
    class Meta:
        model = Call
        fields = ('pk', 'created' ,'dated', 'duration','typ','frmOrTo','user','owner' )
    def create(self , validated_data):
        print self.context['request'].data
        d = Call(**validated_data)
        try:
            user = User.objects.get(profile__mobile__contains = self.context['request'].data['owner'])
            d.user=user
        except:
            pass
        finally:
            pass

        d.save()
        return d

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ('pk', 'created' , 'lat','lon','user','owner' )
    def create(self , validated_data):
        print self.context['request'].data
        d = Location(**validated_data)
        try:
            user = User.objects.get(profile__mobile__contains = self.context['request'].data['owner'])
            d.user=user
        except:
            pass
        finally:
            pass

        d.save()
        return d

class MobileContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = MobileContact
        fields = ('pk', 'name' ,'mobile', 'user','owner' )
    def create(self , validated_data):

        d = MobileContact(**validated_data)

        try:
            user = User.objects.get(profile__mobile__contains = self.context['request'].data['owner'])
            d.user=user
        except:
            pass
        finally:
            pass

        d.save()
        return d
