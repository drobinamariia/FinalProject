from rest_framework import serializers
from api.models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    context_label = serializers.CharField(source="context.label", read_only=True)

    class Meta:
        model = Notification
        fields = ["id", "type", "title", "message", "context", "context_label", "read", "created_at"]