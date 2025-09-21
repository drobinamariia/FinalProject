
import secrets
import string
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import EmailValidator, URLValidator
from phonenumber_field.modelfields import PhoneNumberField
import phonenumbers

def validate_name_chars(value):
    if value and not all(c.isalpha() or c in " -'" for c in value):
        raise ValidationError('Name can only contain letters, spaces, hyphens, and apostrophes.')

def validate_country_chars(value):
    if value and not all(c.isalpha() or c in ' -' for c in value):
        raise ValidationError('Country can only contain letters, spaces, and hyphens.')

def validate_company_name_chars(value):
    if value and not all(c.isalnum() or c in " -&.',() " for c in value):
        raise ValidationError('Company name contains invalid characters.')

def validate_context_label_chars(value):
    if value and not all(c.isalnum() or c in ' -_' for c in value):
        raise ValidationError('Label can only contain letters, numbers, spaces, hyphens, and underscores.')

ALPHABET = string.ascii_uppercase + string.digits

class Profile(models.Model):
    ROLE_CHOICES = [
        ("individual", "Individual"),
        ("company",    "Company"),
    ]
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    is_public_profile = models.BooleanField(default=False)
    
    first_name = models.CharField(
        max_length=50, 
        blank=True,
        validators=[validate_name_chars]
    )
    last_name = models.CharField(
        max_length=50, 
        blank=True,
        validators=[validate_name_chars]
    )
    date_of_birth = models.DateField(null=True, blank=True)
    phone = models.CharField(
        max_length=20, 
        blank=True
    )
    address = models.TextField(blank=True)
    country = models.CharField(
        max_length=100, 
        blank=True,
        validators=[validate_country_chars]
    )
    bio = models.TextField(max_length=500, blank=True)
    
    company_name = models.CharField(
        max_length=200, 
        blank=True,
        validators=[validate_company_name_chars]
    )
    company_industry = models.CharField(max_length=100, blank=True)
    company_size = models.CharField(max_length=50, blank=True)
    company_founded = models.PositiveIntegerField(
        null=True, 
        blank=True,
    )

    # Validates company founded year to ensure it's within reasonable bounds
    def clean(self):
        super().clean()
        if self.company_founded and (self.company_founded < 1800 or self.company_founded > 2025):
            raise ValidationError({'company_founded': 'Company founded year must be between 1800 and 2025.'})
    company_phone = models.CharField(
        max_length=20, 
        blank=True
    )
    company_address = models.TextField(blank=True)
    company_country = models.CharField(
        max_length=100, 
        blank=True,
        validators=[validate_country_chars]
    )
    company_website = models.URLField(
        blank=True,
        validators=[URLValidator(
            message='Please enter a valid URL (e.g., https://example.com)'
        )]
    )
    company_description = models.TextField(max_length=1000, blank=True)
    
    profile_completed = models.BooleanField(default=False)
    
    # Returns the appropriate display name based on user role (individual name or company name)
    def get_display_name(self):
        if self.role == 'individual':
            return f"{self.first_name} {self.last_name}".strip() or self.user.email
        else:
            return self.company_name or self.user.email

    def __str__(self):
        return f"{self.user.email} - {self.role}"


class CustomUserManager(BaseUserManager):
    # Creates a new user with email as the primary identifier
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    # Creates a superuser with admin privileges
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    username = None
    email = models.EmailField(
        'email address',
        unique=True,
        blank=False,
        null=False,
        validators=[EmailValidator(message='Please enter a valid email address')]
    )

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    # Ensures email is always stored in lowercase for consistency
    def clean(self):
        super().clean()
        if self.email:
            self.email = self.email.lower()

    # Normalizes email to lowercase before saving to database
    def save(self, *args, **kwargs):
        if self.email:
            self.email = self.email.lower()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.email


class Context(models.Model):
    VIS_CHOICES = [
        ("public", "Public"),
        ("code", "Code-protected"),
        ("consent", "Consent-gate"),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    label = models.CharField(
        max_length=40,
        validators=[validate_context_label_chars]
    )
    visibility = models.CharField(max_length=8, choices=VIS_CHOICES)
    given = models.CharField(
        max_length=120,
        validators=[validate_name_chars]
    )
    family = models.CharField(
        max_length=120, 
        blank=True,
        validators=[validate_name_chars]
    )
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    notify_on_redeem = models.BooleanField(default=True)
    auto_archive_expired = models.BooleanField(default=False)
    archived = models.BooleanField(default=False)
    archived_at = models.DateTimeField(null=True, blank=True)
    expiration_processed = models.BooleanField(default=False)

    # Checks if this context has any expired share codes that haven't been processed yet
    def has_expired_codes(self):
        from django.utils import timezone
        return (
            not self.expiration_processed and
            self.sharecode_set.filter(expires_at__lt=timezone.now()).exists()
        )
    
    # Returns all expired but non-revoked codes for this context
    def get_expired_codes(self):
        from django.utils import timezone
        return self.sharecode_set.filter(
            expires_at__lt=timezone.now(),
            revoked=False
        )
    
    # Finds all users who have redeemed codes for this context
    def get_users_with_redemptions(self):
        from django.contrib.auth import get_user_model
        User = get_user_model()

        audits = Audit.objects.filter(share_code__context=self)

        user_ids = []
        for audit in audits:
            if hasattr(audit, 'requester') and audit.requester:
                try:
                    user = User.objects.get(email=audit.requester)
                    user_ids.append(user.id)
                except User.DoesNotExist:
                    continue

        return User.objects.filter(id__in=user_ids).distinct()

    def __str__(self):
        return f"{self.user.email}/{self.label}"


# Generates a random 8-character alphanumeric share code
def generate_code() -> str:
    return "".join(secrets.choice(ALPHABET) for _ in range(8))


class ShareCode(models.Model):
    context = models.ForeignKey(Context, on_delete=models.CASCADE)
    code = models.CharField(max_length=8, default=generate_code, unique=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    revoked = models.BooleanField(default=False)

    # Checks if the share code is still valid (not revoked and not expired)
    def valid(self):
        return (not self.revoked) and (
            self.expires_at is None or self.expires_at > timezone.now()
        )

    def __str__(self):
        return self.code


class Audit(models.Model):
    share_code = models.ForeignKey(ShareCode, on_delete=models.CASCADE)
    requester = models.CharField(max_length=120, default="anon")
    ts = models.DateTimeField(auto_now_add=True)
    revoked = models.BooleanField(default=False)


class ConsentRequest(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("denied", "Denied"),
    ]
    
    context = models.ForeignKey(Context, on_delete=models.CASCADE)
    requester = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")
    message = models.TextField(
        blank=True,
        max_length=500,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('context', 'requester')
    
    def __str__(self):
        return f"{self.requester.email} -> {self.context.label} ({self.status})"


class Notification(models.Model):
    TYPE_CHOICES = [
        ("redemption", "Code Redeemed"),
        ("consent_request", "Consent Requested"),
        ("consent_approved", "Consent Approved"),
        ("consent_denied", "Consent Denied"),
        ("access_revoked", "Access Revoked"),
        ("context_expired", "Context Expired"),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=100)
    message = models.TextField()
    context = models.ForeignKey(Context, on_delete=models.CASCADE, null=True, blank=True)
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.title}"
