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
  const [validationErrors, setValidationErrors] = useState({
    name: "",
    password: "",
    confirmPassword: ""
  });

  // Validaciones
  const validateName = (name: string) => {
    if (name.length < 5) return "El nombre debe tener al menos 5 caracteres";
    if (name.length > 50) return "El nombre no puede exceder 50 caracteres";
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name)) return "El nombre solo puede contener letras y espacios";
    return "";
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres";
    if (password.length > 25) return "La contraseña no puede exceder 25 caracteres";
    if (!/(?=.*[a-z])(?=.*[A-Z])/.test(password)) return "Debe contener al menos una mayúscula y una minúscula";
    if (!/(?=.*\d)/.test(password)) return "Debe contener al menos un número";
    if (!/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(password)) {
      return "Debe contener al menos un carácter especial (!@#$%^&* etc.)";
    }
    return "";
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    
    if (value) {
      setValidationErrors(prev => ({
        ...prev,
        name: validateName(value)
      }));
    } else {
      setValidationErrors(prev => ({
        ...prev,
        name: ""
      }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    
    if (value) {
      setValidationErrors(prev => ({
        ...prev,
        password: validatePassword(value)
      }));
    } else {
      setValidationErrors(prev => ({
        ...prev,
        password: ""
      }));
    }

    if (confirmPassword) {
      setValidationErrors(prev => ({
        ...prev,
        confirmPassword: value !== confirmPassword ? "Las contraseñas no coinciden" : ""
      }));
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    
    if (value && password) {
      setValidationErrors(prev => ({
        ...prev,
        confirmPassword: value !== password ? "Las contraseñas no coinciden" : ""
      }));
    } else {
      setValidationErrors(prev => ({
        ...prev,
        confirmPassword: ""
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const nameError = validateName(name);
    const passwordError = validatePassword(password);
    const confirmError = password !== confirmPassword ? "Las contraseñas no coinciden" : "";

    if (nameError || passwordError || confirmError) {
      setValidationErrors({
        name: nameError,
        password: passwordError,
        confirmPassword: confirmError
      });
      return;
    }

    if (!name || !email || !password || !confirmPassword) {
      setError("Todos los campos son obligatorios");
      return;
    }

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            name: name.trim()
          }
        }
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      navigate("/app/lessons");
    } catch (err) {
      setError("Error inesperado al crear la cuenta");
    }
  };

  const isFormValid = 
    name.length >= 5 && 
    name.length <= 50 &&
    password.length >= 8 && 
    password.length <= 25 &&
    password === confirmPassword &&
    !validationErrors.name &&
    !validationErrors.password &&
    !validationErrors.confirmPassword;

  return (
    <div className="auth-page">
      <div className="auth-card card-animated fade-in">
        <img src={logo} alt="CodeSeed" className="auth-logo" />
        <h2 className="auth-title">Crear cuenta</h2>

        <form onSubmit={handleSubmit} className="register-form">
          {/* Campo Nombre */}
          <div className="input-group">
            <div className="input-header">
              <input
                type="text"
                placeholder="Nombre completo (mín. 5)"
                value={name}
                onChange={handleNameChange}
                required
                minLength={5}
                maxLength={50}
                className={validationErrors.name ? "error-input" : ""}
              />
              <span className="character-count">{name.length}/50</span>
            </div>
            {validationErrors.name && (
              <span className="field-error">{validationErrors.name}</span>
            )}
          </div>

          {/* Campo Email */}
          <div className="input-group, input-header">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Campo Contraseña */}
          <div className="input-group">
            <div className="input-header">
              <input
                type="password"
                placeholder="Contraseña (mín. 8 carac)"
                value={password}
                onChange={handlePasswordChange}
                required
                minLength={8}
                maxLength={25}
                className={validationErrors.password ? "error-input" : ""}
              />
              <span className="character-count">{password.length}/25</span>
            </div>
            {validationErrors.password && (
              <span className="field-error">{validationErrors.password}</span>
            )}
          </div>

          {/* Campo Confirmar Contraseña */}
          <div className="input-group, input-header">
            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              required
              className={validationErrors.confirmPassword ? "error-input" : ""}
            />
            {validationErrors.confirmPassword && (
              <span className="field-error">{validationErrors.confirmPassword}</span>
            )}
          </div>

          {error && <p className="error">{error}</p>}

          <button 
            type="submit" 
            className={`auth-btn ${!isFormValid ? "btn-disabled" : ""}`}
            disabled={!isFormValid}
          >
            Registrarme
          </button>
        </form>

        <p className="login-text">
          ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}