import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { FaRocket, FaBrain, FaLaptopCode } from "react-icons/fa";

type Lesson = {
  id: string;
  title: string;
  summary: string;
};

export default function Lessons() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLessons = async () => {
      const { data, error } = await supabase.from("lessons").select("*");
      if (error) console.error("Error fetching lessons:", error);
      setLessons(data || []);
      setLoading(false);
    };
    fetchLessons();
  }, []);

  if (loading) return <p>Cargando...</p>;

  const icons = [<FaRocket />, <FaBrain />, <FaLaptopCode />];

  return (
    <div className="lessons-container fade-in">
      <h1 className="lessons-title">Lecciones</h1>
      <p className="lessons-subtitle">
        Aprende, experimenta y mejora tus habilidades paso a paso.
      </p>

      <div className="lessons-grid">
        {lessons.map((lesson, index) => {
          const icon = icons[index % icons.length];
          return (
            <div
              key={lesson.id}
              className="lesson-card card-animated neutral"
              style={{
                animationDelay: `${index * 0.15}s`,
              }}
              onClick={() => navigate(`/app/lesson/${lesson.id}`)} // 🔹 redirección
            >
              <div className="lesson-icon">{icon}</div>
              <h3>{lesson.title}</h3>
              <p>{lesson.summary}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
