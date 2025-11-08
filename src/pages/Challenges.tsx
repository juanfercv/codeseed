import React, { useState } from "react";
import { FaSkull, FaStar, FaRocket } from "react-icons/fa";

interface Challenge {
  id: number;
  title: string;
  description: string;
  difficulty: "Fácil" | "Medio" | "Difícil";
}

export default function Challenges() {
  const [completed, setCompleted] = useState<number[]>([]);

  const challenges: Challenge[] = [
    { id: 1, title: "Hola Mundo", description: "Imprime un mensaje en la consola.", difficulty: "Fácil" },
    { id: 2, title: "Números Pares", description: "Muestra los números pares del 1 al 50.", difficulty: "Fácil" },
    { id: 3, title: "Sumatoria", description: "Calcula la suma de los elementos de un arreglo.", difficulty: "Medio" },
    { id: 4, title: "Palíndromo", description: "Verifica si una palabra se lee igual al revés.", difficulty: "Medio" },
    { id: 5, title: "Código Infernal", description: "Descifra una cadena secreta usando bucles.", difficulty: "Difícil" },
  ];

  const toggleComplete = (id: number) => {
    if (!completed.includes(id)) setCompleted([...completed, id]);
  };

  return (
    <div className="container text-center my-5 fade-in">
      <h1 className="fw-bold mb-3" style={{ color: "#3f51b5" }}>
        🌱 Retos de CodeSeed
      </h1>
      <p className="text-muted mb-5">
        Avanza nivel por nivel completando los retos y gana experiencia.
      </p>

      <div className="d-flex flex-wrap justify-content-center align-items-center gap-4 challenge-path">
        {challenges.map((ch, index) => (
          <div
            key={ch.id}
            className={`challenge-node card-animated ${ch.difficulty.toLowerCase()} ${
              completed.includes(ch.id) ? "completed" : ""
            }`}
            onClick={() => toggleComplete(ch.id)}
          >
            {ch.difficulty === "Difícil" ? (
              <FaSkull className="icon" />
            ) : ch.difficulty === "Medio" ? (
              <FaRocket className="icon" />
            ) : (
              <FaStar className="icon" />
            )}
            <h5 className="mt-2 mb-1">{ch.title}</h5>
            <small>{ch.description}</small>
            <span className="level-number">#{index + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
