from rest_framework import serializers
from api.models import Profile, Context


class UserSearchResultSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source="user.id", read_only=True)
    display_name = serializers.CharField(source="get_display_name", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)

    class Meta:
        model = Profile
        fields = ["id", "email", "display_name", "role", "profile_picture"]


class PublicProfileSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(source="get_display_name", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)
    public_contexts = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ["id", "email", "display_name", "bio", "profile_picture", "role", "public_contexts"]

    def get_public_contexts(self, obj):
        contexts = Context.objects.filter(
            user=obj.user,
            visibility='public',
            archived=False
        )
        return [{"id": ctx.id, "label": ctx.label, "given": ctx.given, "family": ctx.family} for ctx in contexts]