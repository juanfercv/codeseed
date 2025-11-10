import { useEffect, useState } from "react";
import { FaSkull, FaStar, FaRocket } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient"; // Asegúrate de tenerlo configurado

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: "Fácil" | "Medio" | "Difícil";
  points: number;
}

export default function Challenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChallenges = async () => {
      const { data, error } = await supabase.from("challenges").select("*");
      if (!error && data) setChallenges(data as Challenge[]);
    };
    fetchChallenges();
  }, []);

  const handleSelectChallenge = (id: string) => {
    navigate(`/app/challenges/${id}`); // Redirige al editor
  };

  return (
    <div className="container text-center my-5 fade-in">
      <h1 className="fw-bold mb-3" style={{ color: "#e8e2e2ff" }}>
        Retos de CodeSeed
      </h1>
      <p
        className="mb-5"
        style={{
          color: "#e3f2fd", // azul claro suave
          textShadow: "0 0 10px rgba(130,177,255,0.4)", // leve brillo
          fontSize: "1em",
        }}
      >
        Avanza nivel por nivel completando los retos y gana experiencia.
      </p>

      <div className="d-flex flex-wrap justify-content-center align-items-center gap-4 challenge-path">
        {challenges.map((ch, index) => (
          <div
            key={ch.id}
            className={`challenge-node card-animated ${ch.difficulty.toLowerCase()} ${
              completed.includes(ch.id) ? "completed" : ""
            }`}
            onClick={() => handleSelectChallenge(ch.id)}
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
