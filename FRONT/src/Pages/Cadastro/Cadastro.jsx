import { Link, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import './cadastro.css';
import nexusImg from '../../assets/nexus-city.png';
import { FaUser, FaLock } from 'react-icons/fa';
import axios from 'axios';

const Cadastro = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      await axios.post('http://localhost:8000/api/signup/', formData);
      alert('Cadastro realizado com sucesso!');
      navigate('/login');
    } catch (error) {
      const msg = error.response?.data?.username?.[0] || 'Erro ao cadastrar usuário.';
      alert(msg);
    }
  };

  return (
    <>
      <div className="cadastro-background"></div>

      <div className="cadastro-container">
        <div className="cadastro-box">
          <div className="cadastro-image">
            <img src={nexusImg} alt="Nexus City" />
          </div>

          <form className="cadastro-form" onSubmit={handleSubmit}>
            <h2>CADASTRO</h2>

            <div className="input-group">
              <FaUser className="icon" />
              <input
                type="text"
                name="username"
                placeholder="Nome de Usuário"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <FaLock className="icon" />
              <input
                type="password"
                name="password"
                placeholder="Senha"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="cadastro-button">CADASTRAR</button>

            <div className="login-redirect">
              Já tem conta? <Link to="/login">Fazer Login</Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Cadastro;
