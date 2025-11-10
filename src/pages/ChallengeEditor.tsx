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
  const [code, setCode] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

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

  // 🔹 Ejecutar código
  const runCode = () => {
    setIsRunning(true);
    setResult(null);
    setOutput("");

    try {
      let capturedOutput = "";
      const originalLog = console.log;
      const originalError = console.error;

      console.log = (...args: any[]) => {
        capturedOutput +=
          args.map((a) => (typeof a === "string" ? a : JSON.stringify(a))).join(" ") +
          "\n";
        originalLog.apply(console, args);
      };

      console.error = (...args: any[]) => {
        capturedOutput += args.join(" ") + "\n";
        originalError.apply(console, args);
      };

      // eslint-disable-next-line no-eval
      const evalResult = eval(code);

      console.log = originalLog;
      console.error = originalError;

      const finalOutput =
        capturedOutput.trim() !== ""
          ? capturedOutput.trim()
          : evalResult !== undefined
          ? String(evalResult).trim()
          : "";

      setOutput(finalOutput);

      if (challenge?.expected_output !== undefined) {
        const success = finalOutput.trim() === challenge.expected_output.trim();
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

  // 🔹 Guardar progreso
  const saveProgress = async (success: boolean) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return alert("Usuario no autenticado");

    const { error } = await supabase.from("user_challenge_progress").upsert(
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
  };

  if (!challenge) return <p className="text-center mt-5">Cargando reto...</p>;

  return (
    <div className="challenge-editor-container">
      <h2 className="lessons-title">{challenge.title}</h2>

      <span
        className={`badge ${
          challenge.difficulty === "Difícil"
            ? "bg-danger"
            : challenge.difficulty === "Medio"
            ? "bg-warning text-dark"
            : "bg-success"
        }`}
      >
        {challenge.difficulty}
      </span>

      {/* 📄 Descripción */}
      <p className="challenge-description">{challenge.description}</p>

      {/* 💻 Editor */}
      <div className="editor-side">
        <Editor
          height="320px"
          width="100%"
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
          className="option-btn action"
          onClick={runCode}
          disabled={isRunning}
        >
          {isRunning ? "Ejecutando..." : "Ejecutar Código"}
        </button>
      </div>

      {/* 🧾 Terminal */}
      <div className="output-container mt-4">
        <h5>Resultado:</h5>
        <pre className="output-terminal">{output || "Sin salida aún."}</pre>
      </div>

      {/* 🟢 Resultado visual */}
      {result && (
        <div
          className={`alert mt-3 text-center ${
            result === "correcto"
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

      {/* 🔙 Volver */}
      <div className="bottom-right">
        <button className="btn-back-lessons" onClick={() => navigate(-1)}>
          ← Volver a Retos
        </button>
      </div>
    </div>
  );
}
