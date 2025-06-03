from alumni_social_app.models import User, Post, Comment, Reaction, Survey, SurveyAnswer, NotificationGroup, Event
from rest_framework import viewsets, generics, status, parsers, permissions
from alumni_social_app import serializers, perms, paginators
from alumni_social_app.emails import send_email
from django.utils import timezone
from rest_framework.decorators import action
from rest_framework.response import Response


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True).all()
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser, ]

    @action(methods=['get', 'patch'], url_path="current-user", detail=False, permission_classes=[permissions.IsAuthenticated])
    def get_current_user(self, request):
        if request.method.__eq__("PATCH"):
            u = request.user

            for key in request.data:
                if key in ['first_name', 'last_name']:
                    setattr(u, key, request.data[key])
                elif key.__eq__('password'):
                    u.set_password(request.data[key])

            u.save()

            return Response(serializers.UserSerializer(u).data)
        else:
            return Response(serializers.UserSerializer(request.user).data)


class PostViewSet(viewsets.ViewSet, generics.ListCreateAPIView):
    queryset = Post.objects.all().order_by('-created_date')
    serializer_class = serializers.PostSerializer
    pagination_class = paginators.ItemPaginator

    @action(detail=True, methods=['get'], url_path='details')
    def post_details(self, request, pk=None):
        posts = self.get_object()

        return Response(serializers.PostDetailSerializer(posts).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def timeline(self, request):
        user = request.user

        posts = Post.objects.filter(user=user).order_by('-created_date')

        return Response(serializers.PostSerializer(posts, many=True).data, status=status.HTTP_200_OK)

    def get_permissions(self):
        if self.action in ['get_comments', 'reactions'] and self.request.method.__eq__('POST'):
            return [permissions.IsAuthenticated()]

        return [permissions.AllowAny()]

    @action(methods=['get', 'post'], detail=True, url_path='comments')
    def get_comments(self, request, pk):
        if request.method.__eq__('POST'):
            u = serializers.CommentSerializer(data={
                'content': request.data.get('content'),
                'user': request.user.pk,
                'post': pk
            })

            u.is_valid(raise_exception=True)

            c = u.save()

            return Response(serializers.CommentSerializer(c).data, status=status.HTTP_201_CREATED)
        else:
            comments = self.get_object().comment_set.select_related('user').filter(active=True)

            return Response(serializers.CommentSerializer(comments, many=True).data, status=status.HTTP_200_OK)

    @action(methods=['get', 'post'], detail=True, url_path='reactions')
    def reactions(self, request, pk):
        if request.method.__eq__('POST'):
            reaction_choice = request.data.get('reaction_choice')

            if not reaction_choice:
                return Response({'error': 'reaction_choice is required'}, status=status.HTTP_400_BAD_REQUEST)

            rt, created = Reaction.objects.get_or_create(user=request.user, post_id=pk, defaults={
                'reaction_choice': request.data.get('reaction_choice')})

            if not created:
                rt.reaction_choice = request.data.get('reaction_choice')

            rt.save()

            return Response(serializers.ReactionSerializer(rt).data, status=status.HTTP_201_CREATED)
        else:
            reactions = self.get_object().reaction_set.select_related('user').all()

            return Response(serializers.ReactionSerializer(reactions, many=True).data, status=status.HTTP_200_OK)


class CommentViewSet(viewsets.ViewSet, generics.UpdateAPIView, generics.DestroyAPIView):
    queryset = Comment.objects.all()
    serializer_class = serializers.CommentSerializer
    permission_classes = [perms.IsCommentOwner]


class ReactionViewSet(viewsets.ViewSet, generics.UpdateAPIView, generics.DestroyAPIView):
    queryset = Reaction.objects.all()
    serializer_class = serializers.ReactionSerializer


class SurveyViewSet(viewsets.ViewSet, generics.ListCreateAPIView):
    queryset = Survey.objects.all()
    serializer_class = serializers.SurveySerializer
    pagination_class = paginators.ItemPaginator

    @action(methods=['get', 'post'], detail=True, url_path='answers')
    def get_answers(self, request, pk):
        if request.method.__eq__('POST'):
            s = serializers.AnswerSerializer(data={
                'selected_option': request.data.get('selected_option'),
                'submitted_date': timezone.now(),
                'user': request.user.pk,
                'survey': pk
            })

            s.is_valid(raise_exception=True)

            a = s.save()

            return Response(serializers.AnswerSerializer(a).data, status=status.HTTP_201_CREATED)
        else:
            answers = self.get_object().answer_set.select_related('user').all()

            return Response(serializers.AnswerSerializer(answers, many=True).data, status=status.HTTP_200_OK)


class SurveyAnswerViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = SurveyAnswer.objects.all()
    serializer_class = serializers.AnswerSerializer
    pagination_class = paginators.ItemPaginator

    def get_queryset(self):
        surv_id = self.request.query_params.get('survey_id')

        if surv_id:
            return SurveyAnswer.objects.filter(survey_id=surv_id)

        return SurveyAnswer.objects.all()


class NotificationViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.RetrieveUpdateDestroyAPIView):
    queryset = NotificationGroup.objects.all()
    serializer_class = serializers.NotificationSerializer
    pagination_class = paginators.ItemPaginator


class EventViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = serializers.EventSerializer
    pagination_class = paginators.ItemPaginator

    def event_create(self, request, *args, **kwargs):
        evt = serializers.EventSerializer(data=request.data)

        evt.is_valid(raise_exception=True)

        event = evt.save(created_by=request.user)

        emails = []

        if event.send_to_all:
            emails = [user.email for user in User.objects.all() if user.email]
        else:
            for group in event.notification_groups.all():
                emails += [u.email for u in group.members.all() if u.email]

        if emails:
            send_email(
                recipients=emails,
                subject=f"[THÔNG BÁO] {event.title}",
                message=event.messages
            )

        return Response(serializers.EventSerializer(event).data, status=status.HTTP_201_CREATED)
