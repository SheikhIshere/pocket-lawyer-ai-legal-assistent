# location: backend/accounts/views.py

# core import
from rest_framework import (
    status,
    generics,
)
from rest_framework.permissions import IsAuthenticated

# serializers
from .serializers import (
    AccountSerializer,
    AccountAddressSerializer,
)

# models
from .models import (
    Account,
    AccountAddress,
)

# permission
from rest_framework.permissions import IsAuthenticated
from BASE.base_permission import IsOwnerOrReadOnly, IsVerifiedUser
from rest_framework.response import Response

# documentation
from drf_spectacular.utils import extend_schema

"""
getting own profile and updating own profile
"""
@extend_schema(tags=['Account'])
class AccountViewSet(generics.RetrieveUpdateDestroyAPIView):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = (IsAuthenticated,IsVerifiedUser, IsOwnerOrReadOnly)

    def get_object(self):
        account, _ = Account.objects.select_related('user').get_or_create(user=self.request.user)
        return account

    
    def get_queryset(self):
        return Account.objects.filter(user=self.request.user)
    
    def perform_update(self, serializer):
        serializer.save(user=self.request.user)


    def destroy(self, request, *args, **kwargs):
        account = self.get_object()
        user = account.user
        
        self.perform_destroy(account)
        user.delete()
        return Response({
            'deleted': 'account deleted successfully'
        }, status=status.HTTP_204_NO_CONTENT)


"""
getting own address and posting and updating address
"""
@extend_schema(tags=['Account'])
class AccountAddressViewSet(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AccountAddressSerializer
    permission_classes = [IsAuthenticated, IsVerifiedUser, IsOwnerOrReadOnly]

    def get_object(self):
        """
        Get the address for the logged-in user's account.
        If no address exists yet, create a blank one automatically.
        """
        account, _ = Account.objects.get_or_create(user=self.request.user)
        address, _ = AccountAddress.objects.get_or_create(account=account)
        return address

    def perform_update(self, serializer):
        serializer.save(account=self.get_object().account)

    def destroy(self, request, *args, **kwargs):
        """
        Optional: allow deleting the address. Usually, you might just blank it out.
        """
        address = self.get_object()
        self.perform_destroy(address)
        return Response({"deleted": "address deleted successfully"}, status=204)