import { useEffect, useState } from "react";
import { FaSkull, FaStar, FaRocket, FaLock } from "react-icons/fa";
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: challengesData } = await supabase
        .from("challenges")
        .select("*")
        .order("id", { ascending: true });

      if (challengesData) setChallenges(challengesData as Challenge[]);

      const { data: progressData } = await supabase
        .from("user_challenge_progress")
        .select("challenge_id")
        .eq("user_id", user.id)
        .eq("completed", true);

      if (progressData) {
        const completedIDs = progressData.map((p) => p.challenge_id);
        setCompleted(completedIDs);
      }
    };

    fetchChallenges();
  }, []);

  const handleSelectChallenge = (index: number, id: string) => {
    const previousChallengeId = challenges[index - 1]?.id;

    // Si NO es el primer reto y el anterior NO está completado → bloquear
    if (index > 0 && !completed.includes(previousChallengeId)) {
      return alert("Debes completar el reto anterior antes de avanzar.");
    }

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

      <div className="challenge-path">
        {challenges.map((ch, index) => {
          const isCompleted = completed.includes(ch.id);
          const previousChallengeId = challenges[index - 1]?.id;

          const isLocked =
            index > 0 && !completed.includes(previousChallengeId);

          return (
            <div
              key={ch.id}
              className={`challenge-node card-animated ${ch.difficulty.toLowerCase()} 
                ${isCompleted ? "completed" : ""} 
                ${isLocked ? "locked" : "unlocked"}`}
              onClick={() => !isLocked && handleSelectChallenge(index, ch.id)}
            >
              {isLocked ? (
                <FaLock className="icon lock-icon" />
              ) : ch.difficulty === "Difícil" ? (
                <FaSkull className="icon" />
              ) : ch.difficulty === "Medio" ? (
                <FaRocket className="icon" />
              ) : (
                <FaStar className="icon" />
              )}

              <h5>{ch.title}</h5>
              <small>{ch.description}</small>

              <span className="level-number">#{index + 1}</span>

              {isCompleted && (
                <span className="completed-badge">✔ Completado</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
