// En Perfil.tsx
import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import React from "react"; // Necesario para React.SyntheticEvent y React.ChangeEvent

// --- 🛠️ INTERFACES CORREGIDAS ---

interface Challenge {
  title: string;
  difficulty: string;
  points: number;
}

// 🎯 CORRECCIÓN: 'challenges' es tipado como un array,
// que es como se interpreta un join de Supabase.
interface UserChallengeProgressResponse {
  completed: boolean;
  score: number;
  completed_at: string;
  challenges: Challenge[]; // ¡CORREGIDO!
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

const ProfileView = () => {
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    avatar: '',
    email: '',
    totalChallengesAttempted: 0,
    completedChallenges: 0,
    totalPoints: 0,
    progressDetail: []
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false); // Nuevo estado para la subida del avatar

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      // 1. Obtener usuario
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Error obteniendo usuario:', userError);
        setLoading(false);
        return;
      }

      // 2. Obtener progreso de challenges
      const { data: progressData, error: progressError } = await supabase
        .from('user_challenge_progress')
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
        .eq('user_id', user.id);

      if (progressError) {
        console.error('Error obteniendo progreso:', progressError);
      }

      // 3. Procesar datos (con tipado seguro)
      // Usamos la aserción 'as' con el tipo corregido:
      const safeProgressData = (progressData as UserChallengeProgressResponse[] | null) || [];
      
      // Filtrar challenges completados
      const completedChallenges = safeProgressData.filter(progress => {
        return progress && progress.completed === true;
      });

      // Calcular puntos totales
      const totalPoints = completedChallenges.reduce((sum, progress) => {
        return sum + (Number(progress.score) || 0);
      }, 0);

      // Mapear detalles del progreso
      const progressDetail: ProgressDetail[] = completedChallenges.map(progress => {
        // 🎯 AJUSTE DE LÓGICA: Accedemos al primer elemento del array 'challenges'.
        const challenge = progress.challenges?.[0] || {} as Challenge;

        return {
          title: challenge.title || 'Challenge sin título',
          difficulty: challenge.difficulty || 'Desconocida',
          points: Number(challenge.points) || 0,
          score: Number(progress.score) || 0,
          completedAt: progress.completed_at || new Date().toISOString()
        };
      });

      // 4. Actualizar estado
      setProfile({
        name: user.user_metadata?.name || user.email || 'Usuario',
        // Usar la URL de metadatos para el avatar, o un valor por defecto
        avatar: user.user_metadata?.avatar_url || '/default-avatar.png', 
        email: user.email || '',
        totalChallengesAttempted: safeProgressData.length,
        completedChallenges: completedChallenges.length,
        totalPoints: totalPoints,
        progressDetail: progressDetail
      });

    } catch (error) {
      console.error('Error inesperado:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar error de imagen (se mantiene)
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = '/default-avatar.png';
  };

  // --- 📸 NUEVA FUNCIÓN PARA SUBIR EL AVATAR ---
  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
      try {
          setUploading(true);

          const user = (await supabase.auth.getUser()).data.user;

          if (!user) {
              alert('Usuario no autenticado. Por favor, inicia sesión.');
              return;
          }

          const file = event.target.files?.[0];
          if (!file) {
              throw new Error('Debes seleccionar una imagen para subir.');
          }

          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}.${fileExt}`;
          const filePath = `${fileName}`;

          // 1. Subir/Sobrescribir archivo en el Bucket 'avatars' (Asegúrate de que este bucket exista)
          const { error: uploadError } = await supabase.storage
              .from('avatars') 
              .upload(filePath, file, { 
                  cacheControl: '3600',
                  upsert: true 
              });

          if (uploadError) {
              throw uploadError;
          }

          // 2. Obtener la URL pública (o firmada si no es pública)
          const { data: { publicUrl } } = supabase.storage
              .from('avatars')
              .getPublicUrl(filePath);
          
          // 3. Actualizar la URL en los metadatos del usuario
          const { error: updateError } = await supabase.auth.updateUser({
              data: { avatar_url: publicUrl }
          });

          if (updateError) {
              throw updateError;
          }

          // 4. Actualizar el estado local
          setProfile(prev => ({
              ...prev,
              avatar: publicUrl,
          }));

      } catch (error) {
          console.error('Error subiendo avatar:', error);
          alert('Error al subir el avatar: ' + (error as Error).message);
      } finally {
          setUploading(false);
          // Reinicia el valor del input para permitir la subida del mismo archivo otra vez
          event.target.value = ''; 
      }
  };

  if (loading) return <div>Cargando perfil...</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        {/* 📸 WRAPPER DEL AVATAR Y EDICIÓN */}
        <div className="avatar-wrapper"> 
            <img 
                src={profile.avatar} 
                alt="Avatar" 
                className="avatar"
                onError={handleImageError}
            />

            {/* Input oculto para seleccionar el archivo */}
            <input
                style={{ visibility: 'hidden', position: 'absolute' }}
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={uploadAvatar}
                disabled={uploading}
            />

            {/* Botón/Label visible para disparar el click del input oculto */}
            <label htmlFor="avatar-upload" className="edit-button" style={{ cursor: uploading ? 'default' : 'pointer' }}>
                {uploading ? 'Subiendo...' : 'Editar'}
            </label>
        </div>
        {/* FIN WRAPPER AVATAR */}
        
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
              }%`
            }}
          ></div>
        </div>
        
        <p>{profile.completedChallenges} de {profile.totalChallengesAttempted} completados</p>

        <div className="challenges-list">
          <h3>Challenges Completados</h3>
          {profile.progressDetail.length > 0 ? (
            profile.progressDetail.map((challenge, index) => (
              <div key={index} className="challenge-item">
                <div className="challenge-info">
                  <h4>{challenge.title}</h4>
                  <span className={`difficulty ${challenge.difficulty.toLowerCase()}`}>
                    {challenge.difficulty}
                  </span>
                </div>
                <div className="challenge-stats">
                  <span>Puntos: {challenge.score}/{challenge.points}</span>
                  <span>Completado: {new Date(challenge.completedAt).toLocaleDateString()}</span>
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