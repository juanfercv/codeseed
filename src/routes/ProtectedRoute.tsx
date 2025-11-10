import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // ✅ 1. Obtener sesión actual
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };
    getSession();

    // ✅ 2. Escuchar cambios de sesión (login / logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // ✅ 3. Limpiar listener al desmontar
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) return <p>Cargando...</p>;

  // ✅ 4. Si no hay sesión → redirige al login
  return session ? <>{children}</> : <Navigate to="/" replace />;
}
