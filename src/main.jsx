import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Import CurePan ThemeProvider
import CurePanThemeProvider from "./Theme/ThemeProvider.jsx";
// Import Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CurePanThemeProvider>
      <App />
    </CurePanThemeProvider>
  </StrictMode>
);
