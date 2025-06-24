import React, { useEffect, useState } from 'react';
import './Header.css';
import { NavLink, useNavigate } from 'react-router-dom';

import logoImg from '../../assets/logo.png';
import historyImg from '../../assets/history.png';
import logoutImg from '../../assets/logout.png';

function Header() {
  const navigate = useNavigate();
  const [isTop, setIsTop] = useState(true);

  useEffect(() => {
    function onScroll() {
      setIsTop(window.scrollY === 0);
    }

    window.addEventListener('scroll', onScroll);
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* Placeholder para manter o layout quando o header estiver visível */}
      {isTop && <div className="HeaderPlaceholder" />}

      <header className={`Header ${isTop ? 'visible' : 'hidden'}`}>
        <div className="Logo">
          <img src={logoImg} alt="NexusCity" />
        </div>

        <nav className="Nav">
          <NavLink to="/sensores" className={({ isActive }) => (isActive ? 'active' : '')}>
            Sensores
          </NavLink>
          <NavLink to="/home" className={({ isActive }) => (isActive ? 'active' : '')}>
            Página Inicial
          </NavLink>
          <NavLink to="/ambientes" className={({ isActive }) => (isActive ? 'active' : '')}>
            Ambientes
          </NavLink>
        </nav>

        <div className="Icons">
          <div className="IconHistory">
            <img src={historyImg} alt="Histórico" onClick={() => navigate('/historico')} />
          </div>
          <div className="IconLogout">
            <img src={logoutImg} alt="Sair" onClick={() => navigate('/login')} />
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;
