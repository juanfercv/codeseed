import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/global.css";
import "./styles/login-register.css";
import "./styles/footer.css"
import "./styles/lessons-page.css";
import "./styles/challenges-page.css";
import "./styles/pages/lesson.css";
import "./styles/pages/challenges.css";
import "./styles/pages/perfil.css";
import "./styles/pages/inicio.css";

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
