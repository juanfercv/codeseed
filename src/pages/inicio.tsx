import React from "react";
import { motion } from "framer-motion";
import logo from "../assets/logoimagen.png";

export default function Inicio() {
  return (
    <div className="inicio-container">
      <motion.img
        src={logo}
        alt="Codeseed Logo"
        className="inicio-logo"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
      />

      <motion.h1
        className="inicio-title"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        Bienvenido a <span className="highlight">CodeSeed</span>
      </motion.h1>

      <motion.p
        className="inicio-text"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        Aprende programación de manera interactiva y práctica. Explora retos, 
        lecciones y actividades hechas especialmente para impulsar tu camino 
        como desarrollador.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <a href="/login">
          <button className="inicio-button">
            Ir al Login
          </button>
        </a>
      </motion.div>
    </div>
  );
}
