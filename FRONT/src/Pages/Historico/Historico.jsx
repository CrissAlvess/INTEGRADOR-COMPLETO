import React, { useState, useEffect, useRef } from 'react';
import './Historico.css';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';
import api from '../../api';

const Historico = () => {
  const [historico, setHistorico] = useState([]);
  const [filtroSensor, setFiltroSensor] = useState(false);
  const [filtroAmbiente, setFiltroAmbiente] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const fileInputRef = useRef(null);

  const [paginaAtual, setPaginaAtual] = useState(1);
  const linhasPorPagina = 10;

  useEffect(() => {
    fetchHistorico();
  }, [filtroSensor, filtroAmbiente]);

  const fetchHistorico = async () => {
    try {
      const params = {};
      if (filtroSensor) params.sensor = 1;     // Valor fixo apenas para ativar o filtro
      if (filtroAmbiente) params.ambiente = 1; // Valor fixo apenas para ativar o filtro

      const response = await api.get('/historico/', { params });
      console.log('Dados do histórico:', response.data);

      const data = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data.results)
        ? response.data.results
        : [];

      setHistorico(data);
      setPaginaAtual(1); 
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      setHistorico([]);
    }
  };

  const handleLimparFiltros = () => {
    setFiltroSensor(false);
    setFiltroAmbiente(false);
  };

  const handleExportar = async () => {
    try {
      const response = await api.get('/historico/export/', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'historico_exportado.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Erro ao exportar planilha');
    }
  };

  const handleImportar = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/historico/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Importação concluída!');
      fetchHistorico();
    } catch (error) {
      alert('Erro ao importar planilha');
      console.error(error);
    } finally {
      e.target.value = '';
    }
  };

  // Paginação
  const totalPaginas = Math.ceil(historico.length / linhasPorPagina);
  const indiceUltimaLinha = paginaAtual * linhasPorPagina;
  const indicePrimeiraLinha = indiceUltimaLinha - linhasPorPagina;
  const historicoPaginaAtual = historico.slice(indicePrimeiraLinha, indiceUltimaLinha);

  return (
    <>
      <Header />
      <div className="historico-background" />

      <div className="historico-container">
        {/* Sidebar */}
        <aside className="historico-filtro">
          <h2>Historico</h2>
          <div className="filtro-label">Filtrar por</div>

          <div className="filtro-checkbox">
            <span>Categoria:</span>
            <label>
              <input
                type="checkbox"
                checked={filtroSensor}
                onChange={() => setFiltroSensor(!filtroSensor)}
              />
              Sensor
            </label>
            <label>
              <input
                type="checkbox"
                checked={filtroAmbiente}
                onChange={() => setFiltroAmbiente(!filtroAmbiente)}
              />
              Ambiente
            </label>
          </div>

          <button className="btn-limpar" onClick={handleLimparFiltros}>
            X Limpar
          </button>
        </aside>

        {/* Conteúdo */}
        <main className="historico-conteudo">
          <div className="dropdown-planilha">
            <button onClick={() => setMenuAberto(!menuAberto)}>Planilha ▾</button>
            {menuAberto && (
              <div className="dropdown-menu">
                <button onClick={handleImportar}>Importar Planilha</button>
                <button onClick={handleExportar}>Exportar Planilha</button>
              </div>
            )}
          </div>

          <div className="tabela-wrapper">
            <table className="tabela-historico">
              <thead>
                <tr>
                  <th>Sensor</th>
                  <th>Ambiente</th>
                  <th>Valor</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {historicoPaginaAtual.length > 0 ? (
                  historicoPaginaAtual.map((item, index) => (
                    <tr key={index}>
                      <td>{item.sensor}</td>
                      <td>{item.ambiente}</td>
                      <td>{item.valor}</td>
                      <td>{item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">Nenhum dado encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          <div className="historico-paginacao">
            <button
              onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
              disabled={paginaAtual === 1}
              className="historico-paginacao-btn"
            >
              Anterior
            </button>

            <span className="historico-paginacao-info">
              Página {paginaAtual} de {totalPaginas || 1}
            </span>

            <button
              onClick={() => setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))}
              disabled={paginaAtual === totalPaginas || totalPaginas === 0}
              className="historico-paginacao-btn"
            >
              Próxima
            </button>
          </div>
        </main>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept=".xls, .xlsx"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <Footer />
    </>
  );
};

export default Historico;
