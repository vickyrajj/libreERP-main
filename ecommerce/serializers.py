from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from ecommerce.models import *
from PIM.serializers import *
from HR.serializers import userSearchSerializer
from rest_framework.response import Response
from API.permissions import has_application_permission
from ERP.serializers import serviceLiteSerializer, addressSerializer
from POS.models import Product,Store,StoreQty,ProductVerient
from POS.serializers import ProductSerializer
import json
from HR.models import *
from HR.serializers import *


class fieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = field
        fields = ( 'pk', 'fieldType' , 'unit' ,'name' , 'helpText' , 'default' ,'data')

class RecursiveField(serializers.Serializer):
    def to_representation(self, value):
        serializer = self.parent.parent.__class__(value, context=self.context)
        return serializer.data

class genericProductLiteSerializer(serializers.ModelSerializer):
    parent = RecursiveField(many=False)
    class Meta:
        model = genericProduct
        fields = ('pk' ,  'name' ,  'parent')

class genericProductSerializer(serializers.ModelSerializer):
    fields = fieldSerializer(many = True, read_only = True)
    parent = genericProductLiteSerializer(many = False, read_only = True)
    class Meta:
        model = genericProduct
        fields = ('pk' , 'fields' , 'name' , 'minCost' , 'visual' , 'bannerImage' , 'parent' ,'restricted')
    def create(self , validated_data):
        u = self.context['request'].user
        has_application_permission(u , ['app.ecommerce' , 'app.ecommerce.configure'])
        gp = genericProduct(**validated_data)
        if 'parent' in self.context['request'].data:
            gp.parent = genericProduct.objects.get(pk=int(self.context['request'].data['parent']))

        # try:
        #     gp.visual = self.context['request'].FILES['visual']
        # except:
        #     pass

        gp.save()
        if self.context['request'].data['fields']:
            flds = self.context['request'].data['fields']
            print flds,'aaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
            if isinstance(flds , str) or isinstance(flds , unicode):
                flds = flds.split(',')
            for f in flds:
                gp.fields.add(field.objects.get(pk = f))

            gp.save()
        return gp
    def update(self , instance , validated_data):
        u = self.context['request'].user
        has_application_permission(u , ['app.ecommerce' , 'app.ecommerce.configure'])

        for key in ['name', 'minCost', 'visual', 'bannerImage','restricted']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        if 'parent' in self.context['request'].data:
            instance.parent = genericProduct.objects.get(pk=int(self.context['request'].data['parent']))
        instance.fields.clear()
        instance.save()
        print type(self.context['request'].data['fields']),'aaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
        if self.context['request'].data['fields']:
            print type(self.context['request'].data['fields']),'aaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
            flds = self.context['request'].data['fields']
            if isinstance(flds , str) or isinstance(flds , unicode):
                flds = flds.split(',')
            for f in flds:
                instance.fields.add(field.objects.get(pk = f))
            instance.save()
        return instance


class mediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = media
        fields = ('pk' , 'link' , 'attachment' , 'mediaType','imageIndex')
    def create(self ,  validated_data):
        u = self.context['request'].user
        has_application_permission(u , ['app.ecommerce' , 'app.ecommerce.listings'])
        m = media(**validated_data)
        m.user = u
        m.save()
        return m
    def update(self , instance , validated_data):
        u = self.context['request'].user
        has_application_permission(u , ['app.ecommerce' , 'app.ecommerce.configure'])
        for key in ['link' , 'attachment' , 'mediaType','imageIndex']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        instance.user = u
        instance.save()
        return instance

class StoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Store
        fields = ('pk' ,'created' , 'name' , 'address' , 'pincode' , 'mobile' , 'email')

class StoreQtySerializer(serializers.ModelSerializer):
    store = StoreSerializer(many = False , read_only = True)
    class Meta:
        model = StoreQty
        fields = ('pk' ,'created', 'store' , 'quantity' )

class POSProductSerializer(serializers.ModelSerializer):
    discountedPrice = serializers.SerializerMethodField()
    storeQty=StoreQtySerializer(many=True,read_only=True)
    class Meta:
        model = Product
        fields = ('pk' , 'user' ,'name' , 'price' , 'discount','discountedPrice' ,'serialNo' ,'description','inStock','storeQty','howMuch','unit')
    def get_discountedPrice(self, obj):
        if obj.discount>0:
            # discountedPrice = obj.price - ((obj.discount / obj.price )* 100)
            print obj.discount , obj.price
            discountedPrice =  obj.price - (obj.discount / 100.00 ) *  obj.price
            print 'gggggggggggg',discountedPrice
            return discountedPrice
        else:
            return obj.price

