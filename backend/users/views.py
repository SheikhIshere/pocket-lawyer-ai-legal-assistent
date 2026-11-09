
"""
users/views.py
"""

# core imports
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import (
    status,
    permissions,
    generics
)
from rest_framework.decorators import authentication_classes, permission_classes
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
# generate otp function
from users.utils import generate_otp
# serializers import
from .serializers import (
    UserListSerializer,
    RegistrationSerializer,
    ResendingOtpSerializer,
    LoginSerializer,
    ActivatingAccountSerializer,
    LoginOtpSerializer,
    ForgetPasswordRequestSerializer,
    PasswordResetVerifyOTPSerializer,
    PasswordResetConfirmSerializer,
    PasswordChangeSerializer,
)
# user model
from .models import Otp
from .tasks import send_otp_email
from django.contrib.auth import get_user_model
User = get_user_model()
# jwt import
from rest_framework_simplejwt.tokens import RefreshToken
# documentation
from secrets import token_urlsafe
from django.core.cache import cache
from drf_spectacular.utils import extend_schema
# timezone import
from django.utils import timezone
# jwt token get and verify
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView
)
# user Profile
from accounts.models import Account, AccountAddress




"""
showing user list
"""
@extend_schema(
    tags=['User-Authentication'], 
    description="Returns all users to admin only."
)
class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserListSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]


"""
registration testing to do otp verification
"""
@extend_schema(
    tags=['User-Authentication'],
    description=
    """it's a registration end point where you will be 
    capturing the user email and move to otp verification section, 
    then you will take otp from /v1/api/user/account/activate/ and i will 
    be verifying the user from backend"""
)
@authentication_classes([])  # Override default authentication
@permission_classes([permissions.AllowAny])  # Explicitly allow any user
class UserRegistrationView(generics.CreateAPIView):
    serializer_class = RegistrationSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # generating account activation otp
            account_activation_otp = generate_otp()
            # assigning into data base
            Otp.objects.create(
                user=user,
                otp=account_activation_otp,
                
            )

            # NOTE: remove this At production
            # sending otp to user asynchronously
            subject = 'Account Activation OTP'
            message = f"Your OTP is: {account_activation_otp}"
            send_otp_email.delay(user.email, subject, message)
            return Response({
                'message': 'Otp sent successfully',
                'user': {
                    'email': user.email,
                },
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


"""
activating account via otp
"""
@extend_schema(
    tags=['User-Authentication'],
    description=
    """
    place your captured email without showing user but let
    user place the otp when it's time to commit gimme both email and otp
    if all good i wil be providing you access and refresh token
    """
)
@authentication_classes([])  # Override default authentication
@permission_classes([permissions.AllowAny])  # Explicitly allow any user
class ActivatingAccountView(generics.CreateAPIView):
    serializer_class = ActivatingAccountSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            validated_user = serializer.save()
            refresh = RefreshToken.for_user(user=validated_user)

            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


"""
resending another otp to activate user
"""
@extend_schema(
    tags=['User-Authentication'],
    description=
    """
    If user demands OTP again, use this endpoint to resend the OTP.
    This endpoint will expire the previous OTP and generate a new one.
    The user must be authenticated to use this endpoint.
    Returns the new OTP for the user.
    """
)
@authentication_classes([])  # Override default authentication
@permission_classes([permissions.AllowAny])  # Explicitly allow any user
class ResendingOtpView(APIView):
    serializer_class = ResendingOtpSerializer
    throttle_scope = 'otp-resend'

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']

            # The FK on Otp.user expects a User instance, not an email string.
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                # Uniform response prevents account enumeration.
                return Response({
                    'message': 'If the email exists, an OTP has been re-sent.',
                }, status=status.HTTP_200_OK)

            # expiring all previous otp
            Otp.objects.filter(user=user).update(is_expired=True)

            # generating account activation otp
            account_activation_otp = generate_otp()
            # assigning into data base
            Otp.objects.create(
                user=user,
                otp=account_activation_otp,
            )

            # sending otp to user asynchronously
            subject = 'Account Activation OTP'
            message = f"Your OTP is: {account_activation_otp}"
            send_otp_email.delay(user.email, subject, message)

            return Response({
                'message': 'Otp re-sent successfully',
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



"""
user login

NOTE: there is bug in the login system, if i provide the correct 
credential and come out of the login flow i will be logged in without
any otp checking ,, this is a huge security concern of mine i will be
seeking help from my mentor and friends of i could make it fix till 
this is till un safe method for production use. Will fix this before 
deployment
"""
@extend_schema(
    tags=['User-Authentication'],
    description=
    """
    This end point will help you to authenticate user.
    You will be taking email and password. If all information are correct,
    capture the user email and i am sending the otp to that email
    take the user to /v1/api/user/login/otp/verify/ end point and
    take otp from them, then gimme i will work with it and give you access
    and refresh token
    """
)
@authentication_classes([])  # Override default authentication
@permission_classes([permissions.AllowAny])  # Explicitly allow any user
class UserLoginView(generics.CreateAPIView):
    serializer_class = LoginSerializer
    throttle_scope = 'login'

    def post(self, request, *args, **kwargs):
        # defining the serializer initialized in serializer_class
        serializer = self.get_serializer(data=request.data)
        # validating serializer
        if serializer.is_valid():
            user = serializer.save()
            account_activation_otp = generate_otp()
            
            # assigning into data base
            Otp.objects.create(
                user=user,
                otp=account_activation_otp,
            )

            # NOTE: remove this
            # sending otp to user asynchronously
            subject = 'OTP Verification'
            message = f"Your OTP is: {account_activation_otp}"
            email = serializer.validated_data['email']
            send_otp_email.delay(email, subject, message)

            return Response({
                'message': 'Otp sent successfully',
                'user': {
                    'email': user.email,
                    'is_verified': user.is_verified
                },
            }, status=status.HTTP_201_CREATED)        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


"""
here i am checking otp founded from login serializer
"""
@extend_schema(
    tags=['User-Authentication'],
    description="Verify OTP for login to gain access and refresh tokens. Provide the OTP sent to your email."
)
@authentication_classes([])  # Override default authentication
@permission_classes([permissions.AllowAny])  # Explicitly allow any user
class LoginOtpCheckView(generics.CreateAPIView):
    serializer_class = LoginOtpSerializer
    throttle_scope = 'otp-verify'

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # Get the user from the serializer validation
        user = User.objects.get(email=request.data.get('email'))
        
        # Ensure user is verified and has Account before creating token
        if not user.is_verified:
            user.is_verified = True
            user.save()
        
        # Create Account if it doesn't exist
        from accounts.models import Account
        Account.objects.get_or_create(
            user=user,
            defaults={"full_name": user.full_name},
        )
        
        # Now create token for verified user
        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        }, status=200)

"""
Forgot password request handling 
"""
@extend_schema(
    tags=['User-Authentication'],
    description="Request password reset OTP"
)
@authentication_classes([])  # Override default authentication
@permission_classes([permissions.AllowAny])  # Explicitly allow any user
class ForgetPasswordRequestView(APIView):
    serializer_class = ForgetPasswordRequestSerializer
    throttle_scope = 'forgot-password'
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            'message': 'Please check your email for password reset otp',         
        }, status=status.HTTP_200_OK)


