import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import logo from "../assets/logoimagen.png";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Guardamos la respuesta completa
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    // data.session contiene el access_token y refreshtoken
    if (data.session) {
      // Sesión activa, redirigimos al área interna
      navigate("/app/lessons");
    } else {
      setError("No se pudo iniciar sesión");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card-animated fade-in">
        <img src={logo} alt="CodeSeed" className="auth-logo" />
        <h2 className="auth-title">Iniciar sesión</h2>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="error">{error}</p>}

          <button type="submit" className="auth-btn">
            Entrar
          </button>
        </form>

        <p className="register-text">
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </p>
      </div>
    </div>
  );
}
