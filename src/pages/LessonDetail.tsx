import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../services/supabaseClient"; 
import Quiz from "../components/LessonQuiz";

// Interfaces mantenidas
interface Lesson {
    id: string;
    title: string;
    content: string;
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

export default function LessonDetail() {
    const { id } = useParams<{ id: string }>();
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [finalScore, setFinalScore] = useState<number | null>(null);
    const [savingProgress, setSavingProgress] = useState(false);

    useEffect(() => {
        const fetchLessonAndQuestions = async () => {
            if (!id) return;

            const lessonQuery = await supabase
                .from("lessons") 
                .select("id, title, content")
                .eq("id", id)
                .single();
            
            const lessonData = lessonQuery.data as Lesson | null;
            const lessonError = lessonQuery.error;
            
            if (lessonError) return console.error(lessonError);

            setLesson(lessonData);

            const questionsQuery = await supabase
                .from("lesson_questions")
                .select("*")
                .eq("lesson_id", id);
                
            const questionsData = questionsQuery.data as Question[] | null;
            const questionsError = questionsQuery.error;

            if (questionsError) return console.error(questionsError);

            setQuestions(questionsData || []);
            setLoading(false);
        };

        fetchLessonAndQuestions();
    }, [id]);

    // ⭐ Función para guardar el progreso en Supabase
    const saveUserProgress = async (score: number) => {
        if (!id) return;
        
        setSavingProgress(true);
        try {
            // Obtener el usuario actual
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                console.error("Usuario no autenticado");
                return;
            }

            // Verificar si ya existe un registro de progreso
            const { data: existingProgress } = await supabase
                .from("user_lesson_progress")
                .select("id")
                .eq("user_id", user.id)
                .eq("lesson_id", id)
                .single();

            if (existingProgress) {
                // Actualizar registro existente
                const { error } = await supabase
                    .from("user_lesson_progress")
                    .update({
                        score: score,
                        completed: true,
                        completed_at: new Date().toISOString()
                    })
                    .eq("id", existingProgress.id);

                if (error) throw error;
            } else {
                // Crear nuevo registro
                const { error } = await supabase
                    .from("user_lesson_progress")
                    .insert({
                        user_id: user.id,
                        lesson_id: id,
                        score: score,
                        completed: true,
                        completed_at: new Date().toISOString()
                    });

                if (error) throw error;
            }

            console.log("Progreso guardado exitosamente");
        } catch (error) {
            console.error("Error guardando el progreso:", error);
        } finally {
            setSavingProgress(false);
        }
    };

    // ⭐ Nueva función para recibir el puntaje del componente Quiz
    const handleQuizComplete = async (score: number) => {
        setFinalScore(score);
        await saveUserProgress(score);
    };

    if (loading) return <p>Cargando lección...</p>;
    if (!lesson) return <p>Lección no encontrada</p>;

    return (
        <div className="lesson-detail">
            <h2>{lesson.title}</h2>
            <div className="lesson-content">{lesson.content}</div>

            {/* Solo mostramos el quiz si hay preguntas */}
            {questions.length > 0 && (
                <>
                    <h3>Cuestionario</h3>
                    {/* ⭐ Usamos el nuevo componente Quiz */}
                    <Quiz questions={questions} onQuizComplete={handleQuizComplete} />
                    
                    {/* Mostrar estado de guardado */}
                    {savingProgress && (
                        <p style={{ textAlign: "center", color: "#666" }}>
                            Guardando progreso...
                        </p>
                    )}
                    
                    {/* Mostrar puntaje final guardado */}
                    {finalScore !== null && !savingProgress && (
                        <p style={{ 
                            textAlign: "center", 
                            marginTop: "10px", 
                            fontSize: "1.1rem",
                            color: "#4CAF50",
                            fontWeight: "bold"
                        }}>
                            ✅ Puntaje guardado: {finalScore} / {questions.length}
                        </p>
                    )}
                </>
            )}
        </div>
    );
}