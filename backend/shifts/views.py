from rest_framework import viewsets, mixins, status, generics, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.exceptions import PermissionDenied, NotFound
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import Q, Count
from django.db.models.expressions import F
from django.db.models.functions import ExtractDay, ExtractMonth, ExtractYear
from django.contrib.auth import get_user_model

from .models import *
from .permissions import IsManagerOrReadOnly
from .serializers import *
from .emails import send_invitation_email

User = get_user_model()


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
        """
        Custom action to retrive user details
        """
        user = request.user
        serializer = self.get_serializer(user)
        return Response(serializer.data)

    @action(detail=False, methods=['patch'], url_path='me')
    def update_me(self, request):
        """
        Custom action to allow a user to update their own profile.
        """
        user = request.user
        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(
            detail=False, methods=['post'],
            parser_classes=(MultiPartParser, FormParser),
            url_path='upload_avatar'
    )
    def upload_avatar(self, request):
        """
        Custom action to handle avatar file uploads.
        """
        if not request.user.is_authenticated:
            return Response(
                {'detail': 'Authentication credentials were not provided.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        user = request.user
        serializer = UserAvatarSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            
            # Use the full user serializer to return the complete user object
            full_serializer = self.get_serializer(user)
            return Response(full_serializer.data, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """
        Custom action to handle user password changes.
        """
        serializer = PasswordChangeSerializer(
            data=request.data, context={'request': request}
        )
        if serializer.is_valid():
            # Get the authenticated user and set the new password
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response(
                {'status': 'password set'}, status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
        Creates a new invitation, sends an email, and returns the
        serialized data.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = self.request.user
        
        invitation = None

        # Branch Managers can only create invitations for their own branch
        if user.role == 'branch_manager':
            invitation_branch = serializer.validated_data.get('branch')
            if invitation_branch and invitation_branch != user.branch:
                raise PermissionDenied(
                    "You can only create invitations for your own branch."
                )
            
            # Save the invitation with the branch from the current user
            invitation = serializer.save(branch=user.branch)

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
            
            # Save the invitation with the branch from the validated data
            invitation = serializer.save(branch=invitation_branch)

        else:
            raise PermissionDenied(
                "You do not have permission to perform this action."
            )
        
        if invitation:
            try:
                # The invitation object now has the email saved to it
                send_invitation_email(
                    sender_name=user.get_full_name() or user.username,
                    sender_branch=(
                        user.branch.name if user.branch else "Head Office"
                    ),
                    recipient_email=invitation.email,  # Use the saved email
                    token=invitation.token
                )
            except Exception as e:
                # Log the error but don't fail the API call
                print(f"Failed to send invitation email: {e}")

        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )



class ShiftViewSet(viewsets.ModelViewSet):
    """
    A ViewSet for viewing and editing shifts.
    """
    queryset = Shift.objects.all()
    serializer_class = ShiftSerializer

    def get_queryset(self):
        """
        Custom get_queryset to filter shifts based on the user's role.
        """
        user = self.request.user
        queryset = Shift.objects.all()

        if user.is_authenticated:
            # Branch Managers and above can see all shifts in their branch (or others)
            if user.role in ['branch_manager', 'region_manager', 'head_office']:
                return queryset.all()

            # All employees (including floating) can see shifts in their region
            if user.branch and user.branch.region:
                return queryset.filter(branch__region=user.branch.region)
            else:
                return queryset.filter(branch=user.branch)

        return queryset.none()
    
    def perform_create(self, serializer):
        """
        Set the `posted_by` field to the current authenticated user and
        enforce permissions based on role.
        """
        user = self.request.user
        branch_from_payload = serializer.validated_data.get('branch')

        # Branch managers can post shifts to their branch
        if user.role == 'branch_manager' and branch_from_payload != user.branch:
            raise PermissionDenied("Managers can only post shifts for their own branch.")
        
        # Region managers can post shifts to any branch in their region
        if user.role == 'region_manager' and branch_from_payload.region != user.region:
            raise PermissionDenied("Region managers can only post shifts in their region.")

        serializer.save(posted_by=user)
    
    @action(detail=True, methods=['post'])
    def claim(self, request, pk=None):
        """
        Endpoint for an employee to claim an open shift.
        """
        shift = self.get_object()
        user = request.user

        if user.role not in ['employee', 'floating_employee']:
            return Response({'error': 'Only employees can claim shifts.'}, status=403)
        
        if shift.status != 'open':
            return Response({'error': 'This shift is not open for claims.'}, status=400)

        try:
            # Use get_or_create to atomically check for and create the claim
            claim, created = ShiftClaim.objects.get_or_create(
                shift=shift,
                user=user,
                defaults={'status': 'pending'}
            )
            
            if not created:
                # If the claim was not created, it means it already exists
                return Response({'error': 'You have already submitted a claim for this shift.'}, status=400)

            return Response({'status': 'Shift claimed successfully.'}, status=201)

        except Exception as e:
            return Response({'error': str(e)}, status=500)
    
    @action(detail=True, methods=['post'])
    def assign_staff(self, request, pk=None):
        """
        Allows a manager to directly assign a staff member to a shift.
        """
        try:
            shift = self.get_object()
            user = request.user
            staff_id = request.data.get('staff_id')
            
            # Check if the user is a manager
            if user.role not in ['branch_manager', 'region_manager', 'head_office']:
                raise PermissionDenied("You do not have permission to perform this action.")
            
            # Check if the shift is open
            if shift.status != 'open':
                return Response(
                    {'error': 'This shift is not open for direct assignment.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Retrieve the staff member to be assigned
            try:
                staff_member = User.objects.get(id=staff_id)
            except User.DoesNotExist:
                raise NotFound("Staff member not found.")

            # Ensure the manager has permission to assign this staff member
            if user.role == 'branch_manager' and (staff_member.branch != user.branch or shift.branch != user.branch):
                raise PermissionDenied("Managers can only assign staff within their own branch.")
            if user.role == 'region_manager' and (staff_member.branch.region != user.region or shift.branch.region != user.region):
                raise PermissionDenied("Region managers can only assign staff within their region.")
            
            # Use a transaction to ensure atomicity
            with transaction.atomic():
                shift.assigned_to = staff_member
                shift.status = 'claimed'  # Change status to claimed
                shift.save()

                # Optional: Decline any existing pending claims for this shift
                ShiftClaim.objects.filter(shift=shift, status='pending').update(status='declined')

            return Response({'status': f'Shift assigned to {staff_member.get_full_name()} successfully.'})

        except PermissionDenied as e:
            return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
        except NotFound as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ShiftClaimViewSet(viewsets.ModelViewSet):
    """
    A ViewSet for managing ShiftClaim instances.
    """
    queryset = ShiftClaim.objects.all()
    serializer_class = ShiftClaimSerializer

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """
        Approves a specific shift claim.
        """
        try:
            with transaction.atomic():
                claim = self.get_object()
                if claim.status != 'pending':
                    return Response(
                        {'error': 'Claim is not in a pending state.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Update the claim's status to 'approved'
                claim.status = 'approved'
                claim.save()
                
                # Check for other pending claims on the same shift
                other_claims = ShiftClaim.objects.filter(
                    shift=claim.shift, status='pending'
                ).exclude(pk=claim.pk)
                
                # Decline all other pending claims for this shift
                for other_claim in other_claims:
                    other_claim.status = 'declined'
                    other_claim.save()

                # Find the shift and assign the user to it
                shift = claim.shift
                shift.assigned_to = claim.user
                shift.status = 'claimed'
                shift.save()

            return Response({'status': 'Shift claim approved.'})
        except ShiftClaim.DoesNotExist:
            return Response(
                {'error': 'Shift claim not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def decline(self, request, pk=None):
        """
        Declines a specific shift claim.
        """
        try:
            claim = self.get_object()
            if claim.status != 'pending':
                return Response(
                    {'error': 'Claim is not in a pending state.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update the claim's status to 'declined'
            claim.status = 'declined'
            claim.save()

            # Get the shift and return its status to 'open' if no other claims exist
            shift = claim.shift
            # If there are other pending claims, don't re-open the shift
            if not ShiftClaim.objects.filter(shift=shift, status='pending').exists():
                shift.status = 'open'
                shift.save()

            return Response({'status': 'Shift claim declined.'})
        except ShiftClaim.DoesNotExist:
            return Response(
                {'error': 'Shift claim not found.'},
                status=status.HTTP_404_NOT_FOUND
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

    # This is a key action that counts all shifts by branch
    @action(detail=False, methods=['get'])
    def all_shifts_by_branch(self, request):
        queryset = self.get_base_queryset()

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

    @action(detail=False, methods=['get'], url_path='all-shifts-timeline')
    def all_shifts_timeline(self, request):
        # The fix: we now get all shifts, not just 'open' ones.
        queryset = self.get_base_queryset()

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

