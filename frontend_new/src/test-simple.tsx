import { createRoot } from "react-dom/client";

function SimpleApp() {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>CryptoStrategy Pro - Frontend Working!</h1>
      <p>✅ React application is running successfully</p>
      <p>✅ API Backend at: {import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}</p>
      <p>✅ Frontend on port 3000</p>
      
      <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#f0f0f0", borderRadius: "5px" }}>
        <h3>API Test:</h3>
        <button onClick={async () => {
          try {
            const response = await fetch('/api/chart/ohlc/BTCUSDT?limit=3');
            const data = await response.json();
            console.log('OHLC Data:', data);
            alert(`API Working! Got ${data.length} OHLC records`);
          } catch (error) {
            console.error('API Error:', error);
            alert('API Error - check console');
          }
        }}>
          Test OHLC API
        </button>
      </div>
      
      <div style={{ marginTop: "15px" }}>
        <a href="/dashboard" style={{ marginRight: "10px" }}>Dashboard</a>
        <a href="/auth" style={{ marginRight: "10px" }}>Login</a>
        <a href="/trading">Trading</a>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<SimpleApp />);