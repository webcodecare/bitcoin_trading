import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeErrorHandlers } from "./lib/errorHandler";

// Initialize global error handlers to prevent console spam
initializeErrorHandlers();

createRoot(document.getElementById("root")!).render(<App />);
