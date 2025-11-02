import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Profile from "./Profile/Profile.jsx";
import "./index.css";
import App from "./App.jsx";
import "bootstrap/dist/css/bootstrap.min.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Profile />
  </StrictMode>
);
