import { useEffect, useState } from "react";
import { FaSkull, FaStar, FaRocket } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

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
      // 👉 1. Obtener usuario logueado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 👉 2. Obtener todos los challenges
      const { data: challengesData } = await supabase
        .from("challenges")
        .select("*");

      if (challengesData) setChallenges(challengesData as Challenge[]);

      // 👉 3. Obtener progreso del usuario
      const { data: progressData } = await supabase
        .from("user_challenge_progress")
        .select("challenge_id")
        .eq("user_id", user.id)
        .eq("completed", true);

      // 👉 4. Guardar solo los IDs completados
      if (progressData) {
        const completedIDs = progressData.map((p) => p.challenge_id);
        setCompleted(completedIDs);
      }
    };

    fetchChallenges();
  }, []);

  const handleSelectChallenge = (id: string) => {
    navigate(`/app/challenges/${id}`);
  };

  return (
    <div className="container text-center my-5 fade-in">
      <h1 className="fw-bold mb-3" style={{ color: "#e8e2e2ff" }}>
        Retos de CodeSeed
      </h1>

      <p
        className="mb-5"
        style={{
          color: "#e3f2fd",
          textShadow: "0 0 10px rgba(130,177,255,0.4)",
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

            {completed.includes(ch.id) && (
              <span className="completed-badge">✔ Completado</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
