import React, { useState, useEffect } from 'react';
import api from '../../api';
import './ModalNovoAmbiente.css';

export default function ModalNovoAmbiente({ onClose, onCreate, onUpdate, ambiente }) {
  const [descricao, setDescricao] = useState('');
  const [sig, setSig] = useState('');
  const [ni, setNi] = useState('');
  const [responsavel, setResponsavel] = useState('');

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (ambiente) {
      setDescricao(ambiente.descricao || '');
      setSig(ambiente.sig || '');
      setNi(ambiente.ni || '');
      setResponsavel(ambiente.responsavel || '');
    }
  }, [ambiente]);

  const validate = () => {
    const newErrors = {};

    if (!sig.trim()) {
      newErrors.sig = 'SIG é obrigatório.';
    } else if (!/^\d+$/.test(sig.trim())) {
      newErrors.sig = 'SIG deve conter apenas números.';
    }

    if (!descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória.';
    } else if (!/^[A-Z\s]+$/.test(descricao.trim())) {
      newErrors.descricao = 'Descrição deve conter apenas letras maiúsculas e espaços.';
    }

    if (ni.trim() && !/^[A-Z0-9]+$/.test(ni.trim())) {
      newErrors.ni = 'NI deve conter apenas letras maiúsculas e números, sem espaços.';
    }

    if (responsavel.trim() && !/^[A-Z\s]+$/.test(responsavel.trim())) {
      newErrors.responsavel = 'Responsável deve conter apenas letras maiúsculas e espaços.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Você precisa estar logado.');
      return;
    }

    const payload = { descricao, sig, ni, responsavel };

    try {
      if (ambiente) {
        const response = await api.put(`http://127.0.0.1:8000/api/ambientes/${ambiente.id}/`, payload);
        alert('Ambiente atualizado com sucesso!');
        onUpdate(response.data);
      } else {
        const response = await api.post('ambientes/', payload);
        alert('Ambiente criado com sucesso!');
        onCreate(response.data);
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar ambiente:', error);
      const message = error.response?.data?.detail || 'Erro ao salvar. Tente novamente.';
      alert(message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{ambiente ? 'Editar Ambiente' : 'Novo Ambiente'}</h2>
        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="sig">SIG</label>
          <input
            id="sig"
            type="text"
            placeholder="Apenas números, ex: 20400001"
            value={sig}
            onChange={(e) => setSig(e.target.value.toUpperCase())}
            aria-describedby="sig-error"
            required
          />
          {errors.sig && <span id="sig-error" className="error-message">{errors.sig}</span>}

          <label htmlFor="descricao">Descrição</label>
          <input
            id="descricao"
            type="text"
            placeholder="Letras maiúsculas, ex: DIRETORIA"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value.toUpperCase())}
            aria-describedby="descricao-error"
            required
          />
          {errors.descricao && <span id="descricao-error" className="error-message">{errors.descricao}</span>}

          <label htmlFor="ni">NI</label>
          <input
            id="ni"
            type="text"
            placeholder="ex: SN75422"
            value={ni}
            onChange={(e) => setNi(e.target.value.toUpperCase())}
            aria-describedby="ni-error"
          />
          {errors.ni && <span id="ni-error" className="error-message">{errors.ni}</span>}

          <label htmlFor="responsavel">Responsável</label>
          <input
            id="responsavel"
            type="text"
            placeholder="ex: CESAR AUGUSTO DA COSTA"
            value={responsavel}
            onChange={(e) => setResponsavel(e.target.value.toUpperCase())}
            aria-describedby="responsavel-error"
          />
          {errors.responsavel && <span id="responsavel-error" className="error-message">{errors.responsavel}</span>}

          <div className="buttons-container">
            <button type="submit">{ambiente ? 'Atualizar' : 'Salvar'}</button>
            <button type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
