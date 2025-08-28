from rest_framework import viewsets, mixins, status, generics, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import Q, Count
from django.db.models.expressions import F
from django.db.models.functions import ExtractDay, ExtractMonth, ExtractYear
from django.contrib.auth import get_user_model

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


User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    """
    A viewset that provides the standard actions for User models.
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
    
    @action(detail=False, methods=['get'], url_path='me')
    def get_me(self, request):
        user = request.user
        serializer = self.get_serializer(user)
        return Response(serializer.data)


class RegionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A viewset to provide read-only access to Region data.
    """
    queryset = Region.objects.all().order_by('name')
    serializer_class = RegionSerializer
    permission_classes = [permissions.IsAuthenticated]


class BranchViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A viewset for viewing branches.

    This viewset provides read-only operations on the Branch model, such as
    listing all branches or retrieving a single branch's details.
    """
    queryset = Branch.objects.none()
    serializer_class = BranchSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Branch.objects.all().order_by('name')
        
        # Filter by region if a region_id is provided in the query params.
        region_id = self.request.query_params.get('region_id')
        if region_id:
            queryset = queryset.filter(region__id=region_id)

        # Filter branches based on the user's role.
        if user.role == 'region_manager':
            # Region manager sees all branches within their region.
            if user.region:
                queryset = queryset.filter(region=user.region)
        elif user.role == 'branch_manager':
            # Branch manager sees only their own branch.
            if user.branch:
                queryset = queryset.filter(pk=user.branch.pk)

        return queryset


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

    def create(self, request, *args, **kwargs):
        """
        Creates a new invitation based on the manager's role and returns the
        serialized data, including the newly created token.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = self.request.user

        # Branch Managers can only create invitations for their own branch
        if user.role == 'branch_manager':
            invitation_branch = serializer.validated_data.get('branch')
            if invitation_branch and invitation_branch != user.branch:
                raise PermissionDenied(
                    "You can only create invitations for your own branch."
                )
            
            serializer.save(branch=user.branch)

        # Region Managers can create invitations for any branch in their region
        elif user.role == 'region_manager':
            invitation_branch = serializer.validated_data.get('branch')
            if not invitation_branch:
                raise PermissionDenied(
                    "A branch must be specified for this role."
                )
            if invitation_branch.region != user.region:
                raise PermissionDenied(
                    "You can only create invitations for branches in your "
                    "region."
                )

            serializer.save(branch=invitation_branch)

        else:
            raise PermissionDenied(
                "You do not have permission to perform this action."
            )
            
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
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

        # Check for specific roles first, then broad ones.
        if user.role == 'branch_manager':
            # Branch manager sees all shifts within their branch
            return queryset.filter(branch=user.branch).order_by('-start_time')
        elif user.role == 'region_manager':
            # Region manager sees all shifts within their region
            return queryset.filter(
                branch__region=user.region
            ).order_by('-start_time')
        elif user.role == 'employee':
            # Employee sees open shifts in their branch, plus shifts they
            # claimed/approved
            return queryset.filter(
                Q(branch=user.branch, status='open') | Q(claims__user=user)
            ).order_by('-start_time')
        elif user.role == 'floating_employee':
            if user.region:
                # Floating employee sees open shifts in their region,
                # plus shifts they claimed/approved
                return queryset.filter(
                    Q(branch__region=user.region, status='open') |
                    Q(claims__user=user)
                ).order_by('-start_time')
        elif user.is_staff or user.role == 'head_office':
            # Staff and HQ see all shifts (this check should be last)
            return queryset.order_by('-start_time')

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


class AnalyticsViewSet(viewsets.ViewSet):
    """
    A viewset for providing shift-related analytics.
    """
    permission_classes = [permissions.IsAuthenticated]

    # New method to get the base queryset based on user role
    def get_base_queryset(self):
        user = self.request.user
        queryset = Shift.objects.all()

        if user.role == 'branch_manager':
            return queryset.filter(branch=user.branch)
        elif user.role == 'region_manager':
            return queryset.filter(branch__region=user.region)
        elif user.is_staff or user.role == 'head_office':
            return queryset
        
        return Shift.objects.none()

    # This is a key action that counts open shifts by branch
    @action(detail=False, methods=['get'])
    def open_shifts_by_branch(self, request):
        queryset = self.get_base_queryset().filter(status='open')

        # Apply additional filtering for Head Office and Region Managers
        region_id = request.query_params.get('region_id')
        branch_id = request.query_params.get('branch_id')

        if branch_id:
            queryset = queryset.filter(branch__id=branch_id)
        elif region_id:
            queryset = queryset.filter(branch__region__id=region_id)

        # The corrected query
        data = queryset.values(
            name=F('branch__name')
            ).annotate(value=Count('branch')).order_by('branch__name')
        
        return Response(data)

    @action(detail=False, methods=['get'], url_path='open-shifts-timeline')
    def open_shifts_timeline(self, request):
        queryset = self.get_base_queryset().filter(status='open')

        region_id = request.query_params.get('region_id')
        branch_id = request.query_params.get('branch_id')
        year = request.query_params.get('year')
        month = request.query_params.get('month')

        # Apply filtering for branch and region
        if branch_id:
            queryset = queryset.filter(branch__id=branch_id)
        elif region_id:
            queryset = queryset.filter(branch__region__id=region_id)

        # Apply year and month filtering
        year = request.query_params.get('year')
        month = request.query_params.get('month')

        if year:
            queryset = queryset.filter(start_time__year=year)
        if month:
            queryset = queryset.filter(start_time__month=month)

        data = queryset.annotate(
            day=ExtractDay('start_time')
        ).values('day', 'status').annotate(
            count=Count('pk')
        ).order_by('day', 'status')

        transformed_data = {}
        for item in data:
            day = item['day']
            status = item['status']
            count = item['count']

            if day not in transformed_data:
                transformed_data[day] = {'day': day}
            
            transformed_data[day][status] = count
        
        return Response(list(transformed_data.values()))

