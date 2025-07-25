# Generated by Django 5.1 on 2025-06-13 17:42

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api_smart', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='dadosensor',
            name='ambiente',
        ),
        migrations.RemoveField(
            model_name='dadosensor',
            name='timestamp',
        ),
        migrations.RemoveField(
            model_name='sensor',
            name='valor',
        ),
        migrations.AlterField(
            model_name='ambiente',
            name='ni',
            field=models.CharField(default='SN00000', max_length=100),
        ),
        migrations.AlterField(
            model_name='ambiente',
            name='responsavel',
            field=models.CharField(max_length=100),
        ),
        migrations.AlterField(
            model_name='ambiente',
            name='sig',
            field=models.CharField(max_length=50),
        ),
        migrations.AlterField(
            model_name='dadosensor',
            name='sensor',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api_smart.sensor'),
        ),
        migrations.AlterField(
            model_name='sensor',
            name='latitude',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='sensor',
            name='longitude',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='sensor',
            name='mac_address',
            field=models.CharField(max_length=100),
        ),
        migrations.AlterField(
            model_name='sensor',
            name='status',
            field=models.CharField(max_length=20),
        ),
        migrations.AlterField(
            model_name='sensor',
            name='timestamp',
            field=models.DateTimeField(),
        ),
        migrations.AlterField(
            model_name='sensor',
            name='unidade_medida',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.CreateModel(
            name='contador',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('contador', models.IntegerField(blank=True, null=True)),
                ('mac_address', models.CharField(blank=True, max_length=100, null=True)),
                ('unidade_medida', models.CharField(blank=True, max_length=50, null=True)),
                ('latitude', models.FloatField(blank=True, null=True)),
                ('longitude', models.FloatField(blank=True, null=True)),
                ('status', models.CharField(blank=True, max_length=20, null=True)),
                ('timestamp', models.DateTimeField(blank=True, null=True)),
                ('sensor', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api_smart.sensor')),
            ],
        ),
        migrations.CreateModel(
            name='luminosidade',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('luminosidade', models.FloatField(blank=True, null=True)),
                ('mac_address', models.CharField(blank=True, max_length=100, null=True)),
                ('unidade_medida', models.CharField(blank=True, max_length=50, null=True)),
                ('latitude', models.FloatField(blank=True, null=True)),
                ('longitude', models.FloatField(blank=True, null=True)),
                ('status', models.CharField(blank=True, max_length=20, null=True)),
                ('timestamp', models.DateTimeField(blank=True, null=True)),
                ('sensor', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api_smart.sensor')),
            ],
        ),
        migrations.CreateModel(
            name='temperatura',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('temperatura', models.FloatField(blank=True, null=True)),
                ('mac_address', models.CharField(blank=True, max_length=100, null=True)),
                ('unidade_medida', models.CharField(blank=True, max_length=50, null=True)),
                ('latitude', models.FloatField(blank=True, null=True)),
                ('longitude', models.FloatField(blank=True, null=True)),
                ('status', models.CharField(blank=True, max_length=20, null=True)),
                ('timestamp', models.DateTimeField(blank=True, null=True)),
                ('sensor', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api_smart.sensor')),
            ],
        ),
        migrations.CreateModel(
            name='umidade',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('umidade', models.FloatField(blank=True, null=True)),
                ('mac_address', models.CharField(blank=True, max_length=100, null=True)),
                ('unidade_medida', models.CharField(blank=True, max_length=50, null=True)),
                ('latitude', models.FloatField(blank=True, null=True)),
                ('longitude', models.FloatField(blank=True, null=True)),
                ('status', models.CharField(blank=True, max_length=20, null=True)),
                ('timestamp', models.DateTimeField(blank=True, null=True)),
                ('sensor', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api_smart.sensor')),
            ],
        ),
    ]
