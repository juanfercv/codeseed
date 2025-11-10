import { Link } from "react-router-dom";

type CardLessonProps = {
  id: string;
  title: string;
  summary: string;
};

export default function CardLesson({ id, title, summary }: CardLessonProps) {
  return (
    <div className="card lesson-card">
      <h3>{title}</h3>
      <p>{summary}</p>

      <Link to={`/app/lesson/${id}`} className="btn-primary">
        Ver Lección
      </Link>
    </div>
  );
}
