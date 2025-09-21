from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied

from api.models import ConsentRequest, Context, ShareCode, Audit
from api.serializers import ConsentRequestSerializer, ConsentRequestCreateSerializer
from api.services import NotificationService, ShareCodeService
from api.response_serializers import create_success_response, create_error_response
from api.base_views import BaseAPIView


class ConsentRequestListView(BaseAPIView, generics.ListAPIView):
    serializer_class = ConsentRequestSerializer

    def get_queryset(self):
        return ConsentRequest.objects.filter(
            context__user=self.request.user
        ).select_related('context', 'requester').order_by('-created_at')


class ConsentRequestCreateView(BaseAPIView, generics.CreateAPIView):
    serializer_class = ConsentRequestCreateSerializer

    # Handles creating or updating consent requests for protected contexts
    def perform_create(self, serializer):
        context_id = serializer.validated_data['context'].id
        context = get_object_or_404(Context, id=context_id)

        if context.visibility != 'consent':
            raise PermissionDenied("This context does not require consent")

        existing_request = ConsentRequest.objects.filter(
            context=context,
            requester=self.request.user
        ).first()

        if existing_request:
            consent_request = self._handle_existing_request(existing_request, serializer)
        else:
            consent_request = serializer.save(requester=self.request.user)

        NotificationService.create_consent_request_notification(consent_request)
        return consent_request

    # Manages updates to existing consent requests based on current status
    def _handle_existing_request(self, existing_request, serializer):
        if existing_request.status in ['pending', 'approved']:
            raise PermissionDenied("You have already requested access to this context")
        elif existing_request.status == 'denied':
            existing_request.status = 'pending'
            existing_request.message = serializer.validated_data.get('message', '')
            existing_request.save()
            return existing_request
        else:
            raise PermissionDenied("Invalid request status")


class ConsentRequestUpdateView(BaseAPIView, generics.UpdateAPIView):
    serializer_class = ConsentRequestSerializer

    def get_queryset(self):
        return ConsentRequest.objects.filter(context__user=self.request.user).select_related('context', 'requester')

    # Handles consent request approvals and denials with proper notifications
    def perform_update(self, serializer):
        if 'status' in serializer.validated_data:
            new_status = serializer.validated_data['status']
            if new_status not in ['approved', 'denied']:
                raise PermissionDenied("Invalid status")

        consent_request = self.get_object()
        serializer.save()

        if serializer.validated_data.get('status') == 'approved':
            self._handle_approval(consent_request)
        elif serializer.validated_data.get('status') == 'denied':
            self._handle_denial(consent_request)

    # Creates audit entry and sends approval notification when consent is granted
    def _handle_approval(self, consent_request):
        try:
            share_code = ShareCodeService.get_or_create_share_code(
                consent_request.context,
                expires_at=None
            )

            Audit.objects.create(
                share_code=share_code,
                requester=consent_request.requester.email
            )
        except Exception:
            pass

        NotificationService.create_consent_approved_notification(consent_request)

    # Sends denial notification when consent request is rejected
    def _handle_denial(self, consent_request):
        NotificationService.create_consent_denied_notification(consent_request)


class ConsentRequestByCodeView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    # Allows requesting consent by providing a share code directly
    def post(self, request):
        code = request.data.get('code')
        message = request.data.get('message', '')

        if not code:
            return Response({'error': 'Code is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            share_code = ShareCode.objects.select_related('context').get(code=code)
        except ShareCode.DoesNotExist:
            return Response({'error': 'Invalid code'}, status=status.HTTP_404_NOT_FOUND)

        context = share_code.context

        if context.visibility != 'consent':
            return Response(
                {'error': 'This context does not require consent'},
                status=status.HTTP_400_BAD_REQUEST
            )

        existing_request = ConsentRequest.objects.filter(
            context=context, requester=request.user
        ).first()

        if existing_request:
            if existing_request.status in ['pending', 'approved']:
                return Response(
                    {'error': 'You have already requested access to this context'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            elif existing_request.status == 'denied':
                existing_request.status = 'pending'
                existing_request.message = message
                existing_request.save()
                consent_request = existing_request
            else:
                return Response(
                    {'error': 'Invalid request status'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            consent_request = ConsentRequest.objects.create(
                context=context,
                requester=request.user,
                message=message
            )

        NotificationService.create_consent_request_notification(consent_request)

        serializer = ConsentRequestSerializer(consent_request)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CompanyPendingRequestsView(generics.ListAPIView):
    serializer_class = ConsentRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ConsentRequest.objects.filter(
            requester=self.request.user,
            status='pending'
        ).select_related('context').order_by('-created_at')