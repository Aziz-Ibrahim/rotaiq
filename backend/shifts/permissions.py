from rest_framework import permissions

class IsManagerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow managers to create, update
    or delete shifts.
    Read-only access is allowed for all authenticated users.
    """
    def has_permission(self, request, view):
        # Allow GET, HEAD, or OPTIONS requests for all authenticated users
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        # Write permissions are only allowed for managers
        return (request.user and 
                request.user.is_authenticated and 
                request.user.role in [
                    'manager', 
                    'branch_manager', 
                    'region_manager', 
                    'head_office'
                ])