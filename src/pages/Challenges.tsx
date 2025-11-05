import React, { useState } from "react";

interface Challenge {
  id: number;
  title: string;
  description: string;
  difficulty: "Fácil" | "Medio" | "Difícil";
}

export default function Challenges() {
  const [completed, setCompleted] = useState<number[]>([]);

  const challenges: Challenge[] = [
    {
      id: 1,
      title: "Imprimir tu nombre",
      description: "Escribe un programa que muestre tu nombre en consola.",
      difficulty: "Fácil",
    },
    {
      id: 2,
      title: "Números Pares",
      description: "Crea un programa que muestre los números pares del 1 al 50.",
      difficulty: "Fácil",
    },
    {
      id: 3,
      title: "Suma de Arreglo",
      description: "Dado un arreglo de números, calcula la suma total.",
      difficulty: "Medio",
    },
    {
      id: 4,
      title: "Palíndromo",
      description: "Determina si una palabra es un palíndromo o no.",
      difficulty: "Medio",
    },
    {
      id: 5,
      title: "Juego de Adivinanza",
      description: "Crea un juego que adivine un número secreto entre 1 y 100.",
      difficulty: "Difícil",
    },
  ];

  const handleComplete = (id: number) => {
    if (!completed.includes(id)) {
      setCompleted([...completed, id]);
      alert(`¡Completaste el reto #${id}! 🎉`);
    }
  };

  return (
    <div className="challenges-container">
      <h1>Retos de Programación</h1>
      <p className="challenges-subtitle">
        Pon a prueba tus conocimientos completando los retos de CodeSeed.
      </p>

      <div className="challenges-grid">
        {challenges.map((challenge) => (
          <div
            key={challenge.id}
            className={`challenge-card ${
              completed.includes(challenge.id) ? "completed" : ""
            }`}
          >
            <div className="challenge-header">
              <h3>{challenge.title}</h3>
              <span className={`tag ${challenge.difficulty.toLowerCase()}`}>
                {challenge.difficulty}
              </span>
            </div>
            <p>{challenge.description}</p>

            <button
              className="btn"
              onClick={() => handleComplete(challenge.id)}
              disabled={completed.includes(challenge.id)}
            >
              {completed.includes(challenge.id) ? "Completado ✅" : "Intentar reto"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
