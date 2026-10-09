from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom JWT token view that returns user data along with tokens
    """
    serializer_class = CustomTokenObtainPairSerializer

