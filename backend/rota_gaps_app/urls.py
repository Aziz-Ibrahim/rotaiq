from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from shifts import views

router = DefaultRouter()
router.register(r'shifts', views.ShiftViewSet)
router.register(r'branches', views.BranchViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    # Add authentication URLs
    path('api-auth/', include('rest_framework.urls')),
]