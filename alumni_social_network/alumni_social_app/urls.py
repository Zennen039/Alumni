from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register('posts', views.PostViewSet, basename='post')
router.register('users', views.UserViewSet, basename='user')
router.register('comments', views.CommentViewSet, basename='comment')
router.register('reactions', views.ReactionViewSet, basename='reaction')
router.register('surveys', views.SurveyViewSet, basename='survey')
router.register('answers', views.SurveyAnswerViewSet, basename='answer')
router.register('events', views.EventViewSet, basename='event')
router.register('notification_groups', views.NotificationViewSet, basename='notification_group')

urlpatterns = [
    path('', include(router.urls))
]