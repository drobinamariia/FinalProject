
from django.contrib.auth import get_user_model
from .models import Notification, Context


User = get_user_model()


class NotificationService:
    # Creates a notification when someone redeems a share code
    @staticmethod
    def create_redemption_notification(context, requester_email):
        if not context.notify_on_redeem:
            return None

        return Notification.objects.create(
            user=context.user,
            type='redemption',
            title=f'Code Redeemed by {requester_email}',
            message=f'{requester_email} has redeemed your "{context.label}" context.',
            context=context
        )

    # Creates a notification when someone accesses a public context
    @staticmethod
    def create_public_context_notification(context, requester_email):
        if not context.notify_on_redeem:
            return None

        return Notification.objects.create(
            user=context.user,
            type='redemption',
            title=f'Public Context Accessed by {requester_email}',
            message=f'{requester_email} accessed your public "{context.label}" context.',
            context=context
        )

    # Creates a notification when someone requests consent to access a context
    @staticmethod
    def create_consent_request_notification(consent_request):
        return Notification.objects.create(
            user=consent_request.context.user,
            type='consent_request',
            title=f'Consent Request from {consent_request.requester.email}',
            message=f'{consent_request.requester.email} is requesting access to your "{consent_request.context.label}" context.',
            context=consent_request.context
        )

    # Notifies the requester when their consent request is approved
    @staticmethod
    def create_consent_approved_notification(consent_request):
        return Notification.objects.create(
            user=consent_request.requester,
            type='consent_approved',
            title=f'Consent Approved for {consent_request.context.label}',
            message=f'Your request to access "{consent_request.context.label}" has been approved.',
            context=consent_request.context
        )

    # Notifies the requester when their consent request is denied
    @staticmethod
    def create_consent_denied_notification(consent_request):
        return Notification.objects.create(
            user=consent_request.requester,
            type='consent_denied',
            title=f'Consent Denied for {consent_request.context.label}',
            message=f'Your request to access "{consent_request.context.label}" has been denied.',
            context=consent_request.context
        )

    # Notifies a user when their access to a context is revoked
    @staticmethod
    def create_access_revoked_notification(audit, context):
        try:
            company_user = User.objects.get(email=audit.requester)
            return Notification.objects.create(
                user=company_user,
                type='access_revoked',
                title=f'Access Revoked',
                message=f'Your access to "{context.label}" context has been revoked by the owner.',
                context=context
            )
        except User.DoesNotExist:
            return None

    # Notifies the context owner when their context expires and gets archived
    @staticmethod
    def create_context_expired_notification(user, context_label):
        return Notification.objects.create(
            user=user,
            type='context_expired',
            title=f'Context Expired',
            message=f'Your "{context_label}" context has expired and been archived.',
            context=None
        )


class AuditQueryService:

    # Gets all redemptions for contexts owned by a specific user
    @staticmethod
    def get_user_redemptions(user, include_revoked=False, include_archived=False):
        from .models import Audit

        queryset = Audit.objects.filter(
            share_code__context__user=user,
            share_code__revoked=False
        )

        if not include_revoked:
            queryset = queryset.filter(revoked=False)

        if not include_archived:
            queryset = queryset.filter(share_code__context__archived=False)

        return queryset.select_related(
            'share_code',
            'share_code__context'
        ).order_by('-ts')

    # Gets all redemptions made by a specific company user
    @staticmethod
    def get_company_redemptions(user_email, include_revoked=False, include_archived=False):
        from .models import Audit

        queryset = Audit.objects.filter(
            requester=user_email,
            share_code__revoked=False
        )

        if not include_revoked:
            queryset = queryset.filter(revoked=False)

        if not include_archived:
            queryset = queryset.filter(share_code__context__archived=False)

        return queryset.select_related(
            'share_code',
            'share_code__context'
        ).order_by('-ts')


class ShareCodeService:

    # Gets an existing valid share code or creates a new one if none exists
    @staticmethod
    def get_or_create_share_code(context, expires_at=None):
        from .models import ShareCode

        share_code = ShareCode.objects.filter(
            context=context,
            revoked=False
        ).first()

        if share_code and not share_code.valid():
            share_code = None

        if not share_code:
            share_code = ShareCode.objects.create(
                context=context,
                expires_at=expires_at
            )

        return share_code

    # Creates a new share code for a context
    @staticmethod
    def create_share_code(context, expires_at=None):
        from .models import ShareCode
        return ShareCode.objects.create(
            context=context,
            expires_at=expires_at
        )