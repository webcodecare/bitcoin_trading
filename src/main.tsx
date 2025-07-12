import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/config"; // Load configuration early

createRoot(document.getElementById("root")!).render(<App />);
