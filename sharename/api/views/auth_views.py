from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from api.models import Profile
from api.serializers import (
    RegisterSerializer, MyProfileSerializer, CustomTokenObtainPairSerializer
)
from api.response_serializers import create_success_response, create_error_response


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    # Handles user login and returns JWT tokens with standardized response format
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            return create_success_response(response.data)
        return create_error_response("Invalid credentials", status_code=401)


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    # Handles user registration and returns JWT tokens for immediate login
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            tokens = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
            return create_success_response(tokens, status_code=201)
        return create_error_response(serializer.errors, status_code=400)


class MyProfileView(generics.RetrieveAPIView):
    serializer_class = MyProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    # Ensures a profile exists for the current user and returns the user object
    def get_object(self):
        Profile.objects.get_or_create(user=self.request.user)
        return self.request.user

    # Returns the current user's profile information
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return create_success_response(serializer.data)