import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Optional: set API base URL at runtime (e.g. https://localhost:7138).
// The API client will use this when present.
(window as any).__API_BASE_URL__ = (import.meta as any).env?.VITE_API_BASE_URL;

createRoot(document.getElementById("root")!).render(<App />);
