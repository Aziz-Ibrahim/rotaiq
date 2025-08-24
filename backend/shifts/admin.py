from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import Branch, User, Shift, Invitation, Region


@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    """Admin configuration for the Region model"""
    list_display = ('name',)
    search_fields = ('name',)
    list_filter = ('name',)


@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    """Admin configuration for the Branch model."""
    list_display = ('name', 'address', 'region')
    search_fields = ('name',)
    list_filter = ('name',)


@admin.register(Shift)
class ShiftAdmin(admin.ModelAdmin):
    """Admin configuration for the Shift model."""
    list_display = ('role', 'branch', 'start_time', 'end_time', 'status')
    list_filter = ('status', 'branch', 'role')
    search_fields = ('role', 'description')


@admin.register(Invitation)
class InvitationAdmin(admin.ModelAdmin):
    """Admin configuration for the Invitation model."""
    list_display = ('email', 'branch', 'is_used', 'created_at', 'token')
    list_filter = ('is_used', 'branch')
    search_fields = ('email',)
    readonly_fields = ['token']


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin configuration for the custom User model."""
    list_display = (
        'email', 'first_name', 'last_name', 'role', 'is_staff', 'branch',
        'region'
    )
    list_filter = ('role', 'is_staff', 'branch', 'region')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)
    fieldsets = (
        (
            None,
            {'fields': ('email', 'password')}
        ),
        (
            'Personal Info',
            {'fields': (
                'first_name', 'last_name', 'role', 'branch', 'region'
            )}
        ),
        (
            'Permissions',
            {'fields': (
                'is_active', 'is_staff', 'is_superuser', 'groups',
                'user_permissions'
            )}
        ),
    )
    add_fieldsets = (
        (
            None,
            {'fields': (
                'email', 'password', 'first_name', 'last_name', 'role',
                'branch', 'is_staff', 'is_superuser'
            )}
        ),
    )