class listingSerializer(serializers.ModelSerializer):
    files = mediaSerializer(many = True , read_only = True)
    product = POSProductSerializer(many = False , read_only = True)
    added_cart = serializers.SerializerMethodField()
    added_saved = serializers.SerializerMethodField()
    in_stock = serializers.SerializerMethodField()
    variantsInStoreQty = serializers.SerializerMethodField()
    product_variants = serializers.SerializerMethodField()
    # parentType = genericProductSerializer(many = False , read_only = True)

    class Meta:
        model = listing
        fields = ('pk' , 'user' , 'product'  , 'approved' ,  'specifications' , 'files' , 'parentType' , 'source','dfs','added_cart','added_saved','in_stock','variantsInStoreQty','product_variants')
        read_only_fields = ('user',)
    def create(self ,  validated_data):
        u = self.context['request'].user
        has_application_permission(u , ['app.ecommerce' , 'app.ecommerce.listings'])
        # print validated_data
        # print self.context['request'].data['parentType'] , self.context['request'].data['product']
        l = listing(**validated_data)
        l.user =  u
        l.parentType = genericProduct.objects.get(pk = self.context['request'].data['parentType'])
        l.product = Product.objects.get(pk = self.context['request'].data['product'])
        l.save()
        if 'files' in self.context['request'].data:
            for m in self.context['request'].data['files']:
                l.files.add(media.objects.get(pk = m))

        for s in json.loads(l.specifications):
            dF = DataField(name = s['name'], value = s['value'] , typ = s['fieldType'] )
            dF.save()
            l.dfs.add(dF)

        l.save()
        return l
    def update(self , instance , validated_data):
        u = self.context['request'].user
        has_application_permission(u , ['app.ecommerce' , 'app.ecommerce.listings'])

        instance.parentType = genericProduct.objects.get(pk = self.context['request'].data['parentType'])
        instance.source = self.context['request'].data['source']
        instance.product = Product.objects.get(pk = self.context['request'].data['product'])
        instance.save()

        if 'specifications' in self.context['request'].data:
            instance.specifications = self.context['request'].data['specifications']
            instance.save()

            for d in instance.dfs.all():
                DataField.objects.get(pk = d.pk).delete()

            instance.dfs.clear()
            print json.loads(instance.specifications)
            for s in json.loads(instance.specifications):
                dF = DataField(name = s['name'], value = s['value'] , typ = s['fieldType'] )
                dF.save()
                instance.dfs.add(dF)

        if 'files' in self.context['request'].data:
            instance.files.clear()
            for m in self.context['request'].data['files']:
                print m,'mmmmmmmmmmmmvvvvvvvvvv'
                # mObj = media.objects.get(pk = m)
                # mObj.id =
                instance.files.add(media.objects.get(pk = m))

        instance.save()
        return instance

    def get_added_cart(self , obj):
        if self.context['request'].user.is_authenticated:
            cart = Cart.objects.filter(product=obj.pk,user=self.context['request'].user,typ='cart',)
            if cart.count()>0:
                return 0
            else:
                return 0
        else:
            return 0

    def get_added_saved(self , obj):
        if self.context['request'].user.is_authenticated:
            return Cart.objects.filter(product=obj.pk,user=self.context['request'].user,typ='favourite').count()
        else:
            return 0

    def get_in_stock(self , obj):
        if obj.product.inStock>0:
            return 'true'
        else:
            return 'false'

    def get_variantsInStoreQty(self , obj):
        try:
            # pvList = list(obj.product.parentProducts.all().values_list('pk',flat=True))
            storeQtyObj = list(StoreQty.objects.filter(product=obj.product).values('quantity','pk','store','productVariant','product'))
            # print storeQtyObj,'***********',obj.product.name
        except:
            storeQtyObj = []
            # print 'errorrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr'
        return storeQtyObj

    def get_product_variants(self , obj):
        prodVar = ProductVerient.objects.filter(parent = obj.product)
        return prodVar.values()


from django.db.models import Avg, Value, CharField

