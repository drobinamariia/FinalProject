from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.core.management import call_command
from django.core.cache import cache
import threading
from datetime import datetime
from django.utils.dateparse import parse_datetime
from django.utils import timezone

from api.models import Context, ShareCode
from api.serializers import ContextSerializer
from api.response_serializers import create_success_response, create_error_response
from api.mixins import ContextOwnerMixin
from api.base_views import BaseListCreateView, BaseRetrieveUpdateDestroyView


# Triggers an asynchronous check for expired contexts to avoid blocking the main thread
def trigger_expiration_check():
    import sys
    if 'test' in sys.argv or hasattr(sys, '_called_from_test'):
        return

    cache_key = 'expiration_check_running'
    if cache.get(cache_key):
        return

    cache.set(cache_key, True, 30)

    def run_check():
        try:
            call_command('handle_expired_contexts')
        except Exception as e:
            print(f"Error running expired context check: {e}")
        finally:
            cache.delete(cache_key)

    thread = threading.Thread(target=run_check)
    thread.daemon = True
    thread.start()


class ContextListCreate(ContextOwnerMixin, BaseListCreateView):
    serializer_class = ContextSerializer

    def get_queryset(self):
        return super().get_queryset().filter(archived=False)

    # Handles context creation and optionally creates an automatic share code
    def perform_create(self, serializer):
        context = serializer.save(user=self.request.user)

        if self.request.data.get('create_share_code') and self.request.data.get('expires_at'):
            self._create_automatic_share_code(context)

    # Creates a share code automatically when a context is created with expiration
    def _create_automatic_share_code(self, context):
        expires_at_str = self.request.data.get('expires_at')

        try:
            expires_at = parse_datetime(expires_at_str)
            if expires_at is None:
                expires_at = datetime.fromisoformat(expires_at_str.replace('Z', '+00:00'))

            ShareCode.objects.create(
                context=context,
                expires_at=expires_at
            )
        except (ValueError, TypeError):
            pass


class ContextRetrieveDestroy(ContextOwnerMixin, BaseRetrieveUpdateDestroyView):
    serializer_class = ContextSerializer

    def get_queryset(self):
        return super().get_queryset().filter(archived=False)


class ArchivedContextListView(ContextOwnerMixin, generics.ListAPIView):
    serializer_class = ContextSerializer

    def get_queryset(self):
        return super().get_queryset().filter(archived=True).order_by('-archived_at')


class ArchivedContextDeleteView(ContextOwnerMixin, generics.DestroyAPIView):
    serializer_class = ContextSerializer

    def get_queryset(self):
        return super().get_queryset().filter(archived=True)


class CheckExpiredContextsView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    # Manually triggers the expiration check process
    def post(self, request):
        trigger_expiration_check()
        return create_success_response({"message": "Expiration check triggered"})

    # Returns a list of contexts that have expired codes for the current user
    def get(self, request):
        user = request.user
        from django.utils import timezone
        now = timezone.now()

        expired_list = []
        user_contexts = Context.objects.filter(
            user=user,
            archived=False
        )

        for context in user_contexts:
            if context.has_expired_codes():
                expired_code = context.sharecode_set.filter(
                    expires_at__lt=now
                ).order_by('-expires_at').first()

                if expired_code:
                    expired_list.append({
                        'id': context.id,
                        'label': context.label,
                        'expires_at': expired_code.expires_at
                    })

        return create_success_response({
            'expired_contexts': expired_list,
            'count': len(expired_list)
        })