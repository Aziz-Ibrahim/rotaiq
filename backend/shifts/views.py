from rest_framework import viewsets, mixins, status, generics, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import Q, Count

from .models import *
from .permissions import IsManagerOrReadOnly
from .serializers import *


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
    permission_classes = [AllowAny]


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A viewset for viewing user profiles, with hierarchical permissions.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()

        if user.is_staff or user.role == 'head_office':
            # Head Office can see all users
            return queryset
        elif user.role == 'region_manager':
            # Region managers can see employees in their region
            return queryset.filter(region=user.region)
        elif user.role == 'branch_manager':
            # Branch managers can only see employees in their own branch
            return queryset.filter(branch=user.branch)
        
        # Regular employees can only see their own profile
        return queryset.filter(id=user.id)


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
    permission_classes = [IsManagerOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        queryset = Shift.objects.all()

        if user.is_staff or user.role == 'head_office':
            # Staff and HQ see all shifts
            return queryset.order_by('-start_time')
        elif user.role == 'region_manager':
            # Region manager sees all shifts within their region
            return queryset.filter(
                branch__region=user.region
            ).order_by('-start_time')
        elif user.role == 'branch_manager':
            # Branch manager sees all shifts within their branch
            return queryset.filter(branch=user.branch).order_by('-start_time')
        elif user.role == 'employee':
            # Employee sees open shifts in their branch, plus shifts they
            # claimed/approved
            return queryset.filter(
                Q(branch=user.branch, status='open') | Q(claimed_by=user)
            ).order_by('-start_time')
        elif user.role == 'floating_employee':
            if user.region:
                # Floating employee sees open shifts in their region,
                # plus shifts they claimed/approved
                return queryset.filter(
                    Q(branch__region=user.region, status='open') |
                    Q(claimed_by=user)
                ).order_by('-start_time')

        return Shift.objects.none()  # Return no shifts for undefined roles

    def perform_create(self, serializer):
        """
        Assigns the currently authenticated user as the 'posted_by' of the new
        shift.
        """
        serializer.save(posted_by=self.request.user)

    @action(detail=True, methods=['post'],
            permission_classes=[permissions.IsAuthenticated])
    def claim(self, request, pk=None):
        """
        Allows an employee to claim an open shift.
        """
        try:
            shift = self.get_object()
        except Shift.DoesNotExist:
            return Response(
                {'error': 'Shift not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        user = request.user

        if shift.status != 'open':
            return Response(
                {'error': 'This shift is not open for claims.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if user.role == 'employee' and user.branch != shift.branch:
            return Response(
                {'error': 'You can only claim shifts at your own branch.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if (user.role == 'floating_employee' and user.region and
                user.region != shift.branch.region):
            return Response(
                {'error': 'You can only claim shifts in your region.'},
                status=status.HTTP_403_FORBIDDEN
            )

        with transaction.atomic():
            claim, created = ShiftClaim.objects.get_or_create(
                shift=shift,
                user=user
            )
            if not created:
                return Response(
                    {'message': 'You have already claimed this shift.'},
                    status=status.HTTP_200_OK
                )

            shift.status = 'claimed'
            shift.save()

        serializer = ShiftClaimSerializer(claim)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'],
            permission_classes=[IsManagerOrReadOnly], lookup_field='pk')
    def approve(self, request, pk=None):
        """
        Allows a manager to approve a shift claim.
        """
        try:
            claim = ShiftClaim.objects.get(id=pk)
            shift = claim.shift
        except ShiftClaim.DoesNotExist:
            return Response(
                {'error': 'Claim not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        user = request.user

        if user.role == 'branch_manager' and user.branch != shift.branch:
            return Response(
                {'error': 'You can only approve shifts in your own branch.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if (user.role == 'region_manager' and user.region and
                user.region != shift.branch.region):
            return Response(
                {'error': 'You can only approve shifts in your own region.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if claim.status != 'pending' or shift.status == 'filled':
            return Response(
                {'error': 'This claim cannot be approved.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            claim.status = 'approved'
            claim.save()

            shift.status = 'filled'
            shift.assigned_to = claim.user
            shift.save()

            ShiftClaim.objects.filter(
                shift=shift,
                status='pending'
            ).exclude(id=claim.id).update(status='declined')

        return Response(
            {'message': 'Shift claim approved.'},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'],
            permission_classes=[IsManagerOrReadOnly], lookup_field='pk')
    def decline(self, request, pk=None):
        """
        Allows a manager to decline a shift claim.
        """
        try:
            claim = ShiftClaim.objects.get(id=pk)
            shift = claim.shift
        except ShiftClaim.DoesNotExist:
            return Response(
                {'error': 'Claim not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        user = request.user

        if user.role == 'branch_manager' and user.branch != shift.branch:
            return Response(
                {'error': 'You can only decline shifts in your own branch.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if (user.role == 'region_manager' and user.region and
                user.region != shift.branch.region):
            return Response(
                {'error': 'You can only decline shifts in your own region.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if claim.status != 'pending':
            return Response(
                {'error': 'This claim cannot be declined.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            claim.status = 'declined'
            claim.save()

            if (shift.status == 'claimed' and not
                    ShiftClaim.objects.filter(
                        shift=shift,
                        status='pending'
                    ).exists()):
                shift.status = 'open'
                shift.save()

        return Response(
            {'message': 'Shift claim declined.'},
            status=status.HTTP_200_OK
        )


class AnalyticsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A ViewSet for providing read-only analytical reports.

    This viewset is designed to provide business insights to manager-level
    users by performing aggregate queries on shift data. It does not
    handle creation, update, or deletion of shifts.
    """
    permission_classes = [IsAuthenticated]
    queryset = None
    serializer_class = AnalyticsSerializer

    def get_queryset(self):
        """
        Returns an empty queryset to satisfy the DefaultRouter.
        All data is returned via custom actions.
        """
        return Shift.objects.none()

    @action(detail=False, methods=['get'])
    def open_shifts_by_branch(self, request):
        """
        Returns a count of open shifts for each branch, filtered by user role.
        """
        user = self.request.user
        
        # Base queryset for open shifts
        queryset = Shift.objects.filter(status='open')

        # Filter based on user role
        if user.role == 'branch_manager':
            queryset = queryset.filter(branch=user.branch)
        elif user.role == 'region_manager':
            queryset = queryset.filter(branch__region=user.region)
        elif user.role != 'head_office' and not user.is_staff:
            # Deny access for employees and other roles
            return Response(
                {
                    "detail":
                    "You do not have permission to perform this action."
                },
                status=403,
            )
        
        # Group by branch and count
        data = queryset.values('branch__name').annotate(
            open_shift_count=Count('id')
        ).order_by('branch__name')
        
        return Response(data)
