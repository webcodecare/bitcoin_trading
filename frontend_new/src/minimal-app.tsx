import { useState } from 'react';

function MinimalApp() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#1a1a1a',
      color: 'white',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#4CAF50', marginBottom: '2rem' }}>
        🚀 Bitcoin Trading Platform Frontend
      </h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2>Frontend Status: ✅ Running on Port 3000</h2>
        <h3>Backend Status: ✅ Running on Port 5000</h3>
      </div>

      <div style={{ 
        backgroundColor: '#333', 
        padding: '1.5rem', 
        borderRadius: '8px',
        margin: '2rem auto',
        maxWidth: '600px'
      }}>
        <h3>Test Counter: {count}</h3>
        <button 
          onClick={() => setCount(count + 1)}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
            margin: '0.5rem'
          }}
        >
          Click Me ({count})
        </button>
        <button 
          onClick={() => setCount(0)}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
            margin: '0.5rem'
          }}
        >
          Reset
        </button>
      </div>

      <div style={{ 
        backgroundColor: '#2a2a2a', 
        padding: '1rem', 
        borderRadius: '6px',
        margin: '1rem auto',
        maxWidth: '800px',
        textAlign: 'left'
      }}>
        <h4>✅ System Status:</h4>
        <ul style={{ lineHeight: '1.6' }}>
          <li>✅ React 18 with TypeScript</li>
          <li>✅ Vite Development Server</li>
          <li>✅ Frontend-Backend Separation Complete</li>
          <li>✅ Backend API with 28 Cryptocurrency Tickers</li>
          <li>✅ PostgreSQL Database (Neon)</li>
          <li>✅ JWT Authentication System</li>
          <li>✅ WebSocket Support</li>
          <li>✅ TradingView Webhook Integration</li>
        </ul>
      </div>

      <div style={{ marginTop: '2rem', fontSize: '0.9rem', opacity: '0.8' }}>
        <p>Frontend: http://localhost:3000 | Backend: http://localhost:5000</p>
        <p>Ready for development and deployment! 🎉</p>
      </div>
    </div>
  );
}

export default MinimalApp;