from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from rest_framework import viewsets, status, filters, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes, parser_classes
from rest_framework.serializers import ModelSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
import pandas as pd
from .models import (
    Ambiente, Sensor, DadoSensor, Umidade, Contador, Luminosidade,
    Temperatura, Historico
)
from .serializers import AmbienteSerializer, SensorSerializer, DadoSensorSerializer, HistoricoSerializer
from django.http import HttpResponse, JsonResponse
from io import BytesIO
from django.utils import timezone
from django.db import IntegrityError
from dateutil.parser import parse as parse_date
from django.core.exceptions import ObjectDoesNotExist
import traceback
from django.db.models import Q
from django.db import transaction 
from rest_framework.views import APIView


# Serializer para criação de usuário com senha
class UserSignupSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # Cria usuário usando create_user para hash correta da senha
        return User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
        )


# View para criação de usuários via API pública (sem autenticação)
class SignupView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSignupSerializer


# ViewSet para gerenciar objetos Ambiente (CRUD)
class AmbienteViewSet(viewsets.ModelViewSet):
    queryset = Ambiente.objects.all()
    serializer_class = AmbienteSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser])
    def importar_planilha(self, request):
        """
        Importa ambientes a partir de planilha Excel enviada via multipart/form-data.
        Verifica colunas obrigatórias e cria ou atualiza registros.
        """
        arquivo_excel = request.FILES.get('file')
        if not arquivo_excel:
            return Response({"detail": "Arquivo não enviado."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            df = pd.read_excel(arquivo_excel)
        except Exception as e:
            return Response({"detail": f"Erro ao ler o arquivo Excel: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        required_columns = {'descricao', 'sig', 'ni', 'responsavel'}
        columns_lower = set(col.lower() for col in df.columns)
        if not required_columns.issubset(columns_lower):
            faltantes = required_columns - columns_lower
            return Response({"detail": f"Colunas obrigatórias ausentes: {faltantes}"}, status=status.HTTP_400_BAD_REQUEST)

        ambientes_criados = []
        erros = []

        for _, row in df.iterrows():
            try:
                descricao = row.get('descricao') or row.get('Descricao')
                if not descricao:
                    raise ValueError("Descrição é obrigatória")
                ambiente, created = Ambiente.objects.update_or_create(
                    descricao=descricao,
                    defaults={
                        'sig': row.get('sig') or row.get('Sig'),
                        'ni': row.get('ni') or row.get('Ni'),
                        'responsavel': row.get('responsavel') or row.get('Responsavel'),
                    }
                )
                ambientes_criados.append(ambiente.id)
            except Exception as e:
                erros.append(str(e))

        if erros:
            return Response({"detail": "Erros ao importar ambientes", "errors": erros}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"detail": f"Ambientes importados/atualizados com sucesso: {ambientes_criados}"})


# APIView que retorna dados unificados de todos os sensores e suas leituras
class SensoresUnificadosView(APIView):

    def get(self, request, format=None):
        # Obtém dados de sensores principais
        sensores = list(Sensor.objects.all().values())

        # Obtém dados de leituras específicas e adiciona campo 'sensor' para identificar tipo
        temperaturas = list(Temperatura.objects.all().values())
        umidades = list(Umidade.objects.all().values())
        contadores = list(Contador.objects.all().values())
        luminosidades = list(Luminosidade.objects.all().values())

        temperaturas = [{**item, 'sensor': 'Temperatura'} for item in temperaturas]
        umidades = [{**item, 'sensor': 'Umidade'} for item in umidades]
        contadores = [{**item, 'sensor': 'Contador'} for item in contadores]
        luminosidades = [{**item, 'sensor': 'Luminosidade'} for item in luminosidades]

        # Junta todos os dados em uma lista única
        sensores_unificados = sensores + temperaturas + umidades + contadores + luminosidades

        return Response(sensores_unificados, status=status.HTTP_200_OK)


# ViewSet para gerenciar sensores (CRUD, filtro e upload de dados)
class SensorViewSet(viewsets.ModelViewSet):
    queryset = Sensor.objects.all()
    serializer_class = SensorSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['sensor', 'mac_address', 'status']

    def get_queryset(self):
        """
        Personaliza queryset para filtrar por mac_address, categoria e status recebidos via query params.
        """
        queryset = super().get_queryset()
        mac_address = (self.request.query_params.get('mac_address') or '').strip()
        categoria = (self.request.query_params.get('categoria') or '').strip().lower()
        status_param = (self.request.query_params.get('status') or '').strip().lower()

        filters = Q()
        if mac_address:
            filters &= Q(mac_address__icontains=mac_address)
        if categoria in ['contador', 'temperatura', 'umidade', 'luminosidade']:
            filters &= Q(sensor__iexact=categoria)
        if status_param == 'ativo':
            filters &= Q(status=True)
        elif status_param == 'inativo':
            filters &= Q(status=False)

        return queryset.filter(filters)

    def get_sensores_unificados(self):
        """
        Obtém lista unificada de sensores e leituras, adicionando campo 'sensor' para as leituras.
        """
        sensores = list(Sensor.objects.all().values())
        temperaturas = list(Temperatura.objects.all().values())
        umidades = list(Umidade.objects.all().values())
        contadores = list(Contador.objects.all().values())
        luminosidades = list(Luminosidade.objects.all().values())

        temperaturas = [{**item, 'sensor': 'Temperatura'} for item in temperaturas]
        umidades = [{**item, 'sensor': 'Umidade'} for item in umidades]
        contadores = [{**item, 'sensor': 'Contador'} for item in contadores]
        luminosidades = [{**item, 'sensor': 'Luminosidade'} for item in luminosidades]

        return sensores + temperaturas + umidades + contadores + luminosidades

    @action(detail=False, methods=['post'], url_path='upload')
    def process_upload(self, request):
        """
        Processa upload de arquivo Excel ou CSV contendo dados de sensores e leituras.
        Cria ou atualiza sensores e cria leituras específicas.
        """
        try:
            uploaded_file = request.FILES.get('file')
            if not uploaded_file:
                return Response({"error": "Nenhum arquivo enviado."}, status=400)

            if uploaded_file.name.endswith(('.xlsx', '.xls')):
                df = pd.read_excel(uploaded_file)
            elif uploaded_file.name.endswith('.csv'):
                df = pd.read_csv(uploaded_file)
            else:
                return Response({"error": "Formato de arquivo não suportado."}, status=400)

            required = ['sensor', 'mac_address', 'unidade_medida', 'latitude', 'longitude', 'status', 'timestamp']
            missing = [c for c in required if c not in df.columns]
            if missing:
                return Response({"error": f"Colunas ausentes: {missing}"}, status=400)

            model_map = {
                "umidade": Umidade,
                "contador": Contador,
                "luminosidade": Luminosidade,
                "temperatura": Temperatura
            }

            created_count = 0
            updated_count = 0
            leitura_count = 0
            ignored_count = 0
            errors = []

            for idx, row in df.iterrows():
                try:
                    sensor_type = str(row['sensor']).strip().lower()
                    model = model_map.get(sensor_type)
                    if not model:
                        errors.append(f"Linha {idx + 2}: sensor '{sensor_type}' desconhecido.")
                        continue

                    # Parse do timestamp com microsegundos e timezone-aware
                    try:
                        ts = pd.to_datetime(row['timestamp'], format="%Y-%m-%dT%H:%M:%S.%f", errors='raise')
                    except Exception:
                        raise ValueError("Timestamp inválido no formato esperado: 'AAAA-MM-DDTHH:MM:SS.microsegundos'")

                    if timezone.is_naive(ts):
                        ts = timezone.make_aware(ts, timezone.get_default_timezone())

                    # Converte status para booleano
                    status_val = row['status']
                    if isinstance(status_val, str):
                        status_val = status_val.strip().lower() in ['true', '1', 'ativo', 'yes', 'sim']
                    else:
                        status_val = bool(status_val)

                    sensor_obj, was_created = Sensor.objects.get_or_create(
                        mac_address=row['mac_address'],
                        sensor=row['sensor'],
                        defaults={
                            'unidade_medida': row['unidade_medida'],
                            'latitude': row['latitude'],
                            'longitude': row['longitude'],
                            'status': status_val,
                            'timestamp': ts
                        }
                    )

                    if was_created:
                        created_count += 1
                    else:
                        sensor_obj.unidade_medida = row['unidade_medida']
                        sensor_obj.latitude = row['latitude']
                        sensor_obj.longitude = row['longitude']
                        sensor_obj.status = status_val
                        sensor_obj.timestamp = ts
                        sensor_obj.save()
                        updated_count += 1

                    valor = row.get(sensor_type, None)
                    leitura = model.objects.create(
                        sensor=sensor_obj,
                        mac_address=row['mac_address'],
                        unidade_medida=row['unidade_medida'],
                        latitude=row['latitude'],
                        longitude=row['longitude'],
                        status=status_val,
                        timestamp=ts,
                        **{sensor_type: valor if pd.notnull(valor) else None}
                    )
                    leitura_count += 1

                except Exception as e:
                    errors.append(f"Linha {idx + 2}: erro ao processar - {str(e)}")

            result = {
                'message': (
                    f'Importação concluída. Sensores criados: {created_count}, '
                    f'atualizados: {updated_count}, leituras criadas: {leitura_count}, '
                    f'leituras ignoradas: {ignored_count}'
                )
            }

            if errors:
                result['errors'] = errors
                return Response(result, status=207)

            return Response(result)

        except Exception as e:
            tb = traceback.format_exc()
            return Response({"error": str(e), "traceback": tb}, status=500)

    @action(detail=False, methods=['get'], url_path='export_sensors')
    def export_sensors(self, request):
        """
        Exporta dados unificados dos sensores em arquivo Excel para download.
        """
        try:
            sensores_unificados = self.get_sensores_unificados()

            # Ajusta timestamp para string iso
            for s in sensores_unificados:
                ts = s.get('timestamp')
                if ts and not isinstance(ts, str):
                    try:
                        s['timestamp'] = ts.isoformat()
                    except Exception:
                        s['timestamp'] = str(ts)

            df = pd.DataFrame(sensores_unificados)
            output = BytesIO()
            with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
                df.to_excel(writer, index=False, sheet_name='Sensores Unificados')

            output.seek(0)
            response = HttpResponse(
                output.read(),
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = 'attachment; filename="sensores_unificados.xlsx"'
            return response

        except Exception as e:
            tb = traceback.format_exc()
            return Response({"error": str(e), "traceback": tb}, status=500)


# ViewSet para gerenciar dados das leituras dos sensores
class DadoSensorViewSet(viewsets.ModelViewSet):
    queryset = DadoSensor.objects.all()
    serializer_class = DadoSensorSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['sensor', 'temperatura', 'luminosidade', 'umidade', 'contador']
    search_fields = ['sensor__nome']
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser])
    def importar_planilha(self, request):
        """
        Importa leituras de sensores a partir de arquivo Excel ou CSV.
        Parâmetro tipo_sensor obrigatório para saber qual modelo utilizar.
        """
        tipo_sensor = request.query_params.get('tipo_sensor')
        arquivo_excel = request.FILES.get('file')

        if not tipo_sensor:
            return Response({"detail": "Parâmetro 'tipo_sensor' é obrigatório na query string."},
                            status=status.HTTP_400_BAD_REQUEST)

        if not arquivo_excel:
            return Response({"detail": "Arquivo não enviado."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if arquivo_excel.name.endswith('.csv'):
                df = pd.read_csv(arquivo_excel)
            else:
                df = pd.read_excel(arquivo_excel)
        except Exception as e:
            return Response({"detail": f"Erro ao ler o arquivo: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        colunas_necessarias = {
            'umidade': {'sensor', 'mac_address', 'unidade_medida', 'latitude', 'longitude', 'status'},
            'temperatura': {'sensor', 'mac_address', 'unidade_medida', 'valor', 'latitude', 'longitude', 'status', 'timestamp'},
            'luminosidade': {'sensor', 'mac_address', 'unidade_medida', 'valor', 'latitude', 'longitude', 'status', 'timestamp'},
            'contador': {'sensor', 'mac_address', 'unidade_medida', 'latitude', 'longitude', 'status'},
        }

        if tipo_sensor not in colunas_necessarias:
            return Response({"detail": f"Tipo de sensor '{tipo_sensor}' não suportado."}, status=status.HTTP_400_BAD_REQUEST)

        colunas_presentes = set(col.lower() for col in df.columns)
        colunas_obrigatorias = colunas_necessarias[tipo_sensor]
        colunas_faltando = colunas_obrigatorias - colunas_presentes

        if colunas_faltando:
            return Response({"detail": f"Colunas obrigatórias ausentes: {colunas_faltando}"}, status=status.HTTP_400_BAD_REQUEST)

        sensores_criados_ou_atualizados = []
        leituras_criadas = []
        erros = []

        for _, row in df.iterrows():
            try:
                mac = row.get('mac_address') or row.get('MAC_ADDRESS')
                if not mac:
                    raise ValueError("mac_address não encontrado na linha")

                sensor, created = Sensor.objects.update_or_create(
                    mac_address=mac,
                    defaults={
                        'nome': row.get('sensor'),
                        'tipo': tipo_sensor,
                        'unidade_medida': row.get('unidade_medida'),
                        'latitude': row.get('latitude'),
                        'longitude': row.get('longitude'),
                        'status': str(row.get('status')).lower() in ['true', 'ativo', '1']
                    }
                )
                sensores_criados_ou_atualizados.append(mac)

                valor = row.get('valor')
                timestamp = row.get('timestamp')

                leitura_kwargs = {
                    'sensor': sensor,
                    'timestamp': timestamp if pd.notnull(timestamp) else timezone.now()
                }

                # Define o valor correto de acordo com o tipo do sensor
                if tipo_sensor == 'temperatura':
                    leitura_kwargs['temperatura'] = valor
                elif tipo_sensor == 'umidade':
                    leitura_kwargs['umidade'] = valor
                elif tipo_sensor == 'luminosidade':
                    leitura_kwargs['luminosidade'] = valor
                elif tipo_sensor == 'contador':
                    leitura_kwargs['contador'] = valor

                if valor is not None and pd.notnull(valor):
                    DadoSensor.objects.create(**leitura_kwargs)
                    leituras_criadas.append(leitura_kwargs)

            except Exception as e:
                erros.append(str(e))

        if erros:
            return Response({
                "detail": "Erros durante a importação dos dados",
                "errors": erros
            }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "detail": f"Importação concluída com sucesso.",
            "sensores_atualizados": sensores_criados_ou_atualizados,
            "leituras_criadas": len(leituras_criadas)
        })


# View para download das leituras DadoSensor em planilha Excel
class DownloadDadoSensorPlanilhaView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        dados = DadoSensor.objects.all()

        df = pd.DataFrame(list(dados.values(
            'id', 'sensor_id', 'temperatura', 'luminosidade', 'umidade', 'contador', 'timestamp'
        )))

        output = BytesIO()
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            df.to_excel(writer, index=False, sheet_name='DadosSensor')

        output.seek(0)
        response = HttpResponse(
            output,
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename="dados_sensor.xlsx"'
        return response


# ViewSet para gerenciar histórico dos sensores
class HistoricoViewSet(viewsets.ModelViewSet):
    queryset = Historico.objects.all()
    serializer_class = HistoricoSerializer

    def get_queryset(self):
        """
        Permite filtrar histórico por sensor e/ou ambiente via query params.
        """
        queryset = Historico.objects.all()
        sensor = self.request.query_params.get('sensor')
        ambiente = self.request.query_params.get('ambiente')

        if sensor:
            queryset = queryset.filter(sensor__icontains=sensor)
        if ambiente:
            queryset = queryset.filter(ambiente__icontains=ambiente)

        return queryset

    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser], url_path='upload')
    def upload(self, request):
        """
        Importa dados históricos a partir de arquivo Excel.
        """
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'Arquivo não enviado.'}, status=400)

        try:
            df = pd.read_excel(file)

            for _, row in df.iterrows():
                sensor = row.get("sensor")
                ambiente = row.get("ambiente")
                valor = row.get("valor")
                timestamp = row.get("timestamp")

                if not (sensor and ambiente and valor and timestamp):
                    continue 

                Historico.objects.create(
                    sensor=sensor,
                    ambiente=ambiente,
                    valor=valor,
                    timestamp=timestamp
                )

            return Response({'message': 'Importação concluída!'}, status=201)

        except Exception as e:
            return Response({'error': str(e)}, status=500)

    @action(detail=False, methods=['get'], url_path='export')
    def export(self, request):
        """
        Exporta dados históricos filtrados em planilha Excel.
        """
        queryset = self.get_queryset().values('sensor', 'ambiente', 'valor', 'timestamp')
        df = pd.DataFrame(list(queryset))

        if not df.empty and 'timestamp' in df.columns:
            df['timestamp'] = pd.to_datetime(df['timestamp']).dt.tz_localize(None).dt.strftime('%Y-%m-%d %H:%M:%S')

        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename=historico.xlsx'
        df.to_excel(response, index=False)

        return response
