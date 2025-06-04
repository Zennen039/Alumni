from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractUser
from ckeditor.fields import RichTextField


class User(AbstractUser):
    ROLE_CHOICES = (
        ('alumni', 'Alumni'),
        ('lecturer', 'Lecturer'),
        ('admin', 'Admin'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='alumni')
    student_id = models.CharField(max_length=35)
    avatar = models.ImageField(upload_to='avatars/%Y/%m/')
    cover = models.ImageField(upload_to='covers/%Y/%m/')
    is_verified = models.BooleanField(default=False)
    password_must_change = models.BooleanField(default=False)
    password_created_at = models.DateTimeField(auto_now_add=True)

    def is_password_expired(self):
        if self.role == 'lecturer' and self.password_must_change and self.password_created_at:
            return (timezone.now() - self.password_created_at).total_seconds() > 86400
        return False


class BaseModel(models.Model):
    active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Post(BaseModel):
    POST_CHOICES = [
        ('normal', 'Normal'),
        ('survey', 'Survey'),
        ('announcement', 'Announcement'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255, default=False)
    content = RichTextField()
    choice = models.CharField(max_length=30, choices=POST_CHOICES, default='normal')
    image = models.ImageField(upload_to='app/%Y/%m/')
    allow_comments = models.BooleanField(default=True)

    def __str__(self):
        return f'{self.user.username} - {self.choice} - {self.created_date}'


class NotificationGroup(BaseModel):
    name = models.CharField(max_length=255)
    members = models.ManyToManyField('User')

    def __str__(self):
        return self.name


class Event(BaseModel):
    title = models.CharField(max_length=255)
    messages = RichTextField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='event_created')
    send_to_all = models.BooleanField(default=False)
    user_groups = models.ManyToManyField('User', related_name='member_invited')
    notification_groups = models.ManyToManyField('NotificationGroup')

    def __str__(self):
        return f"Event: {self.title}"


class Survey(BaseModel):
    title = models.CharField(max_length=255)
    description = RichTextField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    deadline = models.DateTimeField()

    def __str__(self):
        return self.title


class Option(BaseModel):
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name='options')
    text = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.survey.title} - {self.text}"


class SurveyAnswer(BaseModel):
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name='answers')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    selected_option = models.ForeignKey(Option, on_delete=models.CASCADE)
    submitted_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('survey', 'user')


class Interaction(BaseModel):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        abstract = True


class Comment(Interaction):
    content = RichTextField()

    def __str__(self):
        return self.content


class Reaction(Interaction):
    REACTION_CHOICES = [
        ('like', 'Like'),
        ('heart', 'Heart'),
        ('haha', 'Haha'),
    ]

    reaction_choice = models.CharField(max_length=50, choices=REACTION_CHOICES)

    class Meta:
        unique_together = ('user', 'post')
