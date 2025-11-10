import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

interface Question {
    id: string;
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_option: string;
}

interface QuizProps {
    questions: Question[];
    onQuizComplete: (score: number) => void; 
}

export default function Quiz({ questions, onQuizComplete }: QuizProps) {
    const navigate = useNavigate(); 
    const [answers, setAnswers] = useState<{ [id: string]: string }>({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState<number | null>(null);

    const allAnswered = useMemo(() => {
        return Object.keys(answers).length === questions.length;
    }, [answers, questions.length]);

    const handleSelect = (questionId: string, option: string) => {
        if (showResults) return;
        setAnswers({ ...answers, [questionId]: option });
    };

    const handleVerify = () => {
        if (!allAnswered) return; 
        
        let correctCount = 0;
        
        questions.forEach(q => {
            if (answers[q.id] === q.correct_option) {
                correctCount++;
            }
        });

        setScore(correctCount);
        setShowResults(true);
        onQuizComplete(correctCount);
    };

    // ⭐ Función para volver a lecciones
    const handleBackToLessons = () => {
        navigate("/app/lessons");
    };

    // Clase CSS dinámica para los botones de opción
    const getButtonClass = (question: Question, option: string) => {
        const selected = answers[question.id] === option;
        
        if (!showResults) {
            return selected ? "selected" : "";
        }

        if (option === question.correct_option) {
            return "correct";
        }
        if (selected && option !== question.correct_option) {
            return "wrong";
        }
        return "";
    };

    return (
        <div className="quiz-container">
            {questions.map((q) => (
                <div key={q.id} className="question-container">
                    <div className="question-card">
                        <p className="question-text">{q.question_text}</p>
                        <div className="options-grid">
                            {["A", "B", "C", "D"].map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => handleSelect(q.id, opt)}
                                    className={`option-btn ${getButtonClass(q, opt)}`}
                                    disabled={showResults}
                                >
                                    {opt}: {q[`option_${opt.toLowerCase()}` as keyof Question]}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ))}

            {/* Botón de verificación */}
            <div className="question-container" style={{ textAlign: "center", marginTop: "30px" }}>
                <button 
                    onClick={handleVerify} 
                    disabled={showResults || !allAnswered} 
                    className="option-btn"
                    style={{ 
                        padding: '15px 30px', 
                        fontSize: '1.2rem', 
                        fontWeight: '700',
                        cursor: showResults || !allAnswered ? 'not-allowed' : 'pointer',
                        opacity: showResults || !allAnswered ? 0.5 : 1,
                        background: showResults ? 'gray' : '#00bcd4', 
                        border: 'none',
                        transition: 'opacity 0.3s',
                        marginRight: showResults ? '10px' : '0' // ⭐ Espacio cuando hay dos botones
                    }}
                >
                    {showResults 
                        ? "Resultados Verificados" 
                        : !allAnswered 
                            ? `Faltan ${questions.length - Object.keys(answers).length} respuestas`
                            : "Verificar Respuestas"
                    }
                </button>

                {/* ⭐ Botón para volver a lecciones - Solo se muestra después de ver resultados */}
                {showResults && (
                    <button 
                        onClick={handleBackToLessons}
                        className="option-btn"
                        style={{ 
                            padding: '15px 30px', 
                            fontSize: '1.2rem', 
                            fontWeight: '700',
                            cursor: 'pointer',
                            background: '#4CAF50', 
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            transition: 'all 0.3s',
                            marginLeft: '10px'
                        }}
                    >
                        Volver a Lecciones
                    </button>
                )}
            </div>
            
            {/* Mostrar puntaje final */}
            {score !== null && (
                <p style={{ 
                    textAlign: "center", 
                    marginTop: "20px", 
                    fontSize: "1.5rem", 
                    fontWeight: "bold",
                    color: score > questions.length / 2 ? '#4CAF50' : '#F44336' 
                }}>
                    Puntaje Final: {score} / {questions.length}
                </p>
            )}
        </div>
    );
}