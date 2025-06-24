from django.db import models

class Ambiente(models.Model):
    sig = models.CharField(max_length=50) 
    descricao = models.CharField(max_length=100)
    ni = models.CharField(max_length=100, default='SN00000')
    responsavel = models.CharField(max_length=100)

    def __str__(self):
        return self.sig 


class Sensor(models.Model):
    sensor = models.CharField(max_length=100)
    mac_address = models.CharField(max_length=100)
    unidade_medida = models.CharField(max_length=50, blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    status = models.CharField(max_length=20)
    timestamp = models.DateTimeField(blank=True, null=True) 

    def __str__(self):
        return self.sensor


class Umidade(models.Model):
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE)
    umidade = models.FloatField(blank=True, null=True)

    mac_address = models.CharField(max_length=100, blank=True, null=True)
    unidade_medida = models.CharField(max_length=50, blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    status = models.CharField(max_length=20, blank=True, null=True)
    timestamp = models.DateTimeField(blank=True, null=True)


class Contador(models.Model):
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE)
    contador = models.IntegerField(blank=True, null=True)

    mac_address = models.CharField(max_length=100, blank=True, null=True)
    unidade_medida = models.CharField(max_length=50, blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    status = models.CharField(max_length=20, blank=True, null=True)
    timestamp = models.DateTimeField(blank=True, null=True)


class Luminosidade(models.Model):
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE)
    luminosidade = models.FloatField(blank=True, null=True)

    mac_address = models.CharField(max_length=100, blank=True, null=True)
    unidade_medida = models.CharField(max_length=50, blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    status = models.CharField(max_length=20, blank=True, null=True)
    timestamp = models.DateTimeField(blank=True, null=True)


class Temperatura(models.Model):
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE)
    temperatura = models.FloatField(blank=True, null=True)

    mac_address = models.CharField(max_length=100, blank=True, null=True)
    unidade_medida = models.CharField(max_length=50, blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    status = models.CharField(max_length=20, blank=True, null=True)
    timestamp = models.DateTimeField(blank=True, null=True)


class DadoSensor(models.Model):
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE)
    temperatura = models.FloatField(blank=True, null=True)
    umidade = models.FloatField(blank=True, null=True)
    luminosidade = models.FloatField(blank=True, null=True)
    contador = models.IntegerField(blank=True, null=True)

    def __str__(self):
        return f"{self.sensor.sensor} - {self.sensor.timestamp}"


class Historico(models.Model):
    sensor = models.CharField(max_length=100)
    ambiente = models.CharField(max_length=100)
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    timestamp = models.DateTimeField()

    def __str__(self):
        return f"{self.sensor} - {self.ambiente} - {self.timestamp} - {self.valor}"
