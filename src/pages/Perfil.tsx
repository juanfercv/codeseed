import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import React from "react";

// --- 🧠 INTERFACES ---

interface Challenge {
  title: string;
  difficulty: string;
  points: number;
}

interface UserChallengeProgressResponse {
  completed: boolean;
  score: number;
  completed_at: string;
  challenges: Challenge[];
}

interface ProgressDetail {
  title: string;
  difficulty: string;
  points: number;
  score: number;
  completedAt: string;
}

interface ProfileData {
  name: string;
  avatar: string;
  email: string;
  totalChallengesAttempted: number;
  completedChallenges: number;
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

      const { data: progressData, error: progressError } = await supabase
        .from("user_challenge_progress")
        .select(`
          completed,
          score,
          completed_at,
          challenges (
            title,
            difficulty,
            points
          )
        `)
        .eq("user_id", user.id);

      if (progressError) {
        console.error("Error obteniendo progreso:", progressError);
      }

      const safeProgressData =
        (progressData as UserChallengeProgressResponse[] | null) || [];

      const completedChallenges = safeProgressData.filter(
        (progress) => progress && progress.completed === true
      );

      const totalPoints = completedChallenges.reduce((sum, progress) => {
        return sum + (Number(progress.score) || 0);
      }, 0);

      const progressDetail: ProgressDetail[] = completedChallenges.map(
        (progress) => {
          const challenge = progress.challenges?.[0] || ({} as Challenge);

          return {
            title: challenge.title || "Challenge sin título",
            difficulty: challenge.difficulty || "Desconocida",
            points: Number(challenge.points) || 0,
            score: Number(progress.score) || 0,
            completedAt: progress.completed_at || new Date().toISOString(),
          };
        }
      );

      setProfile({
        name: user.user_metadata?.name || user.email || "Usuario",
        avatar: user.user_metadata?.avatar_url || "/default-avatar.png",
        email: user.email || "",
        totalChallengesAttempted: safeProgressData.length,
        completedChallenges: completedChallenges.length,
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
              <span className="stat-label">Completados</span>
            </div>
            <div className="stat">
              <span className="stat-value">{profile.totalChallengesAttempted}</span>
              <span className="stat-label">Intentados</span>
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
              width: `${
                profile.totalChallengesAttempted > 0
                  ? (profile.completedChallenges / profile.totalChallengesAttempted) * 100
                  : 0
              }%`,
            }}
          ></div>
        </div>

        <p>
          {profile.completedChallenges} de {profile.totalChallengesAttempted} completados
        </p>

        <div className="challenges-list">
          <h3>Challenges Completados</h3>
          {profile.progressDetail.length > 0 ? (
            profile.progressDetail.map((challenge, index) => (
              <div key={index} className="challenge-item">
                <div className="challenge-info">
                  <h4>{challenge.title}</h4>
                  <span
                    className={`difficulty ${challenge.difficulty.toLowerCase()}`}
                  >
                    {challenge.difficulty}
                  </span>
                </div>
                <div className="challenge-stats">
                  <span>Puntos: {challenge.score}</span>
                  <span>
                    Completado:{" "}
                    {new Date(challenge.completedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p>No hay challenges completados aún.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
