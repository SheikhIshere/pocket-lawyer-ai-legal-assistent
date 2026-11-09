"""
users/serializers.py
"""

# core imports
from rest_framework import serializers

# validate password
from django.contrib.auth.password_validation import validate_password

from accounts.models import Account

# user
from .models import User

# Import authenticate to verify email and password
from django.contrib.auth import authenticate

# from model
from .models import Otp

# import timezone
from django.utils import timezone

# atomic db updates
from django.db.models import F

# import timedelta
from datetime import timedelta

# generate otp
from .utils import generate_otp
from .tasks import send_otp_email


"""
User list serializer
"""
class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'is_active',
            'is_verified', 'is_staff', 'is_superuser', 'created_at',
        ]



"""
User registration serializer
"""
class RegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True) 
    full_name = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True) 
    password2 = serializers.CharField(required=True, write_only=True)    

    def validate(self, attrs):
        # checking email
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({
                "error":"Email already exists."
            })
        
        # checking password
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({
                "error":"Passwords do not match."
            })
        validate_password(attrs['password'])
        return attrs
    
    def create(self, validated_data):
        # popping password
        validated_data.pop('password2', None)
        password = validated_data.pop('password')
        # creating user
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        return user


"""
Account activation serializer
"""
class ActivatingAccountSerializer(serializers.Serializer):
    otp = serializers.CharField(required=True)
    email = serializers.CharField(required=True)

    def validate(self, attrs):
        given_otp = attrs.get("otp")
        email = attrs.get("email")
        # Get user from context (set by view) - this is the primary method
        user = User.objects.filter(email=email, is_verified=False).first()
        
        if user is None:
            raise serializers.ValidationError({"error": 'User not found.'})

        # get most recent active otp for the user (so we can increment attempts on wrong input)
        otp_obj = Otp.objects.filter(user=user, is_expired=False).order_by("-created_at").first()
        if not otp_obj:
            raise serializers.ValidationError({"error": "Invalid otp."})

        now = timezone.now()
        if otp_obj.created_at + timezone.timedelta(minutes=5) < now:
            otp_obj.is_expired = True
            otp_obj.save()
            raise serializers.ValidationError({"error": "Otp is expired."})

        # wrong OTP -> increment attempt and possibly expire
        if otp_obj.otp != given_otp:
            otp_obj.attempt += 1
            if otp_obj.attempt >= 3:
                otp_obj.is_expired = True
                # do NOT delete the user here — prefer locking or notifying
            otp_obj.save()
            if otp_obj.is_expired:
                raise serializers.ValidationError({"error": "Otp input reached its limit."})
            raise serializers.ValidationError({"error": "Invalid otp."})

        # correct OTP: save its id so create() can use the same instance (avoid race conditions)
        attrs["_otp_pk"] = otp_obj.pk
        return attrs

    def create(self, validated_data):
        otp_pk = validated_data.pop("_otp_pk", None)

        from django.db import transaction

        # this is for if two user try to activate the same otp
        with transaction.atomic():
            otp = Otp.objects.select_for_update().filter(
                pk=otp_pk,
                is_expired=False
            ).select_related("user").first()

            if not otp:
                raise serializers.ValidationError({"error": "Otp not found or expired."})

            user = otp.user
            if user.is_verified:
                raise serializers.ValidationError({"error": "User already verified."})

            user.is_verified = True
            user.save()

            otp.is_expired = True
            otp.save()

            Otp.objects.filter(user=user, is_expired=False).update(is_expired=True)

            Account.objects.get_or_create(
                user=user,
                defaults={"full_name": user.full_name},
            )
        return user


"""
Resending otp serializer
"""
class ResendingOtpSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    def validate(self, attrs):
        if not User.objects.filter(email=attrs['email']).exists():
            # unknown emails are handled by the view with a uniform response
            return attrs
        return attrs

    def create(self, validated_data):
        return validated_data['email']


"""
Login serializer
"""
class LoginSerializer(serializers.Serializer):
    # global
    _user: User = None

    # fields
    email = serializers.EmailField(required=True) 
    password = serializers.CharField(required=True, write_only=True)    

    def validate(self, attrs):
        # getting email and password value
        email = attrs.get('email')
        password = attrs.get('password')
        
        # checking email and password
        self._user = user = authenticate(
            request=self.context.get('request'),
            email=email,
            password=password
        )
        # what if user not found
        if not user:
            raise serializers.ValidationError({
                "error":"Invalid email or password."
            })
        
        # unverified accounts must not be silently destroyed on login
        if not user.is_verified:
            raise serializers.ValidationError({
                "error":"Account is not verified."
            })

        return attrs
    
    def create(self, validated_data):
        return self._user


class LoginOtpSerializer(serializers.Serializer):
    otp = serializers.CharField(required=True, max_length=6)
    email = serializers.EmailField(required=True)
    
    def validate(self, attrs):
        try:
            user = User.objects.get(email=attrs['email'])
        except User.DoesNotExist:
            raise serializers.ValidationError({"error": "User not found."})
        
        given_otp = attrs['otp']

        otp_obj = (
            Otp.objects
            .filter(user=user, is_expired=False)
            .order_by("-created_at")
            .first()
        )

        if not otp_obj:
            raise serializers.ValidationError({"error": "Invalid OTP."})

        if otp_obj.created_at + timezone.timedelta(minutes=5) < timezone.now():
            Otp.objects.filter(user=user, is_expired=False).update(is_expired=True)
            raise serializers.ValidationError({"error": "OTP is expired."})

        if otp_obj.otp != given_otp:
            # F() update survives the ValidationError (no atomic rollback)
            Otp.objects.filter(pk=otp_obj.pk).update(attempt=F('attempt') + 1)
            otp_obj.refresh_from_db(fields=["attempt"])
            if otp_obj.attempt >= 5:
                Otp.objects.filter(pk=otp_obj.pk).update(is_expired=True)
            raise serializers.ValidationError({"error": "Invalid OTP."})

        # success path
        otp_obj.is_expired = True
        otp_obj.save(update_fields=["is_expired"])

        # Ensure user is verified and has an Account
        if not user.is_verified:
            user.is_verified = True
            user.save()
        
        # Create Account if it doesn't exist
        Account.objects.get_or_create(
            user=user,
            defaults={"full_name": user.full_name},
        )

        return attrs

    def create(self, validated_data):
        return validated_data


