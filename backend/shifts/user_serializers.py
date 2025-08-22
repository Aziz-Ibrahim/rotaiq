from rest_framework import serializers
from django.db import IntegrityError

from .models import User, Branch, Invitation


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializes user registration data with an invitation token.

    This serializer validates the provided invitation token and uses it to
    pre-populate user data like email, role, and branch.
    """
    password2 = serializers.CharField(
        style={'input_type': 'password'},
        write_only=True
    )
    invitation_token = serializers.UUIDField(write_only=True)
    
    class Meta:
        """
        Meta options for UserRegistrationSerializer
        """
        model = User
        fields = [
            'invitation_token', 'email', 'password', 'password2',
            'first_name', 'last_name'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'read_only': True}  # The email comes from the invitation
        }
    
    def validate(self, attrs):
        """
        Validates the invitation token and password fields.

        This method verifies that a valid, unused invitation token is provided
        and that the password and confirmation match.
        """
        # 1. Validate the passwords match
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."}
            )
        
        # 2. Validate the invitation token
        try:
            invitation = Invitation.objects.get(
                token=attrs['invitation_token'],
                is_used=False
            )
        except Invitation.DoesNotExist:
            raise serializers.ValidationError(
                {"invitation_token": "Invalid or expired invitation token."}
            )
        
        # Pre-populate email, role, and branch from the invitation
        attrs['email'] = invitation.email
        attrs['role'] = invitation.role
        attrs['branch'] = invitation.branch
        
        return attrs
    
    def create(self, validated_data):
        """
        Creates a new user and marks the invitation as used.
        """
        try:
            # Get the invitation instance from the validated data
            invitation = Invitation.objects.get(
                token=validated_data['invitation_token']
            )
            
            # Create the new user using data from invitation and request
            user = User.objects.create_user(
                email=invitation.email,  # Use email from the invitation
                password=validated_data['password'],
                first_name=validated_data.get('first_name', ''),
                last_name=validated_data.get('last_name', ''),
                role=invitation.role,
                branch=invitation.branch
            )
            
            # Mark the invitation as used
            invitation.is_used = True
            invitation.save()
            
            return user
        except IntegrityError:
            raise serializers.ValidationError(
                {"email": "A user with this email address already exists."}
            )