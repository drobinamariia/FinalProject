from rest_framework import generics, permissions
from api.models import Profile
from api.serializers import PersonalDetailsSerializer, CompanyDetailsSerializer
from api.base_views import BaseAPIView


class BaseProfileView(BaseAPIView):
    def get_object(self):
        profile, created = Profile.objects.get_or_create(
            user=self.request.user,
            defaults=self._get_default_profile_data()
        )
        return profile

    def _get_default_profile_data(self):
        return {'role': 'individual'}


class PersonalDetailsView(BaseProfileView, generics.RetrieveUpdateAPIView):
    serializer_class = PersonalDetailsSerializer


class CompanyDetailsView(BaseProfileView, generics.RetrieveUpdateAPIView):
    serializer_class = CompanyDetailsSerializer

    def _get_default_profile_data(self):
        return {'role': 'company'}