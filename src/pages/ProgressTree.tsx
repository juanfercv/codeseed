import { useState } from "react";

interface Node {
  id: number;
  title: string;
  type: "Lección" | "Reto";
  completed: boolean;
}

export default function ProgressTree() {
  const [nodes, setNodes] = useState<Node[]>([
    { id: 1, title: "Introducción", type: "Lección", completed: true },
    { id: 2, title: "Variables", type: "Lección", completed: true },
    { id: 3, title: "Estructuras de Control", type: "Lección", completed: false },
    { id: 4, title: "Reto: Números Pares", type: "Reto", completed: false },
    { id: 5, title: "Funciones", type: "Lección", completed: false },
    { id: 6, title: "Reto: Palíndromo", type: "Reto", completed: false },
  ]);

  const toggleComplete = (id: number) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, completed: !n.completed } : n
      )
    );
  };

  return (
    <div className="progress-container">
      <h1>Árbol de Progreso</h1>
      <p className="progress-subtitle">
        Visualiza tus avances en las lecciones y retos de CodeSeed.
      </p>

      <div className="tree">
        {nodes.map((node, index) => (
          <div
            key={node.id}
            className={`tree-node ${node.completed ? "done" : ""}`}
            onClick={() => toggleComplete(node.id)}
          >
            <div className="node-content">
              <h3>{node.title}</h3>
              <span className={`badge ${node.type === "Lección" ? "lesson" : "challenge"}`}>
                {node.type}
              </span>
            </div>

            {index < nodes.length - 1 && <div className="connector" />}
          </div>
        ))}
      </div>
    </div>
  );
}
