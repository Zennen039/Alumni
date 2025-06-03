from django.contrib import admin
from django.db.models import Count
from django.db.models.functions import ExtractYear, ExtractQuarter, ExtractMonth
from django.utils.safestring import mark_safe
from alumni_social_app.models import (Post, SurveyAnswer, NotificationGroup, User, Comment, Reaction, Survey, Option, Event)
from django import forms
from ckeditor_uploader.widgets import CKEditorUploadingWidget
from django.template.response import TemplateResponse
from django.urls import path


class PostForm(forms.ModelForm):
    content = forms.CharField(widget=CKEditorUploadingWidget)

    class Meta:
        model = Post
        fields = '__all__'


class PostAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'created_date', 'updated_date', 'allow_comments', 'active']
    list_filter = ['created_date', 'active']
    search_fields = ['content', 'user__username']
    readonly_fields = ['image_view']
    form = PostForm

    def image_view(self, post):
        if post:
            return mark_safe(f"<img src='/static/{post.image.name}' width='200' />")


class CommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'post', 'created_date']
    search_fields = ['content', 'user__username']


class ReactionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'post', 'reaction_choice']
    list_filter = ['reaction_choice']
    search_fields = ['post', 'reaction_choice']


class SurveyAdmin(admin.ModelAdmin):
    list_display = ['title', 'created_by', 'created_date', 'active']
    search_fields = ['title', 'created_by__username']
    list_filter = ['active']
    ordering = ['-created_date']


class OptionAdmin(admin.ModelAdmin):
    list_display = ['id', 'survey', 'text']
    search_fields = ['survey', 'text']


class SurveyAnswerAdmin(admin.ModelAdmin):
    list_display = ['survey', 'user', 'submitted_date']
    search_fields = ['user__username', 'submitted_date']


class NotificationAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'created_date', 'active']
    search_fields = ['name']


class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'messages', 'created_by', 'created_date')
    search_fields = ('title', 'messages')


class MyAdminSite(admin.AdminSite):
    site_header = 'THEPalee Alumni Social Network'

    def get_urls(self):
        return [path('post-stats/', self.post_stats)] + super().get_urls()

    def post_stats(self, request):
        post_stats_by_month = (Post.objects.annotate(year=ExtractYear('created_date'),
                                                     month=ExtractMonth('created_date')).values('year', 'month')
                               .annotate(post_count=Count('id')).order_by('year', 'month'))

        post_stats_by_year = (Post.objects.annotate(year=ExtractYear('created_date')).values('year').annotate(
            post_count=Count('id')).order_by('year'))

        post_stats_by_quarter = (Post.objects.annotate(year=ExtractYear('created_date'),
                                                       quarter=ExtractQuarter('created_date')).values('year', 'quarter')
                                 .annotate(post_count=Count('id')).order_by('year', 'quarter'))

        return TemplateResponse(request, 'admin/post-stats.html', {
            'stats_by_month': post_stats_by_month,
            'stats_by_year': post_stats_by_year,
            'stats_by_quarter': post_stats_by_quarter
        })


admin_site = MyAdminSite(name='THEPalee ASN')

admin_site.register(User)
admin_site.register(Post, PostAdmin)
admin_site.register(Comment, CommentAdmin)
admin_site.register(Reaction, ReactionAdmin)
admin_site.register(Survey, SurveyAdmin)
admin_site.register(Option, OptionAdmin)
admin_site.register(SurveyAnswer, SurveyAnswerAdmin)
admin_site.register(NotificationGroup, NotificationAdmin)
admin_site.register(Event, EventAdmin)
