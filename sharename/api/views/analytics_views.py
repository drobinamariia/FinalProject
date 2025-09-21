from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from api.models import Audit, ConsentRequest
from api.serializers import RedemptionSerializer, CompanyRedemptionSerializer
from api.services import AuditQueryService, NotificationService
from api.response_serializers import create_success_response, create_error_response
from api.base_views import BaseAPIView


class IndividualRedemptionsView(BaseAPIView, generics.ListAPIView):
    serializer_class = RedemptionSerializer

    def get_queryset(self):
        return AuditQueryService.get_user_redemptions(self.request.user)


class CompanyRedemptionsView(BaseAPIView, generics.ListAPIView):
    serializer_class = CompanyRedemptionSerializer

    def get_queryset(self):
        return AuditQueryService.get_company_redemptions(self.request.user.email)


class CompanyRedemptionDeleteView(BaseAPIView, generics.DestroyAPIView):
    serializer_class = CompanyRedemptionSerializer

    def get_queryset(self):
        return AuditQueryService.get_company_redemptions(
            self.request.user.email,
            include_revoked=False,
            include_archived=False
        )


class RevokeAccessView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        audit_id = request.data.get('audit_id')
        if not audit_id:
            return Response({'error': 'audit_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            audit_record = Audit.objects.select_related('share_code__context').get(
                id=audit_id,
                share_code__context__user=request.user
            )

            audit_record.revoked = True
            audit_record.save()

            ConsentRequest.objects.filter(
                context=audit_record.share_code.context,
                requester__email=audit_record.requester,
                status__in=['pending', 'approved']
            ).update(status='denied')

            NotificationService.create_access_revoked_notification(
                audit_record, audit_record.share_code.context
            )

            return Response({'message': 'Access revoked successfully'}, status=status.HTTP_200_OK)

        except Audit.DoesNotExist:
            return Response(
                {'error': 'Audit record not found or access denied'},
                status=status.HTTP_404_NOT_FOUND
            )