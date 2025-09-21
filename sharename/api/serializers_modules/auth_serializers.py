from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from api.models import Profile
from api.validators import (
    CommonValidators, email_validator, password_validator
)

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields[self.username_field] = serializers.EmailField()

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        return token


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={'input_type': 'password'}
    )
    role = serializers.ChoiceField(choices=Profile.ROLE_CHOICES)

    def validate_email(self, value):
        return email_validator(value)

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.messages)
        return password_validator(value)

    def create(self, validated_data):
        email = validated_data["email"]
        password = validated_data["password"]
        role = validated_data["role"]

        user = User.objects.create_user(email=email, password=password)
        profile, created = Profile.objects.get_or_create(user=user, defaults={'role': role})
        if not created:
            profile.role = role
            profile.save()
        return user


class MyProfileSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source="profile.role", read_only=True)
    first_name = serializers.CharField(source="profile.first_name", read_only=True)
    last_name = serializers.CharField(source="profile.last_name", read_only=True)
    profile_completed = serializers.BooleanField(source="profile.profile_completed", read_only=True)
    is_public_profile = serializers.BooleanField(source="profile.is_public_profile", read_only=True)

    class Meta:
        model  = User
        fields = ("id", "email", "role", "first_name", "last_name", "profile_completed", "is_public_profile")