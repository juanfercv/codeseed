import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import logo from "../assets/logoimagen.png"; // Asegúrate de que esté en /src/assets/

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error al cerrar sesión:", error.message);
        return;
      }
      navigate("/", { replace: true });
    } catch (e) {
      console.error("Fallo durante el cierre de sesión:", e);
    }
  };

  return (
    <nav
      className="navbar navbar-expand-lg px-3"
      style={{
        background:
          "linear-gradient(90deg, rgba(26,35,126,0.95), rgba(63,81,181,0.9))",
        backdropFilter: "blur(10px)",
        boxShadow: "0 4px 25px rgba(0,0,0,0.4)",
      }}
    >
      <div className="container-fluid">
        {/* Logo */}
        <div
          className="navbar-brand d-flex align-items-center gap-2"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/app/lessons")}
        >
          <img
            src={logo}
            alt="CodeSeed Logo"
            style={{
              width: "38px",
              height: "38px",
              objectFit: "contain",
              filter: "drop-shadow(0 0 4px rgba(130,177,255,0.6))",
            }}
          />
          <span
            className="fw-bold fs-5"
            style={{
              color: "#b3e5fc",
              textShadow: "0 0 8px rgba(130,177,255,0.4)",
            }}
          >
            CodeSeed
          </span>
        </div>

        {/* Botón Hamburguesa */}
        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          style={{
            background: "transparent",
            color: "#b3e5fc",
            fontSize: "1.5rem",
            outline: "none",
          }}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        {/* Enlaces */}
        <div
          className={`collapse navbar-collapse ${menuOpen ? "show" : ""}`}
          id="navbarNav"
        >
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 d-flex align-items-center gap-3">
            <li className="nav-item">
              <Link
                className="nav-link fw-semibold"
                style={{ color: "#e3f2fd" }}
                to="/app/lessons"
              >
                Lecciones
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link fw-semibold"
                style={{ color: "#e3f2fd" }}
                to="/app/challenges"
              >
                Retos
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link fw-semibold"
                style={{ color: "#e3f2fd" }}
                to="/app/progress"
              >
                Progreso
              </Link>
            </li>

            {/* Botón de Salir */}
            <li className="nav-item">
              <button
                onClick={handleLogout}
                className="btn btn-sm fw-semibold"
                style={{
                  background:
                    "linear-gradient(90deg, #ff6f61, #f44336)",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                  boxShadow: "0 0 12px rgba(244,67,54,0.4)",
                  transition: "transform 0.3s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
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
