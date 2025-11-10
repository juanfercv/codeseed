import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient"; // Asegúrate de que esta importación sea correcta

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  /**
   * Maneja el cierre de sesión:
   * 1. Llama a supabase.auth.signOut() para invalidar la sesión.
   * 2. Redirige al usuario a la página de inicio/login.
   */
  const handleLogout = async () => {
    // IMPORTANTE: Hemos quitado window.confirm().
    // En una aplicación real, usa un modal o alerta personalizado para confirmar.
    
    try {
      // 1. Cerrar sesión en Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Error al cerrar sesión:", error.message);
        // Aquí podrías mostrar un mensaje de error al usuario
        return;
      }

      // 2. Redirigir al inicio (Login) y reemplazar la entrada del historial.
      // Cuando el usuario haga clic en 'Salir' y sea redirigido a '/',
      // esta acción NO guardará la página anterior (/app/...) en el historial.
      navigate("/", { replace: true });

    } catch (e) {
      console.error("Fallo durante el cierre de sesión:", e);
    }
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
          
          <span className="fw-bold fs-5">CodeSeed</span>
        </div>

        {/* Botón Hamburguesa */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          
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

            {/* Botón de Salir */}
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