class listingLiteSerializer(serializers.ModelSerializer):
    files = mediaSerializer(many = True , read_only = True)
    product = POSProductSerializer(many = False , read_only = True)
    parentType = genericProductSerializer(many = False , read_only = True)
    rating = serializers.SerializerMethodField()
    rating_count = serializers.SerializerMethodField()
    added_cart = serializers.SerializerMethodField()
    added_saved = serializers.SerializerMethodField()
    in_stock = serializers.SerializerMethodField()
    variantsInStoreQty = serializers.SerializerMethodField()
    product_variants = serializers.SerializerMethodField()
    class Meta:
        model = listing
        fields = ('pk' ,  'approved' ,  'files' , 'parentType'  ,'specifications', 'product','source', 'rating', 'rating_count','added_cart','added_saved','in_stock','product_variants','variantsInStoreQty')
    def get_rating(self , obj):
        return obj.ratings.all().aggregate(Avg('rating'))

    def get_rating_count(self , obj):
        return obj.ratings.all().count()

    def get_added_cart(self , obj):
        if self.context['request'].user.is_authenticated:
            cart = Cart.objects.filter(product=obj.pk,user=self.context['request'].user,typ='cart')
            if cart.count()>0:
                return 0
                # return cart[0].qty
            else:
                return 0
                # return cart.count()
        else:
            return 0

    def get_added_saved(self , obj):
        if self.context['request'].user.is_authenticated:
            return Cart.objects.filter(product=obj.pk,user=self.context['request'].user,typ='favourite').count()
        else:
            return 0

    def get_in_stock(self , obj):
        if obj.product.inStock>0:
            return 'true'
        else:
            return 'false'

    def get_variantsInStoreQty(self , obj):
        try:
            # pvList = list(obj.product.parentProducts.all().values_list('pk',flat=True))
            storeQtyObj = list(StoreQty.objects.filter(product=obj.product).values('quantity','pk','store','productVariant','product'))
            # print storeQtyObj,'***********',obj.product.name
        except:
            storeQtyObj = []
            # print 'errorrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr'
        return storeQtyObj

    def get_product_variants(self , obj):
        prodVar = ProductVerient.objects.filter(parent = obj.product)
        return prodVar.values()





class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ( 'pk', 'created' , 'title' ,'dp' , 'parent')

class PagesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pages
        fields = ( 'pk', 'created' , 'updated' ,'title' , 'pageurl' , 'body' ,'topLevelMenu')

class offerBannerSerializer(serializers.ModelSerializer):
    page = PagesSerializer(many = False , read_only = True)
    class Meta:
        model = offerBanner
        fields = ('pk' , 'user' , 'created'  , 'level' , 'image' ,'imagePortrait' , 'title' , 'subtitle' , 'active' , 'page')
        read_only_fields = ('user',)
    def create(self ,  validated_data):
        u = self.context['request'].user
        b = offerBanner(**validated_data)
        b.user = u
        if 'page' in self.context['request'].data:
            b.page = Pages.objects.get(pk = self.context['request'].data['page'])
        b.save()
        return b
    def update(self ,instance, validated_data):
        for key in ['level' , 'image' ,'imagePortrait' , 'title' , 'subtitle' , 'active']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        if 'page' in self.context['request'].data:
            instance.page = Pages.objects.get(pk = self.context['request'].data['page'])
        instance.save()
        return instance

class CartSerializer(serializers.ModelSerializer):
    product = listingSerializer(many = False , read_only = True)
    prod_howMuch = serializers.SerializerMethodField()
    class Meta:
        model = Cart
        fields = ( 'pk', 'product' , 'user' ,'qty' , 'typ' , 'prodSku', 'prodVarPrice','prod_howMuch','desc')
    def create(self , validated_data):
    	print self.context['request'].data,'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'


    	try:
                print 'try'
    		c=Cart.objects.get(product = self.context['request'].data['product'] , prodSku = self.context['request'].data['prodSku'] ,user=self.context['request'].user)
    		if self.context['request'].data['qty'] > 0:
    			c.typ = self.context['request'].data['typ']
    			c.qty = self.context['request'].data['qty']
    			c.save()
                # return c
    		else:
                    print 'deleteeeeeeeeeeeeeeeeeeee'
                    del c
                    return

    	except:
                print 'except'
       	 	c = Cart(**validated_data)
       	 	c.product = listing.objects.get(pk = self.context['request'].data['product'])
                print self.context['request'].data,'paramsssssss'
                if 'prodSku' in self.context['request'].data:
                    prodVar = ProductVerient.objects.filter(sku = self.context['request'].data['prodSku'])
                    if len(prodVar) > 0:
                        print 'imnideifffffffffffffffffffffffffffffffffffffffffffff'
                        c.prodVarPrice = prodVar[0].discountedPrice
        	c.save()
        return c
    def get_prod_howMuch(self , obj):
        # print
        # prodVar = ProductVerient.objects.filter(parent = obj.product.pk)
        if obj.prodSku is not None:
            prodVar = ProductVerient.objects.filter(sku = obj.prodSku)
            if len(prodVar) > 0:
                return prodVar[0].unitPerpack * obj.product.product.howMuch
            prod = Product.objects.filter(serialNo = obj.prodSku)
            if len(prod) > 0:
                return prod[0].howMuch
        else:
            return None


