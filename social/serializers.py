from rest_framework import serializers
from .models import *
from django.core.exceptions import *
from django.contrib.auth.models import *

class commentLikeSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = commentLike
        fields = ('url' , 'user' , 'created' )
class postLikeSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = postLike
        fields = ('url' , 'user' , 'created' , 'parent')
    def create(self , validated_data):
        parent = validated_data.pop('parent')
        user =  self.context['request'].user
        if postLike.objects.filter(parent = parent , user = user).exists():
            like = postLike.objects.get(parent = parent , user = user)
        else:
            like = postLike(parent = parent , user = user)
        like.save()
        return like

class postCommentsSerializer(serializers.HyperlinkedModelSerializer):
    likes = commentLikeSerializer(many = True , read_only = True)
    class Meta:
        model = postComment
        fields = ('url' , 'user' , 'parent' , 'created' , 'text' , 'attachment' , 'likes', 'tagged')
        read_only_fields = ('tagged',)
    def create(self , validated_data):
        text = validated_data.pop('text')
        parent = validated_data.pop('parent')
        user =  self.context['request'].user
        comment = postComment(text = text , parent = parent , user = user)
        comment.save()
        f , new = postFollower.objects.get_or_create(user = user , parent = parent )
        if new:
            f.enrollment = 'action'
            f.save()
        return comment
    def update(self, instance, validated_data): # like the comment
        user =  self.context['request'].user
        l = commentLike(user = user , parent = instance)
        l.save()
        return instance

class pictureLikeSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = pictureLike
        fields = ('url' , 'user' , 'created' , 'parent')
    def create(self , validated_data):
        parent = validated_data.pop('parent')
        user =  self.context['request'].user
        if pictureLike.objects.filter(parent = parent , user = user).exists():
            like = pictureLike.objects.get(parent = parent , user = user)
        else:
            like = pictureLike(parent = parent , user = user)
        like.save()
        return like

class pictureCommentsSerializer(serializers.HyperlinkedModelSerializer):
    likes = commentLikeSerializer(many = True , read_only = True)
    class Meta:
        model = pictureComment
        fields = ('url' , 'user' , 'parent' , 'created' , 'text' , 'attachment' , 'likes', 'tagged')
        read_only_fields = ('tagged',)
    def create(self , validated_data):
        text = validated_data.pop('text')
        parent = validated_data.pop('parent')
        user =  self.context['request'].user
        comment = pictureComment(text = text , parent = parent , user = user)
        comment.save()
        f , new = albumFollower.objects.get_or_create(user = user , parent = album.objects.get(photos = parent) )
        if new:
            f.enrollment = 'action'
            f.save()
        return comment
    def update(self, instance, validated_data): # like the comment
        user =  self.context['request'].user
        if commentLike.objects.filter(parent = instance , user = user).exists():
            like = commentLike.objects.get(parent = instance , user = user)
        else:
            like = commentLike(parent = instance , user = user)
        like.save()
        return instance

class postSerializer(serializers.HyperlinkedModelSerializer):
    likes = postLikeSerializer(many = True , read_only = True)
    comments = postCommentsSerializer(many = True , read_only = True)
    class Meta:
        model = post
        fields = ('url' , 'user' , 'created' , 'likes' , 'text' , 'attachment' , 'comments', 'tagged')
        read_only_fields = ('tagged',)

    def create(self ,  validated_data):
        user =  self.context['request'].user
        p = post()
        p.user = user
        p.text = validated_data.pop('text')
        p.attachment = validated_data.pop('attachment')
        p.save()
        tagged = self.context['request'].data['tagged']
        for tag in tagged.split(','):
            p.tagged.add( User.objects.get(username = tag))
        return p
    def update(self, instance, validated_data): # like the comment
        user =  self.context['request'].user
        if instance.user == user:
            instance.text = validated_data.pop('text');
            try:
                instance.attachment = validated_data.pop('attachment')
            except:
                pass
            instance.save()
            tagged = self.context['request'].data['tagged']
            instance.tagged.clear()
            for tag in tagged.split(','):
                instance.tagged.add( User.objects.get(username = tag))
        else:
            raise PermissionDenied(detail=None)
        return instance



class pictureSerializer(serializers.HyperlinkedModelSerializer):
    likes = pictureLikeSerializer(many = True)
    comments = pictureCommentsSerializer(many = True)
    class Meta:
		model = picture
		fields = ('url' , 'user' , 'created' , 'likes' , 'photo' , 'comments' , 'tagged')
		read_only_fields = ('tagged',)
    def create(self ,  validated_data):
        photo = validated_data.pop('photo')
        user =  self.context['request'].user
        pic = picture()
        pic.photo = photo
        pic.user = user
        pic.save()
        tagged = self.context['request'].data['tagged']
        for tag in tagged.split(','):
            pic.tagged.add( User.objects.get(username = tag))
        return pic
def only_numerics(seq):
    return filter(type(seq).isdigit, seq)

class albumSerializer(serializers.HyperlinkedModelSerializer):
    photos = pictureSerializer(many = True , read_only = True)
    class Meta:
        model = album
        fields = ('url' , 'user' , 'created' , 'photos', 'title' , 'tagged')
        read_only_fields = ('tagged',)
    def create(self ,  validated_data):
        photos =  self.context['request'].data['photos']
        user =  self.context['request'].user
        a = album(user = user , title = validated_data.pop('title'))
        a.save()
        tagged = self.context['request'].data['tagged']
        for tag in tagged.split(','):
            if tag=='':
                break
            a.tagged.add( User.objects.get(username = tag))
        count = 0
        for p in photos:
            pk = only_numerics(p)
            pic = picture.objects.get(pk = int(pk) , user = user)
            pic.album = a
            count +=1
            pic.save()
        if count==0: # if there wasn't any photo supplied or the photo does not owned by the sender
            a.delete()
        return a
    def update(self ,instance , validated_data):
        user =  self.context['request'].user
        if instance.user != user:
            raise PermissionDenied(detail=None)
            return instance
        instance.title = validated_data.pop('title')
        instance.tagged.clear()
        instance.save()
        tagged = self.context['request'].data['tagged']
        for tag in tagged.split(','):
            instance.tagged.add( User.objects.get(username = tag))
        existing = picture.objects.filter(album = instance)
        for p in existing:
            p.album = None
            p.save()
        photos =  self.context['request'].data['photos']
        count = 0
        for p in photos:
            pk = only_numerics(p)
            pic = picture.objects.get(pk = int(pk) , user = user)
            pic.album = instance
            count +=1
            pic.save()
        if count==0: # if there wasn't any photo supplied or the photo does not owned by the sender
            instance.delete()
        return instance

class socialSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = social
        fields = ('url' , 'status' , 'aboutMe' , 'coverPic' , 'followers')
        read_only_fields = ('followers',)
    def update(self , instance,  validated_data):
        user =  self.context['request'].user
        if 'friend' in self.context['request'].data:
            toFollow = self.context['request'].data['friend']
            mode = self.context['request'].data['mode']
            u = User.objects.get(username = toFollow)
            if mode == 'follow':
                if u not in instance.followers.all():
                    u.social.followers.add(user)
            else:
                u.social.followers.remove(user)
        else:
            instance.status = validated_data.pop('status')
            instance.aboutMe = validated_data.pop('aboutMe')
            try:
                instance.coverPic = validated_data.pop('coverPic')
            except:
                pass
        return instance
