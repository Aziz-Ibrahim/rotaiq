import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser


class Branch(models.Model):
    """
    Represents a business branch or location.
    
    Attributes:
        name (str): The official name of the branch (
            e.g., "Kilburn High Road"
        ).
        address (str): The physical address of the branch.
    """
    name = models.CharField(max_length=255, unique=True)
    address = models.TextField(blank=True)

    def __str__(self):
        """
        Returns a string representation of the branch, which is its name.
        """
        return self.name


class User(AbstractUser):
    """
    Custom user model for RotaIQ.
    
    This model extends Django's built-in AbstractUser to add custom fields
    like 'role' and 'branch', which are essential for our application's
    logic and permissions.
    
    Attributes:
        role (str): The user's role, either 'manager' or 'employee'.
        branch (ForeignKey): The branch the user is associated with.
    """
    ROLE_CHOICES = (
        ('manager', 'Manager'),
        ('employee', 'Employee'),
    )
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='employee'
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='employees'
    )


class Invitation(models.Model):
    """
    Represents an invitation to register for a new user.

    Each invitation contains a unique token and is linked to the email and
    branch of the invited person.
    """
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    email = models.EmailField(unique=True)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    role = models.CharField(
        max_length=20,
        choices=User.ROLE_CHOICES,
        default='employee'
    )
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Invitation for {self.email} ({self.role})"


class Shift(models.Model):
    """
    Represents an available rota gap or shift to be covered.
    
    Attributes:
        branch (ForeignKey): The branch where the shift is available.
        posted_by (ForeignKey): The manager who posted the shift.
        claimed_by (ForeignKey): The employee who claimed the shift
            (can be null).
        start_time (datetime): The start date and time of the shift.
        end_time (datetime): The end date and time of the shift.
        role (str): The job role required for the shift (e.g., "Cashier").
        status (str): The current status of the shift (
            'open', 'claimed', 'approved'
        ).
        description (str): A brief description of the shift.
    """
    STATUS_CHOICES = (
        ('open', 'Open'),
        ('claimed', 'Claimed'),
        ('approved', 'Approved'),
        ('closed', 'Closed'),
    )

    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name='shifts'
    )
    posted_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='posted_shifts'
    )
    claimed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='claimed_shifts'
    )
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    role = models.CharField(max_length=100)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='open'
    )
    description = models.TextField(blank=True)

    def __str__(self):
        """
        Returns a human-readable string for the shift instance.
        """
        return f"{self.role} shift at {self.branch.name} on {self.start_time.date()}"