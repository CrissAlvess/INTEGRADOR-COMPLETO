from rest_framework import serializers
from .models import (
    Ambiente, Sensor, DadoSensor, Umidade, 
    Contador, Luminosidade, Temperatura, Historico
)

class AmbienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ambiente
        fields = '__all__'


class SensorSerializer(serializers.ModelSerializer):
    timestamp = serializers.DateTimeField(
        format="%Y-%m-%dT%H:%M:%S.%f", 
        required=False, 
        allow_null=True
    )
    temperatura = serializers.SerializerMethodField()
    umidade = serializers.SerializerMethodField()
    contador = serializers.SerializerMethodField()
    luminosidade = serializers.SerializerMethodField()

    class Meta:
        model = Sensor
        fields = '__all__'

    def get_temperatura(self, obj):
        leitura = Temperatura.objects.filter(sensor=obj).order_by('-timestamp').first()
        return leitura.temperatura if leitura else None

    def get_umidade(self, obj):
        leitura = Umidade.objects.filter(sensor=obj).order_by('-timestamp').first()
        return leitura.umidade if leitura else None

    def get_contador(self, obj):
        leitura = Contador.objects.filter(sensor=obj).order_by('-timestamp').first()
        return leitura.contador if leitura else None

    def get_luminosidade(self, obj):
        leitura = Luminosidade.objects.filter(sensor=obj).order_by('-timestamp').first()
        return leitura.luminosidade if leitura else None


class DadoSensorSerializer(serializers.ModelSerializer):
    class Meta:
        model = DadoSensor
        fields = '__all__'


class HistoricoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Historico
        fields = ['sensor', 'ambiente', 'valor', 'timestamp']
