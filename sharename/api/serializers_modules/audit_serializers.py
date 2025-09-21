from rest_framework import serializers
from api.models import Audit


class RedemptionSerializer(serializers.ModelSerializer):
    context_label = serializers.CharField(source="share_code.context.label", read_only=True)
    context_given = serializers.CharField(source="share_code.context.given", read_only=True)
    context_family = serializers.CharField(source="share_code.context.family", read_only=True)
    company_name = serializers.CharField(source="requester", read_only=True)
    redeemed_at = serializers.DateTimeField(source="ts", read_only=True)
    expires_at = serializers.SerializerMethodField()
    visibility = serializers.CharField(source="share_code.context.visibility", read_only=True)

    class Meta:
        model = Audit
        fields = ["id", "context_label", "context_given", "context_family", "company_name", "redeemed_at", "expires_at", "visibility"]

    def get_expires_at(self, obj):
        if obj.share_code.expires_at:
            return obj.share_code.expires_at.isoformat()

        from api.models import ShareCode
        context = obj.share_code.context
        recent_share_code = ShareCode.objects.filter(
            context=context,
            expires_at__isnull=False
        ).order_by('-id').first()

        if recent_share_code and recent_share_code.expires_at:
            return recent_share_code.expires_at.isoformat()

        return None


class CompanyRedemptionSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    context = serializers.CharField(source="share_code.context.label", read_only=True)
    redeemed_at = serializers.DateTimeField(source="ts", read_only=True)
    code = serializers.CharField(source="share_code.code", read_only=True)
    expires_at = serializers.SerializerMethodField()
    visibility = serializers.CharField(source="share_code.context.visibility", read_only=True)

    class Meta:
        model = Audit
        fields = ["id", "name", "context", "redeemed_at", "code", "expires_at", "visibility"]

    def get_name(self, obj):
        context = obj.share_code.context
        return f"{context.given} {context.family}".strip()

    def get_expires_at(self, obj):
        if obj.share_code.expires_at:
            return obj.share_code.expires_at.isoformat()

        from api.models import ShareCode
        context = obj.share_code.context
        recent_share_code = ShareCode.objects.filter(
            context=context,
            expires_at__isnull=False
        ).order_by('-id').first()

        if recent_share_code and recent_share_code.expires_at:
            return recent_share_code.expires_at.isoformat()

        return None