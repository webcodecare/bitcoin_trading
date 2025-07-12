import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/errorHandler"; // Initialize global error handlers

createRoot(document.getElementById("root")!).render(<App />);
