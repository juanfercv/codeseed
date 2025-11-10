import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Lessons from "../pages/Lessons";
import LessonDetail from "../pages/LessonDetail";
import Challenges from "../pages/Challenges";
import ChallengeEditor from "../pages/ChallengeEditor"; // ✅ nuevo editor
import ProgressTree from "../pages/ProgressTree";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🌐 Rutas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 🔒 Área protegida */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* 📘 Lecciones */}
          <Route path="lessons" element={<Lessons />} />
          <Route path="lesson/:id" element={<LessonDetail />} />

          {/* 🧩 Retos */}
          <Route path="challenges" element={<Challenges />} />
          <Route path="challenges/:id" element={<ChallengeEditor />} /> {/* ✅ nuevo */}

          {/* 🌳 Progreso */}
          <Route path="progress" element={<ProgressTree />} />

          {/* Redirección por defecto */}
          <Route index element={<Navigate to="lessons" replace />} />
        </Route>

        {/* 🚫 Cualquier otra ruta → login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
