# Generated by Django 5.2.3 on 2025-06-19 23:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api_smart', '0003_alter_sensor_timestamp'),
    ]

    operations = [
        migrations.CreateModel(
            name='Historico',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('sensor', models.CharField(max_length=100)),
                ('ambiente', models.CharField(max_length=100)),
                ('valor', models.DecimalField(decimal_places=2, max_digits=10)),
                ('timestamp', models.DateTimeField()),
            ],
        ),
    ]
