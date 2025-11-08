import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaLeaf, FaBars } from "react-icons/fa";

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    const confirmLogout = window.confirm("¿Deseas cerrar sesión?");
    if (confirmLogout) navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-3">
      <div className="container-fluid">
        {/* Logo */}
        <div
          className="navbar-brand d-flex align-items-center gap-2"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/app/lessons")}
        >
          <FaLeaf color="lightgreen" size={22} />
          <span className="fw-bold fs-5">CodeSeed</span>
        </div>

        {/* Botón Hamburguesa */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <FaBars />
        </button>

        {/* Enlaces */}
        <div
          className={`collapse navbar-collapse ${menuOpen ? "show" : ""}`}
          id="navbarNav"
        >
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 d-flex align-items-center gap-3">
            <li className="nav-item">
              <Link className="nav-link" to="/app/lessons">
                Lecciones
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/app/challenges">
                Retos
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/app/progress">
                Progreso
              </Link>
            </li>

            {/* ÚNICO botón de Salir */}
            <li className="nav-item">
              <button
                onClick={handleLogout}
                className="btn btn-danger btn-sm ms-lg-3"
              >
                Salir
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
