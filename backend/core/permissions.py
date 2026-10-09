from rest_framework import permissions

class IsAdminRole(permissions.BasePermission):
    """
    Permission to check if user has ADMIN role.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            getattr(request.user, 'role', None) == 'ADMIN'
        )

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Safe methods for everyone, writes only for ADMIN.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(
            request.user and 
            request.user.is_authenticated and 
            getattr(request.user, 'role', None) == 'ADMIN'
        )

class IsOwnerRoleOrReadOnly(permissions.BasePermission):
    """
    Safe methods for everyone; POST only for role OWNER or ADMIN.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.method == 'POST':
            return bool(
                request.user and 
                request.user.is_authenticated and 
                getattr(request.user, 'role', None) in ['OWNER', 'ADMIN']
            )
        return False

class IsObjectOwnerOrAdmin(permissions.BasePermission):
    """
    Object-level permission. 
    Checks if the user is the owner of the object, the owner of the court, or an ADMIN.
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        
        if getattr(user, 'role', None) == 'ADMIN':
            return True

        # Check common owner attributes
        owner = getattr(obj, 'owner', None) or getattr(obj, 'user', None)
        if owner == user:
            return True
        
        # Special case for bookings/reviews that might link to a court which has an owner
        court = getattr(obj, 'court', None)
        if court and getattr(court, 'owner', None) == user:
            return True
            
        return False
