import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import logo from "../assets/logoimagen.png";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name } // <-- Guarda el nombre del usuario
      }
    });

    if (error) {
      setError(error.message);
      return;
    }

    navigate("/app/lessons");
  };

  return (
    <div className="auth-page">
      <div className="auth-card card-animated fade-in">
        <img src={logo} alt="CodeSeed" className="auth-logo" />
        <h2 className="auth-title">Crear cuenta</h2>

        <form onSubmit={handleSubmit} className="register-form">
          <input
            type="text"
            placeholder="Nombre completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

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

          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {error && <p className="error">{error}</p>}

          <button type="submit" className="auth-btn">
            Registrarme
          </button>
        </form>

        <p className="login-text">
          ¿Ya tienes una cuenta? <Link to="/">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
