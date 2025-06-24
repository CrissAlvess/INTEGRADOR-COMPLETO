import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Login from './Pages/Login/Login'
import Cadastro from './Pages/Cadastro/Cadastro'
import Home from './Pages/Home/Home'
import Ambientes from './Pages/Ambientes/Ambientes'
import Sensores from './Pages/Sensores/Sensores'
import Historico from './Pages/Historico/Historico'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/home" element={<Home />} />
        <Route path="/ambientes" element={<Ambientes />} />
        <Route path="/sensores" element={<Sensores />} />
        <Route path="/historico" element={<Historico />} />
      </Routes>
    </Router>
  )
}

export default App
