import React, { useState, useEffect } from 'react';
import api from '../../api';
import './ModalNovoSensor.css';

export default function ModalNovoSensor({ onClose, onCreate, onUpdate, sensor }) {
  const [tipo, setTipo] = useState('');
  const [status, setStatus] = useState('ativo');

  const [macAddress, setMacAddress] = useState('');
  const [unidadeMedida, setUnidadeMedida] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [timestamp, setTimestamp] = useState('');

  // Estado para armazenar erros de validação
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (sensor) {
      setTipo(sensor.sensor || '');
      setStatus(sensor.status ? 'ativo' : 'inativo');
      setMacAddress(sensor.mac_address || '');
      setUnidadeMedida(sensor.unidade_medida || '');
      setLatitude(sensor.latitude ?? '');
      setLongitude(sensor.longitude ?? '');
      setTimestamp(sensor.timestamp || '');
    } else {
      setTipo('');
      setStatus('ativo');
      setMacAddress('');
      setUnidadeMedida('');
      setLatitude('');
      setLongitude('');
      setTimestamp('');
    }
    setErrors({});
  }, [sensor]);

  // Função de validação simples
  const validate = () => {
    const newErrors = {};

    if (!tipo) newErrors.tipo = 'Selecione o tipo do sensor.';
    if (!macAddress) {
      newErrors.macAddress = 'MAC Address é obrigatório.';
    } else {
      // validação simples de MAC Address (formato básico)
      const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
      if (!macRegex.test(macAddress)) newErrors.macAddress = 'MAC Address inválido. Formato esperado: XX:XX:XX:XX:XX:XX';
    }
    if (!unidadeMedida) newErrors.unidadeMedida = 'Unidade de Medida é obrigatória.';
    if (latitude === '') {
      newErrors.latitude = 'Latitude é obrigatória.';
    } else if (isNaN(Number(latitude)) || Number(latitude) < -90 || Number(latitude) > 90) {
      newErrors.latitude = 'Latitude deve ser um número entre -90 e 90.';
    }
    if (longitude === '') {
      newErrors.longitude = 'Longitude é obrigatória.';
    } else if (isNaN(Number(longitude)) || Number(longitude) < -180 || Number(longitude) > 180) {
      newErrors.longitude = 'Longitude deve ser um número entre -180 e 180.';
    }
    if (!timestamp) {
    newErrors.timestamp = 'Timestamp é obrigatório.';
    } else {
      const ts = timestamp.trim();
      const tsRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{1,6}$/;
      if (!tsRegex.test(ts)) {
        newErrors.timestamp = 'Timestamp deve ter o formato AAAA-MM-DDTHH:MM:SS.microsegundos (ex: 2025-04-09T14:03:42.887428)';
      }
    }


    if (!status) newErrors.status = 'Selecione o status.';

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return; // se tem erro, não envia

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Você precisa estar logado.');
      return;
    }

    const payload = {
      sensor: tipo,
      mac_address: macAddress,
      unidade_medida: unidadeMedida,
      latitude: latitude !== '' ? Number(latitude) : null,
      longitude: longitude !== '' ? Number(longitude) : null,
      status: status,
      timestamp,
    };

    try {
      let response;
      if (sensor && sensor.id) {
        response = await api.put(`sensores/${sensor.id}/`, payload);
        alert('Sensor atualizado com sucesso!');
        onUpdate(response.data);
      } else {
        response = await api.post('sensores/', payload);
        alert('Sensor criado com sucesso!');
        onCreate(response.data);
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar sensor:', error);
      const errs = error.response?.data;
      alert(JSON.stringify(errs, null, 2));
    }
  };

  return (
    <div className="modal-sensor-overlay">
      <div className="modal-sensor">
        <h2>{sensor ? 'Editar Sensor' : 'Novo Sensor'}</h2>
        <form onSubmit={handleSubmit} noValidate>
          <label>
            Tipo:
            <select value={tipo} onChange={e => setTipo(e.target.value)} required>
              <option value="">Selecione o Tipo</option>
              <option value="temperatura">Temperatura</option>
              <option value="umidade">Umidade</option>
              <option value="luminosidade">Luminosidade</option>
              <option value="contador">Contador</option>
            </select>
          </label>
          {errors.tipo && <div className="error-message">{errors.tipo}</div>}

          <label>
            MAC Address:
            <input
              placeholder="XX:XX:XX:XX:XX:XX"
              value={macAddress}
              onChange={e => setMacAddress(e.target.value)}
              required
            />
          </label>
          {errors.macAddress && <div className="error-message">{errors.macAddress}</div>}

          <label>
            Unidade de Medida:
            <input
              placeholder="Ex: ºC, %, lux"
              value={unidadeMedida}
              onChange={e => setUnidadeMedida(e.target.value)}
              required
            />
          </label>
          {errors.unidadeMedida && <div className="error-message">{errors.unidadeMedida}</div>}

          <label>
            Latitude:
            <input
              placeholder="Ex: -22.906847"
              type="number"
              step="any"
              value={latitude}
              onChange={e => setLatitude(e.target.value)}
              required
            />
          </label>
          {errors.latitude && <div className="error-message">{errors.latitude}</div>}

          <label>
            Longitude:
            <input
              placeholder="Ex: -43.172896"
              type="number"
              step="any"
              value={longitude}
              onChange={e => setLongitude(e.target.value)}
              required
            />
          </label>
          {errors.longitude && <div className="error-message">{errors.longitude}</div>}

          <label>
            Timestamp:
            <input
              placeholder="2025-06-09T14:30:00.000000"
              type="text"
              value={timestamp}
              onChange={e => setTimestamp(e.target.value)}
              required
            />
          </label>
          {errors.timestamp && <div className="error-message">{errors.timestamp}</div>}

          <label>
            Status:
            <select value={status} onChange={e => setStatus(e.target.value)} required>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </label>
          {errors.status && <div className="error-message">{errors.status}</div>}

          <div className="buttons-container">
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit">{sensor ? 'Atualizar' : 'Salvar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
