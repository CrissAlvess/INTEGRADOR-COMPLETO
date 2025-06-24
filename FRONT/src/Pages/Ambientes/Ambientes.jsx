import React, { useEffect, useState, useRef } from 'react';
import api from '../../api';
import AmbienteCard from '../../Components/AmbienteCard/AmbienteCard';
import ModalNovoAmbiente from '../../Components/ModalNovoAmbiente/ModalNovoAmbiente';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';
import { FiSearch } from 'react-icons/fi';
import './Ambientes.css';

export default function Ambientes() {
  const [ambientes, setAmbientes] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [ambienteSelecionado, setAmbienteSelecionado] = useState(null);
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 9; // 3 colunas x 3 linhas
  const inputFileRef = useRef(null);
  const dropdownRef = useRef(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    api.get('ambientes/', {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => {
      const dados = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.results)
          ? res.data.results
          : [];
      setAmbientes(dados);
    })
    .catch(() => alert('Erro ao carregar ambientes. Tente novamente mais tarde.'));
  }, [token]);

  useEffect(() => {
    function handleClickFora(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownAberto(false);
      }
    }
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  const ambientesFiltrados = ambientes.filter((ambiente) =>
    ambiente.sig?.toLowerCase().includes(filtro.trim().toLowerCase())
  );

  const indexUltimoItem = paginaAtual * itensPorPagina;
  const indexPrimeiroItem = indexUltimoItem - itensPorPagina;
  const ambientesPaginaAtual = ambientesFiltrados.slice(indexPrimeiroItem, indexUltimoItem);

  const totalPaginas = Math.ceil(ambientesFiltrados.length / itensPorPagina);

  const irParaPaginaAnterior = () => {
    setPaginaAtual((prev) => Math.max(prev - 1, 1));
  };

  const irParaProximaPagina = () => {
    setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas));
  };

  useEffect(() => {
    setPaginaAtual(1);
  }, [filtro]);

  const handleDelete = (id) => {
    setAmbientes((prev) => prev.filter((amb) => amb.id !== id));
  };

  const handleCreate = (novoAmbiente) => {
    setAmbientes((prev) => [...prev, novoAmbiente]);
  };

  const handleUpdate = (ambienteAtualizado) => {
    setAmbientes((prev) =>
      prev.map((amb) => (amb.id === ambienteAtualizado.id ? ambienteAtualizado : amb))
    );
  };

  const exportarPlanilha = () => {
    if (ambientes.length === 0) {
      alert('Nenhum dado para exportar.');
      return;
    }

    const csvHeader = Object.keys(ambientes[0]).join(',') + '\n';
    const csvRows = ambientes.map(amb =>
      Object.values(amb).map(v => `"${v}"`).join(',')
    ).join('\n');

    const csvContent = csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ambientes_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importarPlanilha = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    api.post('ambientes/importar_planilha/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    })
    .then(() => {
      alert('Planilha importada com sucesso!');
      return api.get('ambientes/', { headers: { Authorization: `Bearer ${token}` } });
    })
    .then((res) => {
      const dados = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.results)
          ? res.data.results
          : [];
      setAmbientes(dados);
    })
    .catch((err) => {
      alert('Erro ao importar a planilha: ' + (err.response?.data?.detail || err.message));
    });

    setDropdownAberto(false);
    event.target.value = null;
  };

  return (
    <>
      <Header />
      <div className="ambientes-background" />

      <main className="ambientes-container" role="main">
        <h1 className="ambientes-title">Ambientes</h1>

        <div className="ambientes-header">
          <div className="ambientes-input-wrapper">
            <input
              type="text"
              placeholder="Pesquise algo..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="ambientes-input"
              autoComplete="off"
            />
            <FiSearch className="ambientes-search-icon" />
          </div>

          <button
            className="ambientes-button"
            onClick={() => {
              setAmbienteSelecionado(null);
              setModalAberto(true);
            }}
            style={{ marginLeft: 20 }}
          >
            <span className="ambientes-button-text">Novo Ambiente +</span>
          </button>

          <div
            className="planilha-button-wrapper"
            ref={dropdownRef}
            style={{ position: 'relative', display: 'inline-block', marginLeft: 20 }}
          >
            <button
              className="planilha-button"
              onClick={() => setDropdownAberto((prev) => !prev)}
              type="button"
              aria-haspopup="true"
              aria-expanded={dropdownAberto}
            >
              <span className="planilha-button-text">Planilha ▼</span>
            </button>

            {dropdownAberto && (
              <div className="planilha-dropdown-menu">
                <label htmlFor="import-file" className="planilha-dropdown-item">
                  Importar planilha
                </label>
                <input
                  type="file"
                  id="import-file"
                  ref={inputFileRef}
                  style={{ display: 'none' }}
                  accept=".xlsx, .xls"
                  onChange={importarPlanilha}
                />
                <button
                  className="planilha-dropdown-item"
                  onClick={exportarPlanilha}
                  type="button"
                >
                  Exportar planilha
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="ambientes-grid">
          {ambientesPaginaAtual.length > 0 ? (
            ambientesPaginaAtual.map((amb) => (
              <AmbienteCard
                key={amb.id}
                ambiente={amb}
                onDelete={handleDelete}
                onEdit={(ambiente) => {
                  setAmbienteSelecionado(ambiente);
                  setModalAberto(true);
                }}
              />
            ))
          ) : (
            <p>Nenhum ambiente encontrado.</p>
          )}
        </div>

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="pagination">
            <button
              onClick={irParaPaginaAnterior}
              disabled={paginaAtual === 1}
              type="button"
            >
              ‹ Anterior
            </button>
            <span>
              Página {paginaAtual} de {totalPaginas}
            </span>
            <button
              onClick={irParaProximaPagina}
              disabled={paginaAtual === totalPaginas}
              type="button"
            >
              Próxima ›
            </button>
          </div>
        )}

        {modalAberto && (
          <ModalNovoAmbiente
            ambiente={ambienteSelecionado}
            onClose={() => setModalAberto(false)}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
          />
        )}
      </main>

      <Footer />
    </>
  );
}
