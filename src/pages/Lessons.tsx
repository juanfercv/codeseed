import React from "react";
import CardLesson from "../components/CardLesson";

export default function Lessons() {
  const lessons = [
    {
      id: 1,
      title: "Introducción a la Programación",
      summary: "Aprende los conceptos básicos: variables, tipos y operadores.",
    },
    {
      id: 2,
      title: "Estructuras de Control",
      summary: "Descubre cómo usar condicionales y bucles para controlar el flujo.",
    },
    {
      id: 3,
      title: "Funciones",
      summary: "Organiza tu código en bloques reutilizables llamados funciones.",
    },
    {
      id: 4,
      title: "Arreglos y Objetos",
      summary: "Manipula múltiples datos con arreglos y objetos.",
    },
  ];

  return (
    <div className="lessons-container">
      <h1>Lecciones de CodeSeed</h1>
      <p className="lessons-subtitle">
        Explora los fundamentos de la programación con lecciones interactivas.
      </p>

      <div className="lessons-grid">
        {lessons.map((lesson) => (
          <CardLesson
            key={lesson.id}
            title={lesson.title}
            summary={lesson.summary}
          />
        ))}
      </div>
    </div>
  );
}
