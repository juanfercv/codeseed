import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import React from "react";

// --- 🧠 INTERFACES ---
interface Challenge {
  title: string;
  difficulty: string;
  points: number;
}

interface Lesson {
  title: string;
  summary: string;
  points: number;
}

interface UserChallengeProgressResponse {
  completed: boolean;
  score: number;
  completed_at: string;
  challenge: Challenge;
}

interface UserLessonProgressResponse {
  completed: boolean;
  score: number;
  completed_at: string;
  lesson: Lesson;
}

interface ProgressDetail {
  title: string;
  type: "challenge" | "lesson";
  difficulty?: string;
  points: number;
  score: number;
  completedAt: string;
  summary?: string;
}

interface ProfileData {
  name: string;
  avatar: string;
  email: string;
  totalChallengesAttempted: number;
  completedChallenges: number;
  completedLessons: number;
  totalPoints: number;
  progressDetail: ProgressDetail[];
}

// --- 🎯 COMPONENTE PRINCIPAL ---
const ProfileView = () => {
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    avatar: "",
    email: "",
    totalChallengesAttempted: 0,
    completedChallenges: 0,
    completedLessons: 0,
    totalPoints: 0,
    progressDetail: [],
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // --- 🔍 OBTENER DATOS DEL PERFIL ---
  const fetchUserProfile = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Error obteniendo usuario:", userError);
        setLoading(false);
        return;
      }

      // 🔹 Obtener progreso de CHALLENGES
      const { data: challengeProgressData, error: challengeError } = await supabase
        .from("user_challenge_progress")
        .select(`
          completed,
          score,
          completed_at,
          challenge:challenge_id (
            title,
            difficulty,
            points
          )
        `)
        .eq("user_id", user.id);

      if (challengeError) {
        console.error("Error obteniendo progreso de challenges:", challengeError);
      }

      // 🔹 Obtener progreso de LECCIONES
      const { data: lessonProgressData, error: lessonError } = await supabase
        .from("user_lesson_progress")
        .select(`
          completed,
          score,
          completed_at,
          lesson:lesson_id (
            title,
            summary,
            points
          )
        `)
        .eq("user_id", user.id);

      if (lessonError) {
        console.error("Error obteniendo progreso de lecciones:", lessonError);
      }

      const safeChallengeData = (challengeProgressData as UserChallengeProgressResponse[] | null) || [];
      const safeLessonData = (lessonProgressData as UserLessonProgressResponse[] | null) || [];

      // 🔹 Filtrar challenges completados
      const completedChallenges = safeChallengeData.filter(
        (progress) => progress && progress.completed === true
      );

      // 🔹 Filtrar lecciones completadas
      const completedLessons = safeLessonData.filter(
        (progress) => progress && progress.completed === true
      );

      // 🔹 Calcular puntos totales (challenges + lecciones)
      const totalPoints = 
        completedChallenges.reduce((sum, progress) => sum + (Number(progress.score) || 0), 0) +
        completedLessons.reduce((sum, progress) => sum + (Number(progress.score) || 0), 0);

      // 🔹 Combinar progreso de challenges y lecciones
      const progressDetail: ProgressDetail[] = [
        ...completedChallenges.map((progress) => {
          const challenge = progress.challenge || ({} as Challenge);
          return {
            title: challenge.title || "Challenge sin título",
            type: "challenge" as const,
            difficulty: challenge.difficulty || "Desconocida",
            points: Number(challenge.points) || 0,
            score: Number(progress.score) || 0,
            completedAt: progress.completed_at || new Date().toISOString(),
          };
        }),
        ...completedLessons.map((progress) => {
          const lesson = progress.lesson || ({} as Lesson);
          return {
            title: lesson.title || "Lección sin título",
            type: "lesson" as const,
            points: Number(lesson.points) || 0,
            score: Number(progress.score) || 0,
            completedAt: progress.completed_at || new Date().toISOString(),
            summary: lesson.summary || "",
          };
        })
      ];

      // 🔹 Ordenar por fecha de completado (más reciente primero)
      progressDetail.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

      setProfile({
        name: user.user_metadata?.name || user.email || "Usuario",
        avatar: user.user_metadata?.avatar_url || "/default-avatar.png",
        email: user.email || "",
        totalChallengesAttempted: safeChallengeData.length,
        completedChallenges: completedChallenges.length,
        completedLessons: completedLessons.length,
        totalPoints: totalPoints,
        progressDetail: progressDetail,
      });
    } catch (error) {
      console.error("Error inesperado:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- ⚠️ MANEJAR ERROR DE IMAGEN ---
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = "/default-avatar.png";
  };

  // --- 📸 SUBIR O ACTUALIZAR AVATAR ---
  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert("Usuario no autenticado. Por favor, inicia sesión.");
        return;
      }

      const file = event.target.files?.[0];
      if (!file) {
        throw new Error("Debes seleccionar una imagen para subir.");
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `${fileName}`;

      // 🔧 Evita caché del CDN y permite sobrescribir
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "0",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // 💡 Añadir timestamp para romper la caché del navegador
      const updatedUrl = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: updatedUrl },
      });

      if (updateError) throw updateError;

      setProfile((prev) => ({
        ...prev,
        avatar: updatedUrl,
      }));
    } catch (error) {
      console.error("Error subiendo avatar:", error);
      alert("Error al subir el avatar: " + (error as Error).message);
    } finally {
      setUploading(false);
      event.target.value = ""; // permite volver a subir la misma imagen
    }
  };

  if (loading) return <div>Cargando perfil...</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        {/* --- 📸 SECCIÓN DE AVATAR --- */}
        <div className="avatar-wrapper">
          <img
            src={profile.avatar}
            alt="Avatar"
            className="avatar"
            onError={handleImageError}
          />

          {/* Input oculto */}
          <input
            style={{ visibility: "hidden", position: "absolute" }}
            type="file"
            id="avatar-upload"
            accept="image/*"
            onChange={uploadAvatar}
            disabled={uploading}
          />

          {/* Botón visible */}
          <label
            htmlFor="avatar-upload"
            className="edit-button"
            style={{ cursor: uploading ? "default" : "pointer" }}
          >
            {uploading ? "Subiendo..." : "Editar"}
          </label>
        </div>

        {/* --- 👤 INFO DEL PERFIL --- */}
        <div className="profile-info">
          <h1>{profile.name}</h1>
          <p>{profile.email}</p>
          <div className="stats">
            <div className="stat">
              <span className="stat-value">{profile.totalPoints}</span>
              <span className="stat-label">Puntos Totales</span>
            </div>
            <div className="stat">
              <span className="stat-value">{profile.completedChallenges}</span>
              <span className="stat-label">Challenges</span>
            </div>
            <div className="stat">
              <span className="stat-value">{profile.completedLessons}</span>
              <span className="stat-label">Lecciones</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- 📊 PROGRESO DE CHALLENGES --- */}
      <div className="progress-section">
        <h2>Progreso de Challenges</h2>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${profile.totalChallengesAttempted > 0
                ? (profile.completedChallenges / profile.totalChallengesAttempted) * 100
                : 0
                }%`,
            }}
          ></div>
        </div>

        <p>
          {profile.completedChallenges} de {profile.totalChallengesAttempted} challenges completados
        </p>

        <div className="challenges-list">
          <h3>Actividades Completadas</h3>
          {profile.progressDetail.length > 0 ? (
            profile.progressDetail.map((activity, index) => (
              <div key={index} className="challenge-item">
                <div className="challenge-info">
                  <h4>{activity.title}</h4>
                  <span
                    className={`difficulty ${activity.difficulty ? activity.difficulty.toLowerCase() : 'lesson'}`}
                  >
                    {activity.type === 'challenge' ? activity.difficulty : 'Lección'}
                  </span>
                </div>
                <div className="challenge-stats">
                  <span>Puntos: {activity.score}</span>
                  <span>
                    Completado:{" "}
                    {new Date(activity.completedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p>No hay actividades completadas aún.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileView;