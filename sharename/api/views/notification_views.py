from rest_framework import generics
from api.models import Notification
from api.serializers import NotificationSerializer
from api.base_views import BaseAPIView


class NotificationListView(BaseAPIView, generics.ListAPIView):
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')


class NotificationUpdateView(BaseAPIView, generics.UpdateAPIView):
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)