from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from api_smart.views import (
    AmbienteViewSet, 
    DadoSensorViewSet, 
    SensorViewSet, 
    SignupView, 
    SensoresUnificadosView,
    HistoricoViewSet  
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = routers.DefaultRouter()
router.register(r'ambientes', AmbienteViewSet, basename='ambiente')
router.register(r'dados', DadoSensorViewSet, basename='dados')
router.register(r'sensores', SensorViewSet, basename='sensor')
router.register(r'historico', HistoricoViewSet, basename='historico') 

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/signup/', SignupView.as_view(), name='signup'),
    path('api/sensores_unificados/', SensoresUnificadosView.as_view(), name='sensores_unificados'),
]
