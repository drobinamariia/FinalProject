from rest_framework import generics, permissions
from rest_framework.response import Response

from api.mixins import (
    StandardErrorHandlerMixin, UserOwnedResourceMixin,
    APIResponseMixin, ContextOwnerMixin, AuditAccessMixin
)
from api.response_serializers import StandardizedResponseMixin


class BaseAPIView(StandardErrorHandlerMixin, StandardizedResponseMixin, generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]


class BaseListCreateView(BaseAPIView, generics.ListCreateAPIView):
    pass


class BaseRetrieveUpdateDestroyView(BaseAPIView, generics.RetrieveUpdateDestroyAPIView):
    pass


class UserOwnedListCreateView(UserOwnedResourceMixin, BaseListCreateView):
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


