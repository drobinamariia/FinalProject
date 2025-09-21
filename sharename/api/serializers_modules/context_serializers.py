from rest_framework import serializers
from api.models import Context, ShareCode
from api.validators import (
    context_label_validator, first_name_validator, last_name_validator
)


class ContextSerializer(serializers.ModelSerializer):
    share_codes = serializers.SerializerMethodField()
    label = serializers.CharField(max_length=40)
    given = serializers.CharField(max_length=120)
    family = serializers.CharField(required=False, allow_blank=True, max_length=120)

    def validate_label(self, value):
        return context_label_validator(value)

    def validate_given(self, value):
        return first_name_validator(value)

    def validate_family(self, value):
        return last_name_validator(value) if value else value

    class Meta:
        model = Context
        fields = ["id", "label", "visibility", "given", "family", "created_at", "notify_on_redeem", "auto_archive_expired", "archived", "archived_at", "share_codes"]

    def get_share_codes(self, obj):
        share_codes = ShareCode.objects.filter(context=obj, revoked=False).order_by('-id')
        return [{
            'id': sc.id,
            'code': sc.code,
            'expires_at': sc.expires_at.isoformat() if sc.expires_at else None,
            'created_at': sc.id
        } for sc in share_codes]


class ShareCodeSerializer(serializers.ModelSerializer):

    class Meta:
        model = ShareCode
        fields = ["code", "expires_at", "revoked", "context_id"]
        read_only_fields = ["code", "revoked"]