from rest_framework import permissions

class IsManager(permissions.BasePermission):
    """
    Custom permission to allow only managers to create/edit shifts.
    """
    def has_permission(self, request, view):
        # Check if the user is authenticated and has a manager-level role
        if not request.user.is_authenticated:
            return False

        return request.user.role in [
            'head_office', 'region_manager', 'branch_manager'
        ]