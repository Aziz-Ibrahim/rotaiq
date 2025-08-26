from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from shifts import views
from shifts.serializers import MyTokenObtainPairSerializer


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'shifts', views.ShiftViewSet)
router.register(r'branches', views.BranchViewSet)
router.register(r'invitations', views.InvitationViewSet)
router.register(r'analytics', views.AnalyticsViewSet, basename='analytics')


urlpatterns = [
    path('admin/', admin.site.urls),

    path(
        'api/register/',
        views.UserRegistrationView.as_view(),
        name='register'
    ),

    path(
        'api/register/manager/',
        views.ManagerRegistrationView.as_view(),
        name='register_manager'
    ),

    path('api/', include(router.urls)),

    path(
        'api/token/',
        MyTokenObtainPairView.as_view(),
        name='token_obtain_pair'
    ),

    path(
        'api/token/refresh/',
        TokenRefreshView.as_view(),
        name='token_refresh'
    ),
]