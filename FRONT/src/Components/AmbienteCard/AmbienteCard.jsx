// AmbienteCard.jsx
import React from 'react';
import './AmbienteCard.css';
import editarIcon from '../../assets/edit-icon.png';
import api from '../../api';

export default function AmbienteCard({ ambiente, onDelete, onEdit }) {
  const excluirAmbiente = async () => {
    try {
      await api.delete(`ambientes/${ambiente.id}/`);
      alert(`Ambiente "${ambiente.descricao}" excluído com sucesso.`);
      if (onDelete) onDelete(ambiente.id);
    } catch (error) {
      console.error('Erro ao excluir ambiente:', error);
      alert('Erro ao excluir o ambiente. Tente novamente.');
    }
  };

  const editarAmbiente = () => {
    if (onEdit) {
      onEdit(ambiente);
    } else {
      alert(`Funcionalidade editar ainda não implementada para "${ambiente.descricao}"`);
    }
  };

  return (
    <div className="ambiente-card">
      <div className="ambiente-header">
        <h3>{ambiente.descricao || 'Sem descrição'}</h3>
        <img
          src={editarIcon}
          alt="Editar"
          className="editar-icon"
          onClick={editarAmbiente}
          style={{ cursor: 'pointer', width: 70, height: 40, position: 'relative', left: 15 }}
        />
      </div>
      <div className="ambiente-info">
        <p><strong>SIG:</strong> {ambiente.sig || '---'}</p>
        <p><strong>NI:</strong> {ambiente.ni || '---'}</p>
        <p><strong>Responsável:</strong> {ambiente.responsavel || '---'}</p>
      </div>
      <button className="excluir-btn" onClick={excluirAmbiente}>
        Excluir
      </button>
    </div>
  );
}
