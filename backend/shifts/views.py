from rest_framework import viewsets, mixins, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404

from .models import Shift, Branch, User, Invitation
from .serializers import (
    BranchSerializer, ShiftSerializer, UserSerializer,
    InvitationSerializer, UserRegistrationSerializer,
    ManagerRegistrationSerializer
)


class UserRegistrationView(generics.CreateAPIView):
    """
    Handles new user registration.
    
    This view is publicly accessible and allows new users to create an account.
    It uses the UserRegistrationSerializer to validate and save user data.
    """
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]


class ManagerRegistrationView(generics.CreateAPIView):
    """
    Handles new manager registration.

    This view is for creating a new manager account. It is strictly limited
    to administrators.
    """
    serializer_class = ManagerRegistrationSerializer
    permission_classes = [IsAdminUser]


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A viewset for viewing user profiles.

    Provides read-only access to user data.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


class BranchViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A viewset for viewing branches.

    This viewset provides read-only operations on the Branch model, such as
    listing all branches or retrieving a single branch's details.
    """
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer
    permission_classes = [IsAuthenticated]


class InvitationViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet
):
    """
    A viewset for managing invitations.

    Managers can create and list invitations for their branch.
    """
    queryset = Invitation.objects.all()
    serializer_class = InvitationSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def details(self, request):
        """
        Retrieves invitation details by token for public access.
        """
        token = request.query_params.get('token')
        if not token:
            return Response(
                {"detail": "Token is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        invitation = get_object_or_404(Invitation, token=token, is_used=False)
        serializer = self.get_serializer(invitation)
        return Response(serializer.data)

    def get_queryset(self):
        """
        Filters invitations to only show those belonging to the user's branch.
        """
        if self.request.user.role == 'manager':
            return self.queryset.filter(branch=self.request.user.branch)
        return self.queryset.none()  # Employees cannot see invitations

    def perform_create(self, serializer):
        """
        Creates a new invitation linked to the manager's branch.
        """
        if self.request.user.role == 'manager':
            # Managers can only create invitations for their own branch
            branch = self.request.user.branch
            serializer.save(branch=branch)
        else:
            # Raise a PermissionDenied exception instead of a Response
            raise PermissionDenied(
                "You do not have permission to perform this action."
            )


class ShiftViewSet(viewsets.ModelViewSet):
    """
    A viewset for managing shifts.

    This viewset provides CRUD (Create, Read, Update, Delete) operations for
    shifts. It includes custom actions for employees to claim shifts and
    for managers to approve them.
    """
    queryset = Shift.objects.all()
    serializer_class = ShiftSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filters the queryset based on the user's role.

        Employees can only see 'open' shifts.
        Managers can see all shifts.

        Returns:
            QuerySet: The filtered queryset of Shift objects.
        """
        if self.request.user.role == 'employee':
            return self.queryset.filter(status='open')

        return self.queryset

    def perform_create(self, serializer):
        """
        Creates a new shift instance.

        This method ensures that only a manager can post a new shift. The
        `posted_by` field is automatically set to the current user.

        Args:
            serializer (Serializer): The serializer instance for the new shift.
        """
        if self.request.user.role == 'manager':
            serializer.save(posted_by=self.request.user, status='open')
        else:
            return Response(
                {"detail": "You don't have permission to perform this action."},
                status=status.HTTP_403_FORBIDDEN
            )

    @action(detail=True, methods=['post'])
    def claim(self, request, pk=None):
        """
        Allows an employee to claim an open shift.

        This action is only available to employees and updates the shift's
        status to 'claimed'.

        Args:
            request (Request): The request object.
            pk (int): The primary key of the shift to be claimed.

        Returns:
            Response:
            A response containing the updated shift data or an error message.
        """
        shift = self.get_object()
        user = request.user

        is_employee_and_shift_is_open = (
            user.role == 'employee' and shift.status == 'open'
        )

        if is_employee_and_shift_is_open:
            shift.claimed_by = user
            shift.status = 'claimed'
            shift.save()
            return Response(self.get_serializer(shift).data)

        return Response(
            {"detail": "Unable to claim this shift."},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """
        Allows a manager to approve a claimed shift.

        This action is only available to the manager who originally posted
        the shift and only if the shift's status is 'claimed'.

        Args:
            request (Request): The request object.
            pk (int): The primary key of the shift to be approved.

        Returns:
            Response:
            A response containing the updated shift data or an error message.
        """
        shift = self.get_object()
        user = request.user

        can_manager_approve_shift = (
            user.role == 'manager' and
            shift.status == 'claimed' and
            shift.posted_by == user
        )

        if can_manager_approve_shift:
            shift.status = 'approved'
            shift.save()
            return Response(self.get_serializer(shift).data)

        return Response(
            {"detail": "Unable to approve this shift."},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['post'])
    def decline(self, request, pk=None):
        """
        Allows a manager to decline a claimed shift.

        This action is only available to the manager who originally posted
        the shift and only if the shift's status is 'claimed'.
        """
        shift = self.get_object()
        user = request.user

        can_manager_decline_shift = (
            user.role == 'manager' and
            shift.status == 'claimed' and
            shift.posted_by == user
        )

        if can_manager_decline_shift:
            shift.status = 'open' # Changes the status back to 'open'
            shift.claimed_by = None # Removes the employee's claim
            shift.save()
            return Response(self.get_serializer(shift).data)

        return Response(
            {"detail": "Unable to decline this shift."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=False, methods=['get'])
    def my_approved_shifts(self, request):
        """
        Lists shifts that have been claimed and approved by the current
        employee.
        """
        user = request.user
        if user.role != 'employee':
            return Response(
                {"detail": "This endpoint is for employees only."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        approved_shifts = Shift.objects.filter(
            claimed_by=user, 
            status='approved'
        )
        serializer = self.get_serializer(approved_shifts, many=True)
        return Response(serializer.data)