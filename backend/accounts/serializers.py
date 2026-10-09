from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from dj_rest_auth.registration.serializers import RegisterSerializer
from dj_rest_auth.serializers import PasswordResetSerializer
from django.conf import settings
from allauth.account.utils import user_pk_to_url_str

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'phone_number', 'first_name', 'last_name', 'profile_picture')
        read_only_fields = ('role',)

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT serializer that supports login with username or email,
    and includes user data in the response.
    """
    def validate(self, attrs):
        # Allow logging in with either username or email address
        login_id = attrs.get('username', '').strip()
        if '@' in login_id:
            user_by_email = User.objects.filter(email__iexact=login_id).first()
            if user_by_email:
                attrs['username'] = user_by_email.username

        data = super().validate(attrs)

        # Add user data to the response
        user_serializer = UserSerializer(self.user)
        data['user'] = user_serializer.data

        return data

class CustomRegisterSerializer(RegisterSerializer):
    role = serializers.ChoiceField(
        choices=User.Role.choices,
        default=User.Role.USER,
        required=False
    )
    phone_number = serializers.CharField(required=False, allow_blank=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    def validate_role(self, value):
        if value == User.Role.ADMIN:
            raise serializers.ValidationError("You cannot register as an ADMIN via the API.")
        return value

    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        data['role'] = self.validated_data.get('role', User.Role.USER)
        data['phone_number'] = self.validated_data.get('phone_number', '')
        data['first_name'] = self.validated_data.get('first_name', '')
        data['last_name'] = self.validated_data.get('last_name', '')
        return data

    def save(self, request):
        user = super().save(request)
        user.role = self.validated_data.get('role', User.Role.USER)
        user.phone_number = self.validated_data.get('phone_number', '')
        user.first_name = self.validated_data.get('first_name', '')
        user.last_name = self.validated_data.get('last_name', '')
        user.save()
        return user


def frontend_password_reset_url_generator(request, user, temp_key):
    uid = user_pk_to_url_str(user)
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000').rstrip('/')
    return f"{frontend_url}/reset-password/confirm?uid={uid}&token={temp_key}"


class CustomPasswordResetSerializer(PasswordResetSerializer):
    def get_email_options(self):
        return {
            'url_generator': frontend_password_reset_url_generator,
        }

