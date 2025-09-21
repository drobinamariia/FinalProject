from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import Context, Notification, User


class Command(BaseCommand):
    help = 'Handle expired contexts - send notifications and archive/delete as configured'

    def handle(self, *args, **options):
        now = timezone.now()
        processed_count = 0
        

        contexts_with_expired_codes = Context.objects.filter(
            archived=False
        )
        
        for context in contexts_with_expired_codes:
            if context.has_expired_codes():
                self.stdout.write(f"Processing expired context: {context.label} (ID: {context.id})")
                

                self.send_owner_notification(context)
                

                self.send_redeemer_notifications(context)
                

                if context.auto_archive_expired:
                    self.archive_context(context)
                else:
                    self.delete_context(context)


                if not context.auto_archive_expired:

                    pass
                else:

                    context.expiration_processed = True
                    context.save()

                processed_count += 1
        
        if processed_count > 0:
            self.stdout.write(
                self.style.SUCCESS(f'Successfully processed {processed_count} expired contexts')
            )
        else:
            self.stdout.write('No expired contexts found to process')

    def send_owner_notification(self, context):
        """Send notification to context owner about expiration"""
        try:
            Notification.objects.create(
                user=context.user,
                type="context_expired",
                title=f"Context '{context.label}' has expired",
                message=f"Your context '{context.label}' has expired and all associated codes are no longer valid. "
                       f"{'It has been archived.' if context.auto_archive_expired else 'It has been deleted.'}",
                context=context if context.auto_archive_expired else None
            )
            self.stdout.write(f"  [OK] Sent expiration notification to owner: {context.user.username}")
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"  [ERROR] Failed to send notification to owner {context.user.username}: {e}")
            )

    def send_redeemer_notifications(self, context):
        """Send notifications to all users who redeemed codes for this context"""
        redeemers = context.get_users_with_redemptions()
        
        for user in redeemers:

            if user == context.user:
                continue
                
            try:
                Notification.objects.create(
                    user=user,
                    type="context_expired",
                    title=f"Access to '{context.label}' has expired",
                    message=f"The context '{context.label}' you previously accessed has expired. "
                           f"Your access to this information is no longer valid.",
                    context=context if context.auto_archive_expired else None
                )
                self.stdout.write(f"  [OK] Sent expiration notification to redeemer: {user.username}")
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"  [ERROR] Failed to send notification to redeemer {user.username}: {e}")
                )

    def archive_context(self, context):
        """Archive the context instead of deleting it"""
        try:
            context.archived = True
            context.archived_at = timezone.now()
            context.save()
            self.stdout.write(f"  [OK] Archived context: {context.label}")
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"  [ERROR] Failed to archive context {context.label}: {e}")
            )

    def delete_context(self, context):
        """Delete the context entirely"""
        try:
            context_label = context.label
            context.delete()
            self.stdout.write(f"  [OK] Deleted context: {context_label}")
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"  [ERROR] Failed to delete context {context.label}: {e}")
            )