from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.routers import DefaultRouter
from courts.views import CourtViewSet
from bookings.views import BookingViewSet, ReviewViewSet
from shop.views import CategoryViewSet, ProductViewSet, OrderViewSet
from accounts.views import CustomTokenObtainPairView

router = DefaultRouter()
router.register(r'courts', CourtViewSet)
router.register(r'bookings', BookingViewSet)
router.register(r'reviews', ReviewViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'orders', OrderViewSet)

from django.views.generic import RedirectView

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth Endpoints
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # Fallback/standard password reset confirm URL for dj-rest-auth reverse & direct link redirect
    path(
        'password-reset/confirm/<str:uidb64>/<str:token>/',
        RedirectView.as_view(
            url=f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:3000').rstrip('/')}/reset-password/confirm?uid=%(uidb64)s&token=%(token)s",
            permanent=False
        ),
        name='password_reset_confirm'
    ),
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),

    # Core API
    path('api/', include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

