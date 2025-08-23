import uuid
from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser, BaseUserManager, PermissionsMixin
)


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


class UserManager(BaseUserManager):
    """
    Custom manager for the User model.

    This manager provides methods to create a standard user and a superuser,
    both authenticated by their email address. It handles the normalization
    of the email and the hashing of the password.
    """
    def create_user(self, email, password, **extra_fields):
        """
        Creates and saves a regular user with the given email and password.
        
        Args:
            email (str): The user's email address, which serves as their unique
            identifier.
            password (str): The user's password.
            **extra_fields: Additional fields to be saved on the User model.

        Returns:
            User: The newly created user instance.
        
        Raises:
            ValueError: If the email is not provided.
        """
        if not email:
            raise ValueError('The Email field must be set')
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        """
        Creates and saves a superuser with the given email and password.
        
        Superusers are automatically assigned the 'manager' role and have
        `is_staff` and `is_superuser` set to `True`.

        Args:
            email (str): The superuser's email address.
            password (str): The superuser's password.
            **extra_fields: Additional fields for the superuser.

        Returns:
            User: The newly created superuser instance.

        Raises:
            ValueError: If `is_staff` or `is_superuser` are not set to `True`
            in `extra_fields`.
        """
        # Set default values for superusers
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'manager')

        # Check for required fields and raise errors if not present
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    """
    A custom user model that uses email as the unique identifier.

    This model extends Django's built-in `AbstractBaseUser` and 
    `PermissionsMixin` to provide a fully customizable user system.
    It includes fields for user details, role-based access control,
    and a foreign key to a `Branch`.
    """
    ROLE_CHOICES = (
        ('manager', 'Manager'),
        ('employee', 'Employee'),
    )

    email = models.EmailField(
        verbose_name="email address",
        unique=True,
        null=False,
        blank=False,
        help_text="The user's unique email address."
    )
    first_name = models.CharField(
        max_length=50,
        blank=True,
        help_text="The user's first name."
    )
    last_name = models.CharField(
        max_length=50,
        blank=True,
        help_text="The user's last name."
    )
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default='employee',
        help_text="The user's role (manager or employee)."
    )
    branch = models.ForeignKey(
        'Branch',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='employees',
        help_text="The branch the user is associated with."
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Designates whether this user should be treated as active."
    )
    is_staff = models.BooleanField(
        default=False,
        help_text="Designates whether the user can log into this admin site."
    )
    
    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        """
        Returns a string representation of the user.
        """
        return self.email


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