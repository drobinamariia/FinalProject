from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from django.core.management import call_command
from django.contrib.auth import get_user_model
from .models import Context, ShareCode, Profile
import threading

User = get_user_model()


def check_expired_contexts_async():
    import sys
    if 'test' in sys.argv or hasattr(sys, '_called_from_test'):
        return

    try:
        call_command('handle_expired_contexts')
    except Exception as e:
        print(f"Error running expired context check: {e}")


@receiver(post_save, sender=ShareCode)
def check_for_expired_contexts_on_sharecode_change(sender, instance, **kwargs):
    if instance.expires_at and instance.expires_at <= timezone.now():
        thread = threading.Thread(target=check_expired_contexts_async)
        thread.daemon = True
        thread.start()


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        if not hasattr(instance, 'profile'):
            Profile.objects.get_or_create(user=instance, defaults={'role': 'individual'})


def startup_expired_context_check():
    thread = threading.Thread(target=check_expired_contexts_async)
    thread.daemon = True
    thread.start()