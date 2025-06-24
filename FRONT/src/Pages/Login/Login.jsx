import { Link, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import './Login.css';
import nexusImg from '../../assets/nexus-city.png';
import { FaUser, FaLock } from 'react-icons/fa';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:8000/api/token/', formData); 
      const token = response.data.access;
      localStorage.setItem('token', token);
      alert('Login realizado com sucesso!');
      navigate('/home');
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 400) {
        alert('Usuário ou senha incorretos.');
      } else {
        alert('Erro ao tentar fazer login. Tente novamente mais tarde.');
      }
    }
  };

  return (
    <div className="login-background">
      <div className="login-container">
        <div className="login-box">
          <div className="login-image">
            <img src={nexusImg} alt="Nexus City" />
          </div>
          <form className="login-form" onSubmit={handleSubmit}>
            <h2>LOGIN</h2>
            <div className="input-group">
              <FaUser className="icon" />
              <input
                type="text"
                name="username"
                placeholder="Usuário"
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
            <button type="submit" className="login-button">ENTRAR</button>
            <div className="signup">
              Novo por aqui? <Link to="/cadastro">Fazer Cadastro</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