class ActivitiesSerializer(serializers.ModelSerializer):
    product = listingSerializer(many = False , read_only = True)
    class Meta:
        model = Activities
        fields = ( 'pk','created','product', 'user', 'typ' ,'data')
    def create(self , validated_data):
        a = Activities(**validated_data)
        if 'product' in self.context['request'].data:
            a.product = listing.objects.get(pk = self.context['request'].data['product'])
        a.save()
        return a

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ('pk' ,'user' , 'title' , 'street' , 'city' , 'state' , 'pincode', 'lat' , 'lon', 'country','landMark','mobileNo','primary')
    def create(self , validated_data):
        print '******************'
        a = Address(**validated_data)
        a.user=User.objects.get(pk=self.context['request'].user.pk)
        a.save()
        profObj = profile.objects.get(user = self.context['request'].user)
        if self.context['request'].data['primary']:
            profObj.primaryAddress = a
        profObj.addresses.add(a)
        profObj.save()
        return a
    def update(self ,instance, validated_data):
        for key in ['title' , 'street' , 'city' , 'state' , 'pincode', 'lat' , 'lon', 'country','landMark','mobileNo','primary']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        instance.save()
        profObj = profile.objects.get(user = self.context['request'].user)
        if self.context['request'].data['primary']:
            print 'trueeeeeeeeeee'
            profObj.primaryAddress = instance
        elif profObj.primaryAddress and profObj.primaryAddress.pk == instance.pk:
            profObj.primaryAddress = None
        profObj.save()
        return instance

class TrackingLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrackingLog
        fields = ( 'pk', 'logTxt' , 'time')
    def create(self , validated_data):
        print '******************'
        print self.context['request'].data
        l = TrackingLog(**validated_data)
        l.save()
        if 'qMapPk'in self.context['request'].data:
            qMapObj = OrderQtyMap.objects.get(pk=int(self.context['request'].data['qMapPk']))
            qMapObj.trackingLog.add(l)
        return l

class OrderQtyMapSerializer(serializers.ModelSerializer):
    product = listingSerializer(many = False , read_only = True)
    productName = serializers.SerializerMethodField()
    productPrice = serializers.SerializerMethodField()
    ppAfterDiscount = serializers.SerializerMethodField()
    prodVar = serializers.SerializerMethodField()
    trackingLog = TrackingLogSerializer(many = True , read_only = True)
    class Meta:
        model = OrderQtyMap
        fields = ( 'pk', 'trackingLog' , 'product', 'qty' ,'totalAmount' , 'status' , 'updated' ,'refundAmount' ,'discountAmount' , 'refundStatus' , 'cancellable','courierName','courierAWBNo','notes','productName','productPrice','ppAfterDiscount','prodSku','prodVar','desc')

    def update(self ,instance, validated_data):
        print 'updateeeeeeeeeeeeeeeeeee'
        for key in ['product', 'qty' ,'totalAmount' , 'status' , 'refundAmount' ,'discountAmount' , 'refundStatus' , 'cancellable','courierName','courierAWBNo','notes','desc']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        instance.save()
        if instance.status == 'cancelled' or instance.status == 'returnToOrigin':
            instance.refundAmount = instance.totalAmount - instance.discountAmount
            instance.refundStatus = True
            instance.save()
        return instance

    def get_productName(self, obj):
        return obj.product.product.name
    def get_productPrice(self, obj):
        if obj.prodSku is not None:
            if obj.prodSku == obj.product.product.serialNo:
                price = obj.product.product.price
            else:
                prod = ProductVerient.objects.filter(sku = obj.prodSku)
                if len(prod)>0:
                    price = prod[0].price
                else:
                    price = obj.product.product.price
        else:
            price = obj.product.product.price
        return price
    def get_ppAfterDiscount(self, obj):
        if obj.prodSku is not None:
            if obj.prodSku == obj.product.product.serialNo:
                toReturn = obj.product.product.price - (obj.product.product.price * obj.product.product.discount)/100
            else:
                prod = ProductVerient.objects.filter(sku = obj.prodSku)
                if len(prod)>0:
                    toReturn = prod[0].discountedPrice
                else:
                    toReturn = obj.product.product.price - (obj.product.product.price * obj.product.product.discount)/100
        else:
            toReturn = obj.product.product.price - (obj.product.product.price * obj.product.product.discount)/100
        return toReturn
    def get_prodVar(self, obj):
        if obj.prodSku is not None:
            if obj.prodSku == obj.product.product.serialNo:
                return None
            else:
                return ProductVerient.objects.filter(sku = obj.prodSku).values()
        else:
            return None

