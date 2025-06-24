import React, { useEffect, useState, useRef } from 'react';
import './Sensores.css'; // seu CSS geral
import Footer from '../../Components/Footer/Footer';
import Header from '../../Components/Header/Header';
import ModalNovoSensor from '../../Components/ModalNovoSensor/ModalNovoSensor';
import { FiSearch, FiEdit, FiTrash2 } from 'react-icons/fi';
import api from '../../api'; // sua instância axios configurada

const Sensores = () => {
  const [sensores, setSensores] = useState([]);
  const [statusFiltro, setStatusFiltro] = useState('');
  const [macFiltro, setMacFiltro] = useState('');
  const [categoriasFiltro, setCategoriasFiltro] = useState([]);
  const [menuPlanilhaAberto, setMenuPlanilhaAberto] = useState(false);
  const [modalNovoSensorAberta, setModalNovoSensorAberta] = useState(false);
  const [sensorSelecionado, setSensorSelecionado] = useState(null);
  const [tipoSensorSelecionado, setTipoSensorSelecionado] = useState('');

  // PAGINAÇÃO
  const [paginaAtual, setPaginaAtual] = useState(1);
  const linhasPorPagina = 12;

  const categoriasFixas = ['Contador', 'Temperatura', 'Umidade', 'Luminosidade'];

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchSensores();
  }, []);

  const fetchSensores = async () => {
    try {
      const response = await api.get('sensores_unificados/'); // url correta relativa ao baseURL
      if (Array.isArray(response.data)) {
        setSensores(response.data);
      } else if (Array.isArray(response.data.results)) {
        setSensores(response.data.results);
      } else {
        setSensores([]);
      }
    } catch (error) {
      console.error('Erro ao buscar sensores:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`sensores/${id}/`); // delete direto na URL /sensores/{id}/
      setSensores(sensores.filter(sensor => sensor.id !== id));
    } catch (error) {
      alert('Erro ao deletar sensor.');
    }
  };

  const handleFilterClear = () => {
    setMacFiltro('');
    setCategoriasFiltro([]);
    setStatusFiltro('');
  };

  const handleImportClick = (tipoSensor) => {
    if (!tipoSensor) {
      alert('Selecione um tipo de sensor para importar.');
      return;
    }
    setTipoSensorSelecionado(tipoSensor);
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }, 0);
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post(
        `/sensores/upload/?upload_type=${tipoSensorSelecionado.trim()}`, // url correta
        formData
      );

      alert('Importação concluída!');
      fetchSensores();
    } catch (error) {
      if (error.response) {
        alert(`Erro ao importar sensores: ${JSON.stringify(error.response.data)}`);
      } else {
        alert('Erro ao importar sensores.');
      }
    } finally {
      event.target.value = '';
      setTipoSensorSelecionado('');
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('sensores/export_sensors/', { responseType: 'blob' }); // usa api para pegar o blob

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sensores_exportados.xlsx');

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(error.message || 'Erro ao exportar a planilha');
    }
  };

  const statusAtivo = (status) => {
    if (typeof status === 'string') return status.toLowerCase() === 'ativo';
    if (typeof status === 'number') return status === 1;
    if (typeof status === 'boolean') return status;
    return false;
  };

  // Filtrar sensores
  const sensoresFiltrados = sensores.filter(sensor => {
    const macOk =
      !macFiltro ||
      (sensor.mac_address &&
        sensor.mac_address.toLowerCase().includes(macFiltro.toLowerCase()));

    const statusOk =
      !statusFiltro ||
      (statusAtivo(sensor.status) ? statusFiltro === 'ativo' : statusFiltro === 'inativo');

    const categoriaOk =
      categoriasFiltro.length === 0 ||
      categoriasFiltro.some(
        cat => cat.toLowerCase() === (sensor.tipo ? sensor.tipo.toLowerCase() : sensor.sensor.toLowerCase())
      );

    return macOk && statusOk && categoriaOk;
  });

  // Paginação: calcula sensores da página atual
  const totalPaginas = Math.ceil(sensoresFiltrados.length / linhasPorPagina);
  const indiceUltimaLinha = paginaAtual * linhasPorPagina;
  const indicePrimeiraLinha = indiceUltimaLinha - linhasPorPagina;
  const sensoresPaginaAtual = sensoresFiltrados.slice(indicePrimeiraLinha, indiceUltimaLinha);

  return (
    <>
      <Header />
      <div className="sensores-background" />

      <div className="sensores-page">
        <div className="filtros">
          <h2 className="filtros-title">Sensores</h2>
          <div className="filtros-subtitle">Filtrar por</div>

          <div className="filtro-item filtro-mac">
            <label className="filtro-label-mac">Mac Address:</label>
            <div className="input-mac-wrapper">
              <input
                type="text"
                placeholder="Pesquisar por Mac Address..."
                value={macFiltro}
                onChange={e => setMacFiltro(e.target.value)}
              />
            </div>
          </div>

          <div className="filtro-item filtro-categoria">
            <div className="filtro-label-categoria">Categoria:</div>
            {categoriasFixas.map(cat => (
              <label key={cat} className="checkbox-label checkbox-categoria">
                <input
                  type="checkbox"
                  checked={categoriasFiltro.includes(cat)}
                  onChange={() => {
                    if (categoriasFiltro.includes(cat)) {
                      setCategoriasFiltro(categoriasFiltro.filter(c => c !== cat));
                    } else {
                      setCategoriasFiltro([...categoriasFiltro, cat]);
                    }
                  }}
                />
                {cat}
              </label>
            ))}
          </div>

          <div className="filtro-item filtro-status">
            <div className="filtro-label-status">Status:</div>
            <label className="checkbox-label checkbox-status">
              <input
                type="radio"
                name="status"
                value="ativo"
                checked={statusFiltro === 'ativo'}
                onChange={e => setStatusFiltro(e.target.value)}
              />
              {' '}Ativo
            </label>
            <label className="checkbox-label checkbox-status">
              <input
                type="radio"
                name="status"
                value="inativo"
                checked={statusFiltro === 'inativo'}
                onChange={e => setStatusFiltro(e.target.value)}
              />
              {' '}Inativo
            </label>
          </div>

          <button className="btn-limpar" onClick={handleFilterClear}>
            X Limpar
          </button>
        </div>

        <main className="conteudo-sensores">
          <div className="conteudo-header">
            <div className="menu-superior" style={{ marginLeft: 'auto' }}>
              <div className="dropdown">
                <button onClick={() => setMenuPlanilhaAberto(!menuPlanilhaAberto)}>Planilha ▾</button>
                {menuPlanilhaAberto && (
                  <div className="dropdown-menu">
                    <div style={{ padding: '8px', fontWeight: 'bold' }}>Importar:</div>
                    <button onClick={() => handleImportClick('temperatura')}>Importar Temperatura</button>
                    <button onClick={() => handleImportClick('umidade')}>Importar Umidade</button>
                    <button onClick={() => handleImportClick('contador')}>Importar Contador</button>
                    <button onClick={() => handleImportClick('luminosidade')}>Importar Luminosidade</button>
                    <div style={{ borderTop: '1px solid #ccc', marginTop: '5px', paddingTop: '5px' }}>
                      <button onClick={handleExport}>Exportar</button>
                    </div>
                  </div>
                )}
              </div>
              <button
                className="novo-sensor"
                onClick={() => {
                  setSensorSelecionado(null);
                  setModalNovoSensorAberta(true);
                }}
              >
                Novo Sensor +
              </button>
            </div>
          </div>

          <div className="tabela-wrapper">
            <table className="tabela-sensores">
              <thead>
                <tr>
                  <th>Categoria</th>
                  <th>Mac Address</th>
                  <th>Latitude</th>
                  <th>Longitude</th>
                  <th>Status</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {sensoresPaginaAtual.map(sensor => (
                  <tr key={sensor.id}>
                    <td>{sensor.sensor}</td>
                    <td>{sensor.mac_address}</td>
                    <td>{sensor.latitude || '-'}</td>
                    <td>{sensor.longitude || '-'}</td>
                    <td className={statusAtivo(sensor.status) ? 'ativo' : 'inativo'}>
                      {statusAtivo(sensor.status) ? 'Ativo' : 'Inativo'}
                    </td>
                    <td className="acoes">
                      <button
                        className="btn-editar"
                        onClick={() => {
                          setSensorSelecionado(sensor);
                          setModalNovoSensorAberta(true);
                        }}
                      >
                        <FiEdit />
                      </button>
                      <button
                        className="btn-excluir"
                        onClick={() => {
                          if (window.confirm('Deseja realmente excluir esse sensor?')) {
                            handleDelete(sensor.id);
                          }
                        }}
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINAÇÃO */}
          <div className="sensores-pagination">
            <button
              onClick={() => setPaginaAtual(paginaAtual - 1)}
              disabled={paginaAtual === 1}
              className="sensores-pagination-btn"
            >
              Anterior
            </button>

            <span className="sensores-pagination-info">
              Página {paginaAtual} de {totalPaginas}
            </span>

            <button
              onClick={() => setPaginaAtual(paginaAtual + 1)}
              disabled={paginaAtual === totalPaginas}
              className="sensores-pagination-btn"
            >
              Próxima
            </button>
          </div>
        </main>

        {modalNovoSensorAberta && (
          <ModalNovoSensor
            sensor={sensorSelecionado}
            onClose={() => setModalNovoSensorAberta(false)}
            onCreate={() => fetchSensores()}
            onUpdate={() => fetchSensores()}
          />
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx, .xls"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      <Footer />
    </>
  );
};

export default Sensores;
