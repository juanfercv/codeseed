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
  expected_output: string;
  language: string;
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

      try {
        const { data, error } = await supabase
          .from("challenges")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error cargando reto:", error);
          return;
        }

        if (data) {
          setChallenge(data);
          // Cargar el starter_code por defecto
          setCode("// Escribe tu código aquí\n");
        }
      } catch (error) {
        console.error("Error inesperado:", error);
      }
    };

    fetchChallenge();
  }, [id]);

  // 🔹 Validar seguridad del código
  const isCodeSafe = (code: string): { safe: boolean; message: string } => {
    const dangerousPatterns = [
      // Bloquear solo los realmente peligrosos
      { pattern: /fetch\(/i, message: "fetch() no permitido" },
      { pattern: /XMLHttpRequest/i, message: "XMLHttpRequest no permitido" },
      { pattern: /localStorage/i, message: "localStorage no permitido" },
      { pattern: /sessionStorage/i, message: "sessionStorage no permitido" },
      { pattern: /document\./i, message: "manipulación DOM no permitida" },
      { pattern: /window\./i, message: "acceso a window no permitido" },
      { pattern: /process\./i, message: "acceso a process no permitido" },
      { pattern: /require\(/i, message: "require() no permitido" },
      { pattern: /import\(/i, message: "import dinámico no permitido" },
      // Solo bloquear Function constructor explícito
      { pattern: /new\s+Function\(/i, message: "Function constructor no permitido" },
      // Bloquear bucles infinitos explícitos
      { pattern: /while\s*\(\s*true\s*\)/i, message: "bucles infinitos no permitidos" },
      { pattern: /for\s*\(\s*;\s*;\s*\)/i, message: "bucles infinitos no permitidos" }
    ];

    for (const { pattern, message } of dangerousPatterns) {
      if (pattern.test(code)) {
        return { safe: false, message };
      }
    }

    // Prevenir código demasiado largo
    if (code.length > 10000) {
      return { safe: false, message: "Código demasiado largo" };
    }

    return { safe: true, message: "" };
  };

  // 🔹 Ejecutar código de forma segura
  const runCode = () => {
    setIsRunning(true);
    setResult(null);
    setOutput("");

    try {
      // Validar seguridad
      const safetyCheck = isCodeSafe(code);
      if (!safetyCheck.safe) {
        setOutput(`❌ Seguridad: ${safetyCheck.message}`);
        setResult("error");
        setIsRunning(false);
        return;
      }

      let capturedOutput = "";
      const originalLog = console.log;
      const originalError = console.error;
      const originalWarn = console.warn;

      // Capturar console.log, error y warn
      console.log = (...args: any[]) => {
        capturedOutput += args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ') + '\n';
      };

      console.error = (...args: any[]) => {
        capturedOutput += `ERROR: ${args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ')}\n`;
      };

      console.warn = (...args: any[]) => {
        capturedOutput += `WARNING: ${args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ')}\n`;
      };

      // Ejecutar en contexto limitado
      const safeCode = `
        (function() {
          'use strict';
          try {
            ${code}
          } catch(err) {
            console.error(err.message);
          }
        })();
      `;


      // Timeout para prevenir bucles infinitos
      const executionTimeout = setTimeout(() => {
        setOutput("❌ Tiempo de ejecución excedido (máximo 5 segundos)");
        setResult("error");
        setIsRunning(false);

        // Restaurar console original
        console.log = originalLog;
        console.error = originalError;
        console.warn = originalWarn;
      }, 5000);

      try {
        // eslint-disable-next-line no-eval
        eval(safeCode);
        clearTimeout(executionTimeout);
      } catch (evalError: any) {
        clearTimeout(executionTimeout);
        capturedOutput += `Error de ejecución: ${evalError?.message || 'Error desconocido'}\n`;
      }

      // Restaurar console original
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;

      const finalOutput = capturedOutput.trim();
      setOutput(finalOutput || "✅ Código ejecutado (sin salida visible)");

      // Verificar resultado esperado
      if (challenge?.expected_output !== undefined && finalOutput) {
        const expected = challenge.expected_output.trim();
        const actual = finalOutput.trim();

        let success = false;

        // 🔹 Caso especial para Bucle For
        if (challenge.title === 'Bucle For') {
          const numbers = actual.split(/\s+/).filter(n => n.trim() !== '');
          const expectedNumbers = ['1', '2', '3', '4', '5'];
          const hasCorrectCount = numbers.length === 5;
          const hasAllNumbers = expectedNumbers.every(num => numbers.includes(num));
          success = hasCorrectCount && hasAllNumbers;
        }
        // 🔹 Caso especial para Método Map
        else if (challenge.title === 'Método Map') {
          // Limpiar espacios y saltos de línea para comparar solo los números
          const cleanActual = actual.replace(/\s+/g, '').replace(/\n/g, '');
          const cleanExpected = expected.replace(/\s+/g, '').replace(/\n/g, '');
          success = cleanActual === cleanExpected;
        }
        // 🔹 Para los demás retos, validación normal
        else {
          success = expected === actual ||
            String(expected) === String(actual) ||
            (Number(expected) === Number(actual) && !isNaN(Number(expected)));
        }

        setResult(success ? "correcto" : "incorrecto");

        if (success) {
          saveProgress(true);
        }
      } else if (!finalOutput && challenge?.expected_output) {
        setResult("incorrecto");
      } else if (!finalOutput && challenge?.expected_output) {
        setResult("incorrecto");
      }

    } catch (err: any) {
      setOutput(`❌ Error inesperado: ${err?.message || 'Error desconocido'}`);
      setResult("error");
    } finally {
      setIsRunning(false);
    }
  };

  // 🔹 Guardar progreso
  const saveProgress = async (success: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("Usuario no autenticado");
        return;
      }

      const progressData = {
        user_id: user.id,
        challenge_id: id,
        completed: success,
        score: success ? (challenge?.points || 10) : 0,
        completed_at: success ? new Date().toISOString() : null,
      };

      const { error } = await supabase
        .from("user_challenge_progress")
        .upsert([progressData], {
          onConflict: 'user_id,challenge_id'
        });

      if (error) {
        console.error("Error guardando progreso:", error);
      } else {
        console.log("✅ Progreso guardado exitosamente");
      }
    } catch (error) {
      console.error("Error inesperado guardando progreso:", error);
    }
  };



  if (!challenge) {
    return (
      <div className="text-center mt-5">
        <p>Cargando reto...</p>
      </div>
    );
  }

  return (
    <div className="challenge-editor-container">
      <h2 className="lessons-title">{challenge.title}</h2>

      <span
        className={`badge ${challenge.difficulty === "Difícil"
          ? "bg-danger"
          : challenge.difficulty === "Medio"
            ? "bg-warning text-dark"
            : "bg-success"
          }`}
      >
        {challenge.difficulty} - {challenge.points} puntos
      </span>

      {/* 📄 Descripción */}
      <div className="challenge-description-container">
        <h5>Descripción:</h5>
        <p className="challenge-description">{challenge.description}</p>
      </div>

      {/* 💻 Editor */}
      <div className="editor-side">
        <div className="editor-header">
          <span>Editor de Código (JavaScript)</span>
        </div>
        <Editor
          height="400px"
          width="100%"
          language="javascript"
          theme="vs-dark"
          value={code}
          onChange={(val) => setCode(val || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "JetBrains Mono, monospace",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            wordWrap: "on",
          }}
        />
      </div>

      {/* ▶️ Ejecutar */}
      <div className="text-center mt-4">
        <button
          className="option-btn action"
          onClick={runCode}
          disabled={isRunning || !code.trim()}
        >
          {isRunning ? "🔄 Ejecutando..." : "▶️ Ejecutar Código"}
        </button>
      </div>

      {/* 🧾 Terminal */}
      <div className="output-container mt-4">
        <h5>Salida:</h5>
        <pre className="output-terminal">
          {output || "Ejecuta tu código para ver la salida aquí..."}
        </pre>
      </div>

      {/* 🟢 Resultado visual */}
      {result && (
        <div
          className={`alert mt-3 text-center ${result === "correcto"
            ? "alert-success"
            : result === "incorrecto"
              ? "alert-danger"
              : "alert-warning"
            }`}
        >
          {result === "correcto"
            ? `✅ ¡Excelente! Respuesta correcta. +${challenge.points} puntos`
            : result === "incorrecto"
              ? "❌ La salida no coincide con el resultado esperado."
              : "⚠️ Error al ejecutar el código."}
        </div>
      )}

      {/* 🔙 Volver */}
      <div className="text-center mt-4">
        <button
          className="btn-back-lessons"
          onClick={() => navigate("/app/challenges")}
        >
          ← Volver a Retos
        </button>
      </div>
    </div>
  );
}