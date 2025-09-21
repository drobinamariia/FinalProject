from rest_framework import status
from rest_framework.response import Response
from django.core.exceptions import ObjectDoesNotExist
import logging

logger = logging.getLogger(__name__)


class StandardErrorHandlerMixin:
    def handle_exception(self, exc):
        import sys
        from rest_framework.exceptions import NotAuthenticated, PermissionDenied, ParseError

        if 'test' in sys.argv and isinstance(exc, (NotAuthenticated, PermissionDenied, ParseError)):
            pass
        else:
            logger.error(
                f"Error in {self.__class__.__name__}: {str(exc)}",
                extra={
                    'view': self.__class__.__name__,
                    'user': getattr(self.request, 'user', None),
                    'method': getattr(self.request, 'method', None),
                    'path': getattr(self.request, 'path', None),
                },
                exc_info=True
            )

        if isinstance(exc, ObjectDoesNotExist):
            return Response(
                {'error': 'The requested resource was not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        return super().handle_exception(exc)


class UserOwnedResourceMixin:
    def get_queryset(self):
        queryset = super().get_queryset()
        if hasattr(self.request, 'user') and self.request.user.is_authenticated:
            if hasattr(queryset.model, 'user'):
                return queryset.filter(user=self.request.user)
            elif hasattr(queryset.model, 'owner'):
                return queryset.filter(owner=self.request.user)
            elif hasattr(queryset.model, 'created_by'):
                return queryset.filter(created_by=self.request.user)
            return queryset
        return queryset.none()


class CacheControlMixin:
    cache_timeout = 300
    cache_private = True

    def dispatch(self, request, *args, **kwargs):
        response = super().dispatch(request, *args, **kwargs)

        if hasattr(response, 'status_code') and response.status_code == 200:
            if self.cache_private:
                response['Cache-Control'] = f'private, max-age={self.cache_timeout}'
            else:
                response['Cache-Control'] = f'public, max-age={self.cache_timeout}'

        return response


class SecurityHeadersMixin:
    def dispatch(self, request, *args, **kwargs):
        response = super().dispatch(request, *args, **kwargs)

        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'

        return response


class APIResponseMixin:
    def success_response(self, data=None, message=None, status_code=status.HTTP_200_OK):
        response_data = {'success': True}

        if message:
            response_data['message'] = message

        if data is not None:
            response_data['data'] = data

        return Response(response_data, status=status_code)

    def error_response(self, message, errors=None, status_code=status.HTTP_400_BAD_REQUEST):
        response_data = {
            'success': False,
            'message': message
        }

        if errors:
            response_data['errors'] = errors

        return Response(response_data, status=status_code)


class ContextOwnerMixin(UserOwnedResourceMixin):
    def get_queryset(self):
        from .models import Context
        if hasattr(self.request, 'user') and self.request.user.is_authenticated:
            return Context.objects.filter(user=self.request.user)
        return Context.objects.none()


class AuditAccessMixin:
    def get_queryset(self):
        from .models import Audit

        if not (hasattr(self.request, 'user') and self.request.user.is_authenticated):
            return Audit.objects.none()

        from django.db import models
        return Audit.objects.filter(
            models.Q(share_code__context__user=self.request.user) |
            models.Q(requester=self.request.user.email)
        )