# class OrderQtyMapLiteSerializer(serializers.ModelSerializer):
#     productName = serializers.SerializerMethodField()
#     class Meta:
#         model = OrderQtyMap
#         fields = ( 'pk', 'product', 'qty' ,'totalAmount' , 'status','productName')
#     def get_productName(self, obj):
#         return obj.product.product.name

class OrderSerializer(serializers.ModelSerializer):
    orderQtyMap = OrderQtyMapSerializer(many = True , read_only = True)
    promoDiscount = serializers.SerializerMethodField()
    class Meta:
        model = Order
        fields = ( 'pk', 'created' , 'updated', 'totalAmount' ,'orderQtyMap' , 'paymentMode' , 'paymentRefId','paymentChannel', 'modeOfShopping' , 'paidAmount', 'paymentStatus' ,'promoCode' , 'approved' , 'status','landMark', 'street' , 'city', 'state' ,'pincode' , 'country' , 'mobileNo','promoDiscount','billingLandMark','billingStreet','billingCity','billingState','billingPincode','billingCountry','shippingCharges')
        read_only_fields = ('user',)
    def get_promoDiscount(self, obj):
        pD = Promocode.objects.filter(name = obj.promoCode)
        promoDiscount = 0
        for i in pD:
            promoDiscount =  i.discount
        return promoDiscount

class PromocodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promocode
        fields = ( 'pk', 'created' , 'updated', 'name' ,'endDate' , 'discount' , 'validTimes')

class FrequentlyQuestionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = FrequentlyQuestions
        fields = ('pk' ,'created' , 'user' , 'ques' , 'ans')
        read_only_fields = ('user',)
    def create(self , validated_data):
        print '******************'
        f = FrequentlyQuestions(**validated_data)
        f.user=self.context['request'].user
        f.save()
        return f

class RatingSerializer(serializers.ModelSerializer):
    productDetail = listingLiteSerializer(many = False , read_only = True)
    user = userSearchSerializer(many = False , read_only = True)
    class Meta:
        model = Rating
        fields = ( 'pk', 'created' , 'rating', 'textVal' ,'headingVal' , 'productDetail' , 'user')
        read_only_fields = ('user',)
    def create(self , validated_data):
        print validated_data
        a = Rating(**validated_data)
        a.productDetail = listing.objects.get(pk = self.context['request'].data['productDetail'])
        a.user=self.context['request'].user
        a.save()
        return a

class SupportFeedSerializer(serializers.ModelSerializer):
    user = userSearchSerializer(many = False , read_only = True)
    class Meta:
        model = SupportFeed
        fields = ( 'pk', 'created' , 'email', 'mobile' ,'message' , 'user','status' ,'invoiceNo' , 'subject')
        read_only_fields = ('user',)
    def create(self , validated_data):
        print 'hhhhhhhhhhhhhhhhhhhhj',self.context['request'].user
        a = SupportFeed(**validated_data)
        if self.context['request'].user.is_authenticated :
            a.user=User.objects.get(pk = self.context['request'].user.pk)
        a.save()
        print a,'ddddddddddddddd'
        return a


class pincodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pincode
        fields = ('pk' ,  'created' ,  'pincodes')

class genericPincodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = GenericPincode
        fields = ('pk' ,  'state' ,  'city' , 'pincode' , 'pin_status')

class genericImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = GenericImage
        fields = ( 'pk', 'backgroundImage' , 'paymentImage' ,'paymentPortrait' , 'cartImage','searchBgImage','blogPageImage','topBanner','topMobileBanner')
