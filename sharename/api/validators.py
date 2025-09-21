import phonenumbers
import pycountry
from nameparser import HumanName
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import URLValidator
from rest_framework import serializers
from datetime import datetime
from email_validator import validate_email, EmailNotValidError


class CommonValidators:

    @staticmethod
    def validate_phone_number(value, field_name="phone"):
        if not value:
            return value

        try:
            parsed = phonenumbers.parse(value, None)
            if phonenumbers.is_valid_number(parsed):
                return phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
            else:
                raise serializers.ValidationError(f'Invalid {field_name} number format.')
        except (phonenumbers.NumberParseException, Exception):
            valid_chars = all(c.isdigit() or c in ' -()+ ' for c in value)
            if valid_chars and 7 <= len(value) <= 20:
                return value
            else:
                raise serializers.ValidationError(f'{field_name.title()} number format is invalid.')

    @staticmethod
    def validate_name_field(value, field_name="name", min_length=1, max_length=50, use_title_case=True):
        if not value:
            return value

        value = value.strip()

        if len(value) > max_length:
            raise serializers.ValidationError(f'{field_name.title()} must be {max_length} characters or less.')

        if len(value) < min_length:
            raise serializers.ValidationError(f'{field_name.title()} is required.')

        valid_chars = all(c.isalpha() or c in " -'" for c in value)
        if not valid_chars:
            raise serializers.ValidationError(
                f'{field_name.title()} can only contain letters, spaces, hyphens, and apostrophes.'
            )

        if use_title_case:
            try:
                parsed_name = HumanName(value)
                if parsed_name.first:
                    return parsed_name.first.title()
            except:
                pass
            return value.title()

        return value

    @staticmethod
    def validate_country_name(value, field_name="country"):
        if not value:
            return value

        try:
            countries = pycountry.countries.search_fuzzy(value)
            if countries:
                return countries[0].name
        except LookupError:
            pass

        valid_chars = all(c.isalpha() or c in ' -' for c in value)
        if valid_chars and 1 <= len(value) <= 100:
            return value.strip().title()

        raise serializers.ValidationError(f'Please enter a valid {field_name} name.')

    @staticmethod
    def validate_company_name(value, max_length=100):
        if not value:
            return value

        value = value.strip()

        if len(value) > max_length:
            raise serializers.ValidationError(f'Company name must be {max_length} characters or less.')

        if len(value) < 1:
            raise serializers.ValidationError('Company name is required.')

        valid_chars = all(c.isalnum() or c in " -&.',()  " for c in value)
        if not valid_chars:
            raise serializers.ValidationError('Company name contains invalid characters.')

        return value

    @staticmethod
    def validate_website_url(value):
        if not value:
            return value

        if not value.startswith(('http://', 'https://')):
            value = f'https://{value}'

        try:
            url_validator = URLValidator()
            url_validator(value)
            return value
        except DjangoValidationError:
            raise serializers.ValidationError('Please enter a valid website URL.')

    @staticmethod
    def validate_founding_year(value, min_year=1800):
        if value is not None:
            current_year = datetime.now().year
            if value < min_year or value > current_year:
                raise serializers.ValidationError(
                    f'Company founded year must be between {min_year} and {current_year}.'
                )
        return value

    @staticmethod
    def validate_text_field(value, field_name="text", max_length=500, allow_empty=True):
        if not value:
            if not allow_empty:
                raise serializers.ValidationError(f'{field_name.title()} is required.')
            return value

        value = value.strip()

        if len(value) > max_length:
            raise serializers.ValidationError(f'{field_name.title()} must be {max_length} characters or less.')

        return value

    @staticmethod
    def validate_email_field(value):
        if not value:
            return value

        try:
            validated_email = validate_email(value)
            return validated_email.email.lower()
        except EmailNotValidError as e:
            raise serializers.ValidationError(f'Invalid email address: {str(e)}')

    @staticmethod
    def validate_password_strength(value):
        if not value:
            raise serializers.ValidationError('Password is required.')

        errors = []

        if len(value) < 8:
            errors.append('Password must be at least 8 characters long.')

        if not any(c.isupper() for c in value):
            errors.append('Password must contain at least one uppercase letter.')

        if not any(c.islower() for c in value):
            errors.append('Password must contain at least one lowercase letter.')

        if not any(c.isdigit() for c in value):
            errors.append('Password must contain at least one digit.')

        special_chars = '!@#$%^&*(),.?":{}|<>'
        if not any(c in special_chars for c in value):
            errors.append(f'Password must contain at least one special character ({special_chars}).')

        if errors:
            raise serializers.ValidationError(errors)

        return value

    @staticmethod
    def validate_context_label(value, max_length=40):
        if not value:
            raise serializers.ValidationError('Label is required.')

        value = value.strip()

        if len(value) > max_length:
            raise serializers.ValidationError(f'Label must be {max_length} characters or less.')

        if not all(c.isalnum() or c in ' -_' for c in value):
            raise serializers.ValidationError('Label can only contain letters, numbers, spaces, hyphens, and underscores.')

        return value


def phone_validator(value):
    return CommonValidators.validate_phone_number(value, "phone")

def company_phone_validator(value):
    return CommonValidators.validate_phone_number(value, "company phone")

def first_name_validator(value):
    return CommonValidators.validate_name_field(value, "first name")

def last_name_validator(value):
    return CommonValidators.validate_name_field(value, "last name")

def country_validator(value):
    return CommonValidators.validate_country_name(value, "country")

def company_country_validator(value):
    return CommonValidators.validate_country_name(value, "company country")

def company_name_validator(value):
    return CommonValidators.validate_company_name(value)

def website_validator(value):
    return CommonValidators.validate_website_url(value)

def founding_year_validator(value):
    return CommonValidators.validate_founding_year(value)

def email_validator(value):
    return CommonValidators.validate_email_field(value)

def password_validator(value):
    return CommonValidators.validate_password_strength(value)

def context_label_validator(value):
    return CommonValidators.validate_context_label(value)