from rest_framework import serializers
from api.models import ConsentRequest


class ConsentRequestSerializer(serializers.ModelSerializer):
    context_label = serializers.CharField(source="context.label", read_only=True)
    context_owner = serializers.CharField(source="context.user.email", read_only=True)
    requester_name = serializers.CharField(source="requester.email", read_only=True)

    class Meta:
        model = ConsentRequest
        fields = ["id", "context", "context_label", "context_owner", "requester", "requester_name",
                 "status", "message", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at", "context_label", "context_owner", "requester_name"]


class ConsentRequestCreateSerializer(serializers.ModelSerializer):
    message = serializers.CharField(required=False, allow_blank=True, max_length=500)

    class Meta:
        model = ConsentRequest
        fields = ["context", "message"]