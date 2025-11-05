import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Lessons from "../pages/Lessons";
import Challenges from "../pages/Challenges";
import ProgressTree from "../pages/ProgressTree";
import MainLayout from "../layouts/MainLayout";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Páginas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Páginas internas (con Navbar y Footer) */}
        <Route path="/app" element={<MainLayout />}>
          <Route path="lessons" element={<Lessons />} />
          <Route path="challenges" element={<Challenges />} />
          <Route path="progress" element={<ProgressTree />} />
          {/* /app/ redirige a /app/lessons */}
          <Route index element={<Navigate to="lessons" replace />} />
        </Route>

        {/* Redirección para rutas desconocidas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
