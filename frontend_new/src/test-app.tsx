import { createRoot } from "react-dom/client";

function TestApp() {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Frontend Test - Working!</h1>
      <p>React app is mounted and running correctly</p>
      <p>Timestamp: {new Date().toLocaleString()}</p>
    </div>
  );
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<TestApp />);
} else {
  console.error("Root element not found");
}