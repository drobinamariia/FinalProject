
from rest_framework import serializers
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField(default=True)
    message = serializers.CharField(required=False, allow_null=True)
    data = serializers.JSONField(required=False, allow_null=True)
    errors = serializers.JSONField(required=False, allow_null=True)
    timestamp = serializers.DateTimeField(read_only=True)


class PaginatedResponseSerializer(StandardResponseSerializer):
    pagination = serializers.JSONField(required=False, allow_null=True)


class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'success': True,
            'data': data,
            'pagination': {
                'count': self.page.paginator.count,
                'pages': self.page.paginator.num_pages,
                'current_page': self.page.number,
                'page_size': self.page_size,
                'next': self.get_next_link(),
                'previous': self.get_previous_link(),
                'has_next': self.page.has_next(),
                'has_previous': self.page.has_previous()
            },
            'timestamp': self.get_timestamp()
        })

    def get_timestamp(self):
        from django.utils import timezone
        return timezone.now().isoformat()


def create_success_response(data=None, message=None, status_code=200):
    from django.utils import timezone
    from rest_framework.response import Response

    response_data = {
        'success': True,
        'timestamp': timezone.now().isoformat()
    }

    if message:
        response_data['message'] = message

    if data is not None:
        response_data['data'] = data

    return Response(response_data, status=status_code)


def create_error_response(message, errors=None, status_code=400):
    from django.utils import timezone
    from rest_framework.response import Response

    response_data = {
        'success': False,
        'message': message,
        'timestamp': timezone.now().isoformat()
    }

    if errors:
        response_data['errors'] = errors

    return Response(response_data, status=status_code)


def create_validation_error_response(serializer_errors, message="Validation failed"):
    return create_error_response(
        message=message,
        errors=serializer_errors,
        status_code=400
    )


class ListResponseMixin:

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return create_success_response(
            data=serializer.data,
            message=f"Retrieved {len(serializer.data)} items successfully"
        )


class CreateResponseMixin:

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            return create_validation_error_response(serializer.errors)

        try:
            self.perform_create(serializer)
            return create_success_response(
                data=serializer.data,
                message="Created successfully",
                status_code=201
            )
        except Exception as e:
            return create_error_response(
                message="Failed to create resource",
                errors={'detail': str(e)},
                status_code=500
            )


class UpdateResponseMixin:

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)

        if not serializer.is_valid():
            return create_validation_error_response(serializer.errors)

        try:
            self.perform_update(serializer)

            if getattr(instance, '_prefetched_objects_cache', None):
                instance._prefetched_objects_cache = {}

            return create_success_response(
                data=serializer.data,
                message="Updated successfully"
            )
        except Exception as e:
            return create_error_response(
                message="Failed to update resource",
                errors={'detail': str(e)},
                status_code=500
            )

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)


class RetrieveResponseMixin:

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return create_success_response(
                data=serializer.data,
                message="Retrieved successfully"
            )
        except Exception as e:
            return create_error_response(
                message="Resource not found",
                errors={'detail': str(e)},
                status_code=404
            )


class DestroyResponseMixin:

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return create_success_response(
                message="Deleted successfully",
                status_code=204
            )
        except Exception as e:
            return create_error_response(
                message="Failed to delete resource",
                errors={'detail': str(e)},
                status_code=500
            )


class StandardizedResponseMixin(
    ListResponseMixin,
    CreateResponseMixin,
    UpdateResponseMixin,
    RetrieveResponseMixin,
    DestroyResponseMixin
):
    pagination_class = StandardPagination