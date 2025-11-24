import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { marked } from "marked";
import { supabase } from "../services/supabaseClient";
import Quiz from "../components/LessonQuiz";

interface Lesson {
  id: string;
  title: string;
  content: string | null;
}

interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
}

// Servicios separados para las operaciones de base de datos
const lessonService = {
  async fetchLesson(id: string): Promise<Lesson | null> {
    const { data, error } = await supabase
      .from("lessons")
      .select("id, title, content")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching lesson:", error);
      return null;
    }

    return data as Lesson;
  },

  async fetchQuestions(lessonId: string): Promise<Question[]> {
    const { data, error } = await supabase
      .from("lesson_questions")
      .select("*")
      .eq("lesson_id", lessonId);

    if (error) {
      console.error("Error fetching questions:", error);
      return [];
    }

    return data as Question[];
  },

  async saveProgress(lessonId: string, score: number): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.error("Usuario no autenticado");
        return false;
      }

      const { data: existingProgress } = await supabase
        .from("user_lesson_progress")
        .select("id")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .single();

      const progressData = {
        score: score,
        completed: true,
        completed_at: new Date().toISOString()
      };

      if (existingProgress) {
        const { error } = await supabase
          .from("user_lesson_progress")
          .update(progressData)
          .eq("id", existingProgress.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_lesson_progress")
          .insert({
            user_id: user.id,
            lesson_id: lessonId,
            ...progressData
          });

        if (error) throw error;
      }

      return true;
    } catch (error) {
      console.error("Error guardando el progreso:", error);
      return false;
    }
  }
};

// Componente para el contenido de la lección
const LessonContent = ({ content }: { content: string | null }) => {
  const htmlContent = marked(content || "");
  
  return (
    <div 
      className="lesson-content" 
      dangerouslySetInnerHTML={{ __html: htmlContent }} 
    />
  );
};

// Componente para el estado de guardado
const SavingProgress = ({ isSaving }: { isSaving: boolean }) => {
  if (!isSaving) return null;
  
  return (
    <p style={{ textAlign: "center", color: "#666" }}>
      Guardando progreso...
    </p>
  );
};

// Componente para mostrar el puntaje final
const FinalScore = ({ 
  score, 
  totalQuestions 
}: { 
  score: number | null; 
  totalQuestions: number; 
}) => {
  if (score === null) return null;

  return (
    <p style={{
      textAlign: "center",
      marginTop: "10px",
      fontSize: "1.1rem",
      color: "#4CAF50",
      fontWeight: "bold"
    }}>
      ✅ Puntaje guardado: {score} / {totalQuestions}
    </p>
  );
};

// Hook personalizado para la lógica de la lección
const useLesson = (id: string | undefined) => {
  const [state, setState] = useState({
    lesson: null as Lesson | null,
    questions: [] as Question[],
    loading: true,
    finalScore: null as number | null,
    savingProgress: false
  });

  useEffect(() => {
    const loadLessonData = async () => {
      if (!id) return;

      try {
        const [lessonData, questionsData] = await Promise.all([
          lessonService.fetchLesson(id),
          lessonService.fetchQuestions(id)
        ]);

        setState(prev => ({
          ...prev,
          lesson: lessonData,
          questions: questionsData,
          loading: false
        }));
      } catch (error) {
        console.error("Error loading lesson data:", error);
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    loadLessonData();
  }, [id]);

  const handleQuizComplete = async (score: number) => {
    if (!id) return;

    setState(prev => ({ ...prev, savingProgress: true }));
    
    const success = await lessonService.saveProgress(id, score);
    
    if (success) {
      setState(prev => ({ 
        ...prev, 
        finalScore: score, 
        savingProgress: false 
      }));
    } else {
      setState(prev => ({ ...prev, savingProgress: false }));
    }
  };

  return {
    ...state,
    handleQuizComplete
  };
};

// Componente principal
export default function LessonDetail() {
  const { id } = useParams<{ id: string }>();
  const {
    lesson,
    questions,
    loading,
    finalScore,
    savingProgress,
    handleQuizComplete
  } = useLesson(id);

  if (loading) return <p>Cargando lección...</p>;
  if (!lesson) return <p>Lección no encontrada</p>;

  return (
    <div className="lesson-detail">
      <h2>{lesson.title}</h2>

      <LessonContent content={lesson.content} />

      {questions.length > 0 && (
        <>
          <h3>Cuestionario</h3>
          <Quiz 
            questions={questions} 
            onQuizComplete={handleQuizComplete} 
          />

          <SavingProgress isSaving={savingProgress} />
          <FinalScore 
            score={finalScore} 
            totalQuestions={questions.length} 
          />
        </>
      )}

      <a href="/app/lessons" className="btn-back-lessons">
        ← Volver a Lecciones
      </a>
    </div>
  );
}