from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, PermissionDenied
from django.shortcuts import get_object_or_404

from api.models import Context, ShareCode, Audit, ConsentRequest
from api.serializers import ShareCodeSerializer
from api.services import NotificationService, ShareCodeService
from api.response_serializers import create_success_response, create_error_response


class ShareCodeCreate(generics.CreateAPIView):
    serializer_class = ShareCodeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        context_id = request.data.get('context_id')
        if not context_id:
            return create_error_response("Context ID is required", status_code=400)

        context = get_object_or_404(Context, id=context_id, user=request.user)
        share_code = ShareCodeService.create_share_code(context)
        serializer = self.get_serializer(share_code)
        return create_success_response(serializer.data, status_code=201)


class RedeemCode(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, code):
        try:
            share_code = ShareCode.objects.select_related("context").get(code=code)
        except ShareCode.DoesNotExist:
            raise NotFound("Code not found")

        if not share_code.valid():
            raise PermissionDenied("Code expired or revoked")

        context = share_code.context

        if context.visibility == 'consent':
            if not request.user.is_authenticated:
                raise PermissionDenied("Authentication required for consent-gate contexts")

            try:
                ConsentRequest.objects.get(
                    context=context,
                    requester=request.user,
                    status='approved'
                )
            except ConsentRequest.DoesNotExist:
                return create_error_response(
                    message="This context requires consent. You need to request access first.",
                    errors={
                        "requires_consent": True,
                        "context_label": context.label,
                        "owner": context.user.email
                    },
                    status_code=403
                )

        requester_info = request.user.email if request.user.is_authenticated else request.headers.get("X-Client", "anon")
        Audit.objects.create(
            share_code=share_code, requester=requester_info
        )

        if request.user.is_authenticated:
            NotificationService.create_redemption_notification(context, request.user.email)

        return create_success_response(
            data={
                "given": context.given,
                "family": context.family,
                "label": context.label,
                "visibility": context.visibility,
                "expires_at": share_code.expires_at.isoformat() if share_code.expires_at else None
            },
            message="Share code redeemed successfully"
        )


class RedeemByContextIdView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        context_id = request.data.get('context_id')
        if not context_id:
            return create_error_response("Context ID is required", status_code=400)

        context = get_object_or_404(Context, id=context_id)

        if context.visibility == 'consent':
            try:
                ConsentRequest.objects.get(
                    context=context,
                    requester=request.user,
                    status='approved'
                )
            except ConsentRequest.DoesNotExist:
                return create_error_response(
                    "Access denied. Consent required for this context.",
                    status_code=403
                )

        share_code = ShareCodeService.get_or_create_share_code(context)

        Audit.objects.create(
            share_code=share_code,
            requester=request.user.email
        )

        NotificationService.create_redemption_notification(context, request.user.email)

        return create_success_response(
            data={
                "given": context.given,
                "family": context.family,
                "label": context.label,
                "visibility": context.visibility
            },
            message="Context accessed successfully"
        )