from rest_framework import serializers

from .models import User, Branch, Shift, Invitation


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