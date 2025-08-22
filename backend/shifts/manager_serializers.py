from rest_framework import serializers
from .models import User, Branch

class ManagerRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializes data for a new manager user.

    This serializer is used to create manager accounts directly, without
    an invitation token. It handles password hashing and validation.
    """
    password2 = serializers.CharField(
        style={'input_type': 'password'},
        write_only=True
    )

    class Meta:
        model = User
        fields = [
            'email', 'password', 'password2', 'first_name',
            'last_name', 'branch'
        ]
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, attrs):
        """
        Validates that the password and password confirmation fields match.
        """
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."}
              )
        return attrs

    def create(self, validated_data):
        """
        Creates a new user with the 'manager' role.
        """
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role='manager',
            branch=validated_data.get('branch')
        )
        return user