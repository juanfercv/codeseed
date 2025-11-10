import { useEffect, useState } from "react";
import CardLesson from "../components/CardLesson";
import { supabase } from "../services/supabaseClient";

type Lesson = {
  id: string;
  title: string;
  summary: string;
  // si tienes más columnas, agrégalas:
  // content?: string;
};

export default function Lessons() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      const { data, error } = await supabase.from("lessons").select("*");

      if (error) {
        console.error("Error fetching lessons:", error);
      }

      setLessons(data || []);
      setLoading(false);
    };

    fetchLessons();
  }, []);

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="lessons-container fade-in">
      <h1 className="fw-bold text-primary mb-3">📘 Lecciones</h1>

      <div className="lessons-grid">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="card-animated">
            <CardLesson id={lesson.id} title={lesson.title} summary={lesson.summary} />
          </div>
        ))}
      </div>
    </div>
  );
}
