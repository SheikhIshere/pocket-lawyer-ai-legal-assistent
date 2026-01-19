
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
from django.contrib.auth import get_user_model
User = get_user_model()
# jwt import
from rest_framework_simplejwt.tokens import RefreshToken
# documentation
from drf_spectacular.utils import extend_schema
# timezone import
from django.utils import timezone
# for sent mail
from django.core.mail import send_mail
# importing settings
from django.conf import settings
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
    getting the access token and make the user short time authenticated, 
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
            print('\n\n\n')
            print(f'activation otp is: {account_activation_otp}') # just for debugging
            print('\n\n\n')
            
            
            # sending otp to user
            subject = 'Account Activation OTP'
            message = f"Your OTP is: {account_activation_otp}"
            send_mail(
                subject,
                message,
                settings.EMAIL_HOST_USER,
                [user.email],
                fail_silently=False
            )

            refresh = RefreshToken.for_user(user=user)
            return Response({
                'message': 'Otp sent successfully',
                'user': {
                    'email': user.email,
                },
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors)


"""
activating account via otp
"""
@extend_schema(
    tags=['User-Authentication'],
    description=
    """
    this end point will be the place where you will be taking 
    otp from user and make sure you are authenticating the user 
    using the access token last time you took from registration end point
    """
)
@authentication_classes([])  # Override default authentication
@permission_classes([permissions.AllowAny])  # Explicitly allow any user
class ActivatingAccountView(generics.CreateAPIView):
    serializer_class = ActivatingAccountSerializer

    def post(self, request, *args, **kwargs):
        # Extract user from JWT token manually
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return Response({'error': 'Authorization token required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        token = auth_header.split(' ')[1]
        
        try:
            # Try to decode JWT token to get user ID
            from rest_framework_simplejwt.tokens import AccessToken
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            user = User.objects.get(id=user_id)
        except Exception as e:
            # If JWT fails, try to get user from the most recent OTP
            # This is a fallback approach
            try:
                # Get the most recent unexpired OTP
                latest_otp = Otp.objects.filter(is_expired=False).order_by('-created_at').first()
                if latest_otp:
                    user = latest_otp.user
                else:
                    return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
            except Exception as otp_error:
                return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Add user to serializer context
        serializer = self.get_serializer(data=request.data, context={'user': user})
        if serializer.is_valid():
            validated_user = serializer.save()
            refresh = RefreshToken.for_user(user=validated_user)

            # creating account Profile - only if it doesn't exist
            accounts, created = Account.objects.get_or_create(
                user=validated_user, 
                defaults={'full_name': validated_user.full_name}
            )

            return Response({
                'user': {
                    "user_id": validated_user.id,
                    "accounts_id": accounts.id,
                    "email": validated_user.email,
                    "full_name": accounts.full_name,
                },
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors)


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
class ResendingOtpView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        if user.is_verified:
            return Response({
                'message': 'User is already verified'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # expiring all previous otp
        Otp.objects.filter(user=user).update(is_expired=True)
        
        # generating account activation otp
        account_activation_otp = generate_otp()
        # assigning into data base
        Otp.objects.create(
            user=user, 
            otp=account_activation_otp,            
        )

        # NOTE: remove this
        print('\n\n\n')
        print(f'activation otp is: {account_activation_otp}') # just for debugging
        print('\n\n\n')
        
        # sending otp to user
        subject = 'Account Activation OTP'
        message = f"Your OTP is: {account_activation_otp}"
        send_mail(
            subject,
            message,
            settings.EMAIL_HOST_USER,
            [user.email],
            fail_silently=False
        )

        return Response({
            'user': {
            "user_id": user.id,
            "is_verified": user.is_verified
            },
            'message': 'Otp re-sent successfully',
            }, status=status.HTTP_200_OK)   
        
        return Response(serializer.errors)



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
    I will give you an access token to do OTP verification for that
    take the user to /v1/api/user/login/otp/verify/ end point and
    take otp from them, then gimme i will work with it and give you access
    and refresh token
    """
)
@authentication_classes([])  # Override default authentication
@permission_classes([permissions.AllowAny])  # Explicitly allow any user
class UserLoginView(generics.CreateAPIView):
    serializer_class = LoginSerializer

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
            print('\n\n\n')
            print(f'your otp is: {account_activation_otp}') # just for debugging
            print('\n\n\n')

            # sending otp to user
            subject = 'OTP Verification'
            message = f"Your OTP is: {account_activation_otp}"
            email = serializer.validated_data['email']
            send_mail(
                subject,
                message,
                settings.EMAIL_HOST_USER,
                [email],
                fail_silently=False
            )

            refresh = RefreshToken.for_user(user=user)

            return Response({
                'message': 'Otp sent successfully',
                'user': {
                    'email': user.email,
                    'is_verified': user.is_verified
                },
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors)


"""
here i am checking otp founded from login serializer
"""
@extend_schema(
    tags=['User-Authentication'],
    description="Verify OTP for login to gain access and refresh tokens. Provide the OTP sent to your email."
)
class LoginOtpCheckView(generics.CreateAPIView):
    serializer_class = LoginOtpSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        # return JWT tokens only, no account creation
        refresh = RefreshToken.for_user(request.user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        }, status=200)

"""
resend login otp again
"""
@extend_schema(
    tags=['User-Authentication'],
    description="Resend OTP for login verification."
)
class LoginOtpResendView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    def post(self, request):
        user = request.user
        if not user:
            return Response({'error': 'User not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # expiring other active otp
        Otp.objects.filter(user=user, is_expired=False).update(is_expired=True)

        # creating new otp
        account_activation_otp = generate_otp()
        
        # assigning into data base
        Otp.objects.create(
            user=user,
            otp=account_activation_otp,
        )

        # NOTE: remove this
        print('\n\n\n')
        print(f'your otp is: {account_activation_otp}') # just for debugging
        print('\n\n\n')
        
        # sending otp to user
        subject = 'OTP Login Otp'
        message = f"Your OTP is: {account_activation_otp}"
        email = user.email
        send_mail(
            subject,
            message,
            settings.EMAIL_HOST_USER,
            [email],
            fail_silently=False
        )
        
        return Response({
            'detail': 'login otp sent successfully',
            'user_id': user.id
        }, status=status.HTTP_200_OK)        


"""
Forgot password request handling 
"""
@extend_schema(
    tags=['User-Authentication'],
    description="Request password reset OTP"
)
class ForgetPasswordRequestView(APIView):
    serializer_class = ForgetPasswordRequestSerializer
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

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Generate a token for the next step (optional, can use OTP itself)
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'OTP verified successfully. You can now reset your password.',
                'email': user.email,
                'access_token': str(refresh.access_token),  # For the next step
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
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
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