from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.db import IntegrityError

from .models import User, Branch, Shift, Invitation


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom serializer to use 'email' instead of 'username' for authentication.
    """
    username_field = 'email'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields[self.username_field] = serializers.CharField(
            write_only=True
        )

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['email'] = user.email
        token['role'] = user.role
        token['branch_id'] = user.branch.id if user.branch else None
        
        return token


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for handling user registration via an invitation link.
    """
    token = serializers.UUIDField(write_only=True)
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ['token', 'first_name', 'last_name', 'password']
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def validate(self, data):
        """
        Validates the invitation token and ensures it's not used.
        """
        token = data.get('token')
        try:
            invitation = Invitation.objects.get(token=token, is_used=False)
        except Invitation.DoesNotExist:
            raise serializers.ValidationError(
                {"detail": "Invalid or expired invitation link."}
            )

        # Inject invitation data into validated data
        data['email'] = invitation.email
        data['role'] = invitation.role
        data['branch'] = invitation.branch
        data['invitation'] = invitation
        return data

    def create(self, validated_data):
        """
        Creates a new user and marks the invitation as used.
        """
        invitation = validated_data.pop('invitation')
        
        try:
            # Attempt to create the user with the validated data
            user = User.objects.create_user(
                email=validated_data['email'],
                password=validated_data['password'],
                first_name=validated_data['first_name'],
                last_name=validated_data['last_name'],
                role=validated_data['role'],
                branch=validated_data['branch']
            )
            # Mark the invitation as used only if user creation is successful
            invitation.is_used = True
            invitation.save()
            return user
        
        except IntegrityError:
            # Catch the specific database error for duplicate emails
            raise serializers.ValidationError(
                {"detail": "This email is already registered."}
            )


class ManagerRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for handling manager registration.
    
    This serializer is used to create a new manager user and their
    associated branch at the same time.
    """
    password = serializers.CharField(write_only=True)
    branch_name = serializers.CharField(write_only=True)
    branch_address = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            'email',
            'first_name',
            'last_name',
            'password',
            'branch_name',
            'branch_address'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def validate(self, data):
        """
        Validates that the provided branch name is not already in use.
        """
        branch_name = data.get('branch_name')
        if Branch.objects.filter(name=branch_name).exists():
            raise serializers.ValidationError(
                {"branch_name": "A branch with this name already exists."}
            )
        return data

    def create(self, validated_data):
        """
        Creates a new branch and a new manager user, and associates them.
        """
        branch_name = validated_data.pop('branch_name')
        branch_address = validated_data.pop('branch_address', '')

        try:
            branch = Branch.objects.create(
                name=branch_name,
                address=branch_address
            )
            user = User.objects.create_user(
                email=validated_data['email'],
                password=validated_data['password'],
                first_name=validated_data['first_name'],
                last_name=validated_data['last_name'],
                role='manager',
                branch=branch
            )
            return user
        
        except IntegrityError:
            # If user creation fails due to an existing email,
            # clean up the created branch to avoid orphaned data.
            if 'branch' in locals() and branch:
                branch.delete()
            raise serializers.ValidationError(
                {"email": "This email is already registered."}
            )


class BranchSerializer(serializers.ModelSerializer):
    """
    Serializes Branch model instances into a JSON format.

    This serializer is used to represent branch data in the API. It includes
    all fields from the Branch model.
    """
    class Meta:
        """
        Meta options for the BranchSerializer.
        """
        model = Branch
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    """
    Serializes User model instances for read-only purposes.

    This serializer is used to display user information without exposing
    sensitive data like passwords. It includes a nested representation of
    the user's branch.

    Attributes:
        branch (BranchSerializer):
        A nested serializer to represent the user's branch details.
    """
    branch = BranchSerializer(read_only=True)

    class Meta:
        """
        Meta options for the UserSerializer.
        """
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'branch']


class InvitationSerializer(serializers.ModelSerializer):
    """
    Serializes invitation data for creating a new invitation.

    This serializer is used by managers to send invitations to new employees.
    """
    class Meta:
        model = Invitation
        fields = ['email', 'branch', 'role']
        read_only_fields = ['token', 'is_used', 'created_at']


class ShiftSerializer(serializers.ModelSerializer):
    """
    Serializes Shift model instances for API operations.

    This serializer handles the creation, viewing, and claiming of shifts.
    It provides nested details for the branch, and users who posted and
    claimed the shift.

    Attributes:
        branch_details (BranchSerializer):
        A nested serializer to provide read-only details about the branch.
        posted_by_details (UserSerializer):
        A nested serializer for the user who posted the shift.
        claimed_by_details (UserSerializer):
        A nested serializer for the user who claimed the shift.
    """
    branch_details = BranchSerializer(source='branch', read_only=True)
    posted_by_details = UserSerializer(source='posted_by', read_only=True)
    claimed_by_details = UserSerializer(source='claimed_by', read_only=True)

    class Meta:
        """
        Meta options for the ShiftSerializer.
        """
        model = Shift
        fields = [
            'id', 'branch', 'branch_details', 'posted_by', 'posted_by_details',
            'claimed_by', 'claimed_by_details', 'start_time', 'end_time',
            'role', 'status', 'description'
        ]
        read_only_fields = ['status', 'posted_by', 'claimed_by']