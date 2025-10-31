import React from "react";

interface CardLessonProps {
  title: string;
  summary: string;
}

export default function CardLesson({ title, summary }: CardLessonProps) {
  const handleClick = () => {
    alert(`Abrir lección: ${title}`);
  };

  return (
    <div className="lesson-card" onClick={handleClick}>
      <h3>{title}</h3>
      <p>{summary}</p>
      <button className="btn">Ver lección</button>
    </div>
  );
}
