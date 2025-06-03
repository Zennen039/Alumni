from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from alumni_social_app.models import User, Post, Comment, Reaction, Survey, SurveyAnswer, Option, NotificationGroup, Event


class UserSerializer(ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)

        data['avatar'] = instance.avatar.url if instance.avatar else ''

        data['cover'] = instance.cover.url if instance.cover else ''

        return data

    class Meta:
        model = User
        fields = ['username', 'password', 'first_name', 'last_name', 'email', 'student_id', 'role', 'avatar', 'cover']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }

    def create(self, validated_data):
        data = validated_data.copy()

        u = User(**data)

        u.set_password(u.password)

        u.is_active = False

        u.save()

        return u


class ItemSerializer(ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)

        data['image'] = instance.image.url if instance.image else ''

        return data


class PostSerializer(ItemSerializer):
    class Meta:
        model = Post
        fields = ['id', 'user', 'content', 'image', 'allow_comments', 'choice', 'created_date', 'updated_date']


class NotificationSerializer(ModelSerializer):
    class Meta:
        model = NotificationGroup
        fields = ['id', 'name', 'members']


class EventSerializer(ModelSerializer):
    user_groups = serializers.StringRelatedField(many=True)
    notification_groups = serializers.StringRelatedField(many=True)

    class Meta:
        model = Event
        fields = ['id', 'title', 'messages', 'created_by', 'created_date', 'send_to_all', 'user_groups',
                  'notification_groups']


class CommentSerializer(ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)

        data['user'] = UserSerializer(instance.user).data

        return data

    class Meta:
        model = Comment
        fields = ['id', 'post', 'user', 'content', 'created_date', 'updated_date']
        extra_kwargs = {
            'post': {
                'write_only': True
            }
        }


class ReactionSerializer(ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)

        data['user'] = UserSerializer(instance.user).data

        return data

    class Meta:
        model = Reaction
        fields = ['id', 'post', 'user', 'reaction_choice', 'created_date']


class PostDetailSerializer(PostSerializer):
    comments = CommentSerializer(many=True, source='comment_set')
    reactions = ReactionSerializer(many=True, source='reaction_set')

    class Meta:
        model = PostSerializer.Meta.model
        fields = PostSerializer.Meta.fields + ['comments', 'reactions']


class SurveySerializer(ModelSerializer):
    class Meta:
        model = Survey
        fields = ['id', 'title', 'description', 'created_by', 'created_date', 'deadline', 'options']


class OptionSerializer(ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'text']


class AnswerSerializer(ModelSerializer):
    class Meta:
        model = SurveyAnswer
        fields = ['id', 'survey', 'user', 'selected_option', 'submitted_date']
