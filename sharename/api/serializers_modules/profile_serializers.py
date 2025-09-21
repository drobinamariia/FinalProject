from rest_framework import serializers
from django.contrib.auth import get_user_model
from api.models import Profile
from api.validators import (
    email_validator, phone_validator, first_name_validator, last_name_validator,
    country_validator, company_name_validator, company_phone_validator,
    company_country_validator, website_validator, founding_year_validator
)

User = get_user_model()


class PersonalDetailsSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(required=False, allow_blank=True, max_length=20)
    first_name = serializers.CharField(required=False, allow_blank=True, max_length=50)
    last_name = serializers.CharField(required=False, allow_blank=True, max_length=50)
    country = serializers.CharField(required=False, allow_blank=True, max_length=100)

    def validate_phone(self, value):
        return phone_validator(value)

    def validate_first_name(self, value):
        return first_name_validator(value)

    def validate_last_name(self, value):
        return last_name_validator(value)

    def validate_country(self, value):
        return country_validator(value)

    def validate_email(self, value):
        return email_validator(value)

    def to_internal_value(self, data):
        if 'is_public_profile' in data:
            if data['is_public_profile'] in ['true', 'True', '1']:
                data = data.copy() if hasattr(data, 'copy') else dict(data)
                data['is_public_profile'] = True
            elif data['is_public_profile'] in ['false', 'False', '0']:
                data = data.copy() if hasattr(data, 'copy') else dict(data)
                data['is_public_profile'] = False

        if 'profile_completed' in data:
            if data['profile_completed'] in ['true', 'True', '1']:
                data = data.copy() if hasattr(data, 'copy') else dict(data)
                data['profile_completed'] = True
            elif data['profile_completed'] in ['false', 'False', '0']:
                data = data.copy() if hasattr(data, 'copy') else dict(data)
                data['profile_completed'] = False

        return super().to_internal_value(data)

    def to_representation(self, instance):
        try:
            data = super().to_representation(instance)
        except Exception as e:
            data = {}
            for field_name in self.Meta.fields:
                try:
                    data[field_name] = getattr(instance, field_name, None)
                except Exception:
                    data[field_name] = None

        data['is_public_profile'] = getattr(instance, 'is_public_profile', False)
        return data

    class Meta:
        model = Profile
        fields = ["first_name", "last_name", "date_of_birth", "phone", "address", "country", "bio", "profile_completed", "profile_picture", "is_public_profile"]


class CompanyDetailsSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(required=False, allow_blank=True, max_length=200)
    company_phone = serializers.CharField(required=False, allow_blank=True, max_length=20)
    company_country = serializers.CharField(required=False, allow_blank=True, max_length=100)
    company_website = serializers.URLField(required=False, allow_blank=True)

    def validate_company_name(self, value):
        return company_name_validator(value)

    def validate_company_phone(self, value):
        return company_phone_validator(value)

    def validate_company_country(self, value):
        return company_country_validator(value)

    def validate_company_website(self, value):
        return website_validator(value)

    def validate_company_founded(self, value):
        return founding_year_validator(value)

    class Meta:
        model = Profile
        fields = ["company_name", "company_industry", "company_size", "company_founded", "company_phone", "company_address", "company_country", "company_website", "company_description", "profile_completed"]


