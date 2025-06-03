from django.core.mail import send_mail
from django.conf import settings


def send_email(recipients, subject, message):
    if not recipients:
        return

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=recipients,
        fail_silently=False,
    )