"""
password reset - verify OTP
"""
@extend_schema(
    tags=['User-Authentication'],
    description="Verify OTP for password reset"
)
@authentication_classes([])  # Override default authentication
@permission_classes([permissions.AllowAny])  # Explicitly allow any user
class PasswordResetVerifyOTPView(generics.CreateAPIView):
    serializer_class = PasswordResetVerifyOTPSerializer
    throttle_scope = 'otp-verify'

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Single-purpose, short-lived reset token (not a login bearer).
            reset_token = token_urlsafe(32)
            cache.set(f"pwdreset:{reset_token}", user.pk, timeout=600)
            return Response({
                'message': 'OTP verified successfully. You can now reset your password.',
                'email': user.email,
                'access_token': reset_token,
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


"""
password resetting
"""
@extend_schema(
    tags=['User-Authentication'],
    description="Reset password using verified OTP"
)
class PasswordResetConfirmView(APIView):
    serializer_class = PasswordResetConfirmSerializer
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        header = request.headers.get('Authorization', '')
        token = header[7:] if header.startswith('Bearer ') else ''
        user_pk = cache.get(f"pwdreset:{token}") if token else None
        if not user_pk:
            return Response(
                {'error': 'Invalid or expired reset token.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = self.serializer_class(
            data=request.data, context={'user_pk': user_pk}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        cache.delete(f"pwdreset:{token}")
        return Response({
            'message': 'Password reset successful. You can now login with your new password.',
        }, status=status.HTTP_200_OK)


"""
setting password via old password
"""
@extend_schema(
    tags=['User-Authentication'],
    description="Change password using old password"
)
class PasswordChangeView(APIView):
    serializer_class = PasswordChangeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'message': 'Password changed successfully.',
        }, status=status.HTTP_200_OK)



"""
Using access refresh token gaining access token
"""
@extend_schema(
    tags=['User-Authentication'],
    description="Refresh access token using refresh token"
)
class TokenRefreshViewCustom(TokenRefreshView):
    pass


"""
verifying token is it working or not
"""
@extend_schema(
    tags=['User-Authentication'],
    description="Verify if the access token is valid"
)
class TokenVerifyViewCustom(TokenVerifyView):
    pass