"""
Forget password serializer
using this as a forget password request resend email
for password reset
"""
class ForgetPasswordRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    def validate(self, attrs):
        """
        what if i use
        hacker will start doing putting mail 
        address in order to get my admin panel email
        or any sensitive email
        """
        return attrs

    def create(self, validated_data):
        email = validated_data.get('email')
        try:
            user = User.objects.get(email=email)
            reset_otp = generate_otp()
            # disabling previous OTPs for this user
            Otp.objects.filter(user=user, is_expired=False).update(is_expired=True)

            Otp.objects.create(
                user=user,
                otp=reset_otp,
            )

            # for debug only
            print('='*50)
            print('='*50)

            # sending otp throw mail asynchronously
            subject = 'Forget Password OTP'
            message = f"Your OTP for password reset is: {reset_otp}.\nPlease use this OTP to reset your password. This OTP will expire in 5 minutes.\nIf you didn't request this, please ignore this email."
            send_otp_email.delay(email, subject, message)   
        
        except User.DoesNotExist:
            pass

        return validated_data


"""
verifying otp for resetting password
"""
class PasswordResetVerifyOTPSerializer(serializers.Serializer):
    _user: User = None
    _otp: Otp = None

    email = serializers.EmailField(required=True)
    otp = serializers.CharField(required=True)

    def validate(self, attrs):
        given_otp = attrs.get('otp')
        try:
            self._user = user = User.objects.get(email=attrs.get('email'))
        except User.DoesNotExist:
            raise serializers.ValidationError({
                "error":"Invalid otp. or Email not found."
            })

        reset_otp = (
            Otp.objects
            .filter(user=user, is_expired=False)
            .order_by("-created_at")
            .first()
        )
        if not reset_otp:
            raise serializers.ValidationError({"error": "Invalid otp."})

        if reset_otp.created_at + timezone.timedelta(minutes=5) < timezone.now():
            Otp.objects.filter(user=user, is_expired=False).update(is_expired=True)
            raise serializers.ValidationError({"error": "Otp is expired."})

        if reset_otp.otp != given_otp:
            Otp.objects.filter(pk=reset_otp.pk).update(attempt=F('attempt') + 1)
            reset_otp.refresh_from_db(fields=["attempt"])
            if reset_otp.attempt >= 5:
                Otp.objects.filter(pk=reset_otp.pk).update(is_expired=True)
            raise serializers.ValidationError({"error": "Invalid otp."})

        reset_otp.is_expired = True
        reset_otp.save(update_fields=["is_expired"])

        return attrs

    
    def create(self, validated_data):
        return self._user


"""
password reset - verify OTP serializer
"""
class PasswordResetConfirmSerializer(serializers.Serializer):
    """ 
    taking user's new_password and confirm password in order user
    don't remember his/her password    
    """
    _user: User = None
    email = serializers.EmailField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_password = serializers.CharField(required=True) 

    def validate(self, attrs):
        try:
            self._user = user = User.objects.get(pk=self.context.get('user_pk'))
        except User.DoesNotExist:
            raise serializers.ValidationError({"error": "Invalid request."})

        if user.email.lower() != attrs.get('email', '').lower():
            raise serializers.ValidationError({"error": "Invalid request."})

        new_password = attrs.get('new_password')
        confirm_password = attrs.get('confirm_password')
        try:  
            if user.check_password(new_password):
                raise serializers.ValidationError({
                    "error": "New password cannot be the same as the current password."
                })
            
            if new_password != confirm_password:
                raise serializers.ValidationError({
                    "error": "New password and confirm password must match."
                })
            
            validate_password(new_password)

        except User.DoesNotExist:
            raise serializers.ValidationError({
                "error": "Invalid request."
            })
        
        return attrs
    
    def create(self, validated_data):
        # TODO: set user's new given password to their account's password
        self._user.set_password(validated_data.get('new_password'))
        self._user.save()

        return self._user



"""
password Change serializer
"""
class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True)
    confirm_password = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        # getting all of the data that user provided
        request = self.context.get('request')
        user = request.user
        old_password = attrs.get('old_password')
        new_password = attrs.get('new_password')
        confirm_password = attrs.get('confirm_password')
        
        if not user.check_password(old_password):
            raise serializers.ValidationError({
                "error":"Invalid old password."
            })
        
        if old_password == new_password:
            raise serializers.ValidationError({
                "error":"New password cannot be same as old password."
            })
        
        if new_password != confirm_password:
            raise serializers.ValidationError({
                "error":"New password and confirm password must match."
            })
        
        validate_password(new_password)
        
        return attrs

    def create(self, validated_data):
        user = self.context.get('request').user
        user.set_password(validated_data.get('new_password'))
        user.save()

        return user