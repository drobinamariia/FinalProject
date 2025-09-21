from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.db.models import Q

from api.models import Profile
from api.serializers import UserSearchResultSerializer, PublicProfileSerializer
from api.response_serializers import create_success_response, create_error_response


class UserSearchView(generics.ListAPIView):
    serializer_class = UserSearchResultSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        query = self.request.query_params.get('q', '').strip()

        if not query:
            return Profile.objects.none()

        return Profile.objects.filter(
            is_public_profile=True
        ).filter(
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query) |
            Q(user__email__istartswith=query) |
            Q(company_name__icontains=query)
        ).select_related('user')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return create_success_response(serializer.data)


class PublicProfileDetailView(generics.RetrieveAPIView):
    serializer_class = PublicProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'user_id'

    def get_queryset(self):
        return Profile.objects.filter(is_public_profile=True).select_related('user')

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return create_success_response(serializer.data)
        except Profile.DoesNotExist:
            return create_error_response("Profile not found or not public", status_code=404)