import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import Editor from "@monaco-editor/react";

interface Challenge {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    points: number;
    expected_output?: string;
}

export default function ChallengeEditor() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [code, setCode] = useState<string>(""); // Código del usuario
    const [output, setOutput] = useState<string>(""); // Resultado al ejecutar
    const [isRunning, setIsRunning] = useState(false);
    const [result, setResult] = useState<string | null>(null); // "correcto" o "incorrecto"

    // 🔹 Cargar reto desde Supabase
    useEffect(() => {
        const fetchChallenge = async () => {
            if (!id) return;
            const { data, error } = await supabase
                .from("challenges")
                .select("*")
                .eq("id", id)
                .single();
            if (error) console.error(error);
            else setChallenge(data);
        };
        fetchChallenge();
    }, [id]);

    // 🔹 Ejecutar el código ingresado por el usuario
    const runCode = () => {
        setIsRunning(true);
        setResult(null);
        setOutput("");

        try {
            let capturedOutput = "";

            // Guardar los console originales
            const originalLog = console.log;
            const originalError = console.error;

            // Interceptar console.log y console.error
            console.log = (...args: any[]) => {
                capturedOutput +=
                    args
                        .map((a) => {
                            try {
                                return typeof a === "string" ? a : JSON.stringify(a);
                            } catch {
                                return String(a);
                            }
                        })
                        .join(" ") + "\n";
                originalLog.apply(console, args);
            };

            console.error = (...args: any[]) => {
                capturedOutput += args.join(" ") + "\n";
                originalError.apply(console, args);
            };

            // eslint-disable-next-line no-eval
            const evalResult = eval(code);

            // Restaurar los console originales
            console.log = originalLog;
            console.error = originalError;

            // Determinar la salida final
            const finalOutput =
                capturedOutput.trim() !== ""
                    ? capturedOutput.trim()
                    : evalResult !== undefined
                        ? String(evalResult).trim()
                        : "";

            setOutput(finalOutput);

            // Comparar con el resultado esperado
            if (challenge?.expected_output !== undefined) {
                const success =
                    finalOutput.trim() === challenge.expected_output.trim();
                setResult(success ? "correcto" : "incorrecto");
                saveProgress(success);
            }
        } catch (err: any) {
            setOutput(err?.message ?? String(err));
            setResult("error");
        } finally {
            setIsRunning(false);
        }
    };

    // 🔹 Guardar progreso en Supabase (sin "attempts")
    const saveProgress = async (success: boolean) => {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return alert("Usuario no autenticado");

        const { error } = await supabase
            .from("user_challenge_progress")
            .upsert(
                [
                    {
                        user_id: user.id,
                        challenge_id: id,
                        completed: success,
                        score: success ? challenge?.points || 10 : 0,
                        completed_at: success ? new Date().toISOString() : null,
                    },
                ],
                { onConflict: "user_id,challenge_id" }
            );

        if (error) console.error("❌ Error guardando progreso:", error);
        else console.log("✅ Progreso guardado correctamente");
    };

    if (!challenge) return <p className="text-center mt-5">Cargando reto...</p>;

    return (
        <div className="container my-5">
            <button className="btn btn-secondary mb-4" onClick={() => navigate(-1)}>
                ← Volver
            </button>

            <h2 className="fw-bold">{challenge.title}</h2>
            <p className="text-muted">{challenge.description}</p>
            <span
                className={`badge ${challenge.difficulty === "Difícil"
                        ? "bg-danger"
                        : challenge.difficulty === "Medio"
                            ? "bg-warning text-dark"
                            : "bg-success"
                    }`}
            >
                {challenge.difficulty}
            </span>

            {/* 🧠 Editor */}
            <div className="mt-4">
                <Editor
                    height="300px"
                    language="javascript"
                    theme="vs-dark"
                    value={code}
                    onChange={(val) => setCode(val || "")}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily: "JetBrains Mono, monospace",
                    }}
                />
            </div>

            {/* ▶️ Ejecutar */}
            <div className="text-center mt-4">
                <button
                    className="btn btn-primary px-4"
                    onClick={runCode}
                    disabled={isRunning}
                >
                    {isRunning ? "Ejecutando..." : "Ejecutar Código"}
                </button>
            </div>

            {/* 🧾 Resultado */}
            <div className="mt-4">
                <h5>🧾 Resultado:</h5>
                <pre
                    className="p-3 bg-dark text-light rounded"
                    style={{ minHeight: "80px" }}
                >
                    {output || "Sin salida aún."}
                </pre>

                {result && (
                    <div
                        className={`alert mt-3 ${result === "correcto"
                                ? "alert-success"
                                : result === "incorrecto"
                                    ? "alert-danger"
                                    : "alert-warning"
                            }`}
                    >
                        {result === "correcto"
                            ? "✅ ¡Excelente! Respuesta correcta."
                            : result === "incorrecto"
                                ? "❌ Respuesta incorrecta."
                                : "⚠️ Error al ejecutar el código."}
                    </div>
                )}
            </div>
        </div>
    );
}
