import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    const confirmLogout = window.confirm("¿Deseas cerrar sesión?");
    if (confirmLogout) navigate("/");
  };

  return (
    <header className="navbar">
      <div className="nav-logo" onClick={() => navigate("/app/lessons")}>
        <h2>🌱 CodeSeed</h2>
      </div>

      <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
        <Link to="/app/lessons" onClick={() => setMenuOpen(false)}>
          Lecciones
        </Link>
        <Link to="/app/challenges" onClick={() => setMenuOpen(false)}>
          Retos
        </Link>
        <Link to="/app/progress" onClick={() => setMenuOpen(false)}>
          Progreso
        </Link>
        <button className="btn-logout-mobile" onClick={handleLogout}>
          Salir
        </button>
      </nav>

      <div className="nav-right">
        <button className="btn-logout" onClick={handleLogout}>
          Salir
        </button>

        <div
          className={`menu-toggle ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </header>
  );
}
