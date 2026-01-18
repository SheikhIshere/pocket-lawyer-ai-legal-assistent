# checking is user is verified or not
from rest_framework.permissions import BasePermission

""" 
User who is verified only can access the resource.
"""
class IsVerifiedUser(BasePermission):
    """
    Allows access only to users with is_verified=True.
    """
    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_verified)


"""
Custom permission to only allow owners of an object to edit it.
"""
class IsOwnerOrReadOnly(BasePermission):
    """
    Anyone can retrieve (GET).
    Only the owner can update or delete.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True

        return bool(request.user and getattr(obj, 'user', None) == request.user)

