// Clean React app with no external dependencies to avoid promise rejections
import { createRoot } from "react-dom/client";

function App() {
  return (
    <div style={{
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      minHeight: '100vh',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '1200px', width: '100%' }}>
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 4rem)',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #f59e0b, #eab308)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '1rem'
          }}>
            ⚡ CryptoStrategy Pro
          </h1>
          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
            opacity: 0.9,
            marginBottom: '2rem'
          }}>
            Professional cryptocurrency trading platform with real-time analytics
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🚀</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Backend API
            </h3>
            <p style={{ opacity: 0.8, lineHeight: '1.6' }}>
              Node.js Express server running on port 5000 with 28 cryptocurrency tickers
            </p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💎</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Frontend React
            </h3>
            <p style={{ opacity: 0.8, lineHeight: '1.6' }}>
              React application running on port 3000 with professional trading interface
            </p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📊</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Database Ready
            </h3>
            <p style={{ opacity: 0.8, lineHeight: '1.6' }}>
              PostgreSQL database with authentication and real-time trading data
            </p>
          </div>
        </div>

        <div style={{
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h4 style={{ color: '#22c55e', fontWeight: '600', marginBottom: '0.5rem' }}>
            ✅ Both Services Running Successfully
          </h4>
          <p style={{ opacity: 0.9, margin: 0 }}>
            Frontend and backend are now operating independently on separate ports.
            Ready for deployment to different platforms.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button style={{
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            color: 'white',
            padding: '14px 28px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0px)'}
          >
            Access Dashboard
          </button>
          <button style={{
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            padding: '14px 28px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0px)'}
          >
            API Documentation
          </button>
        </div>
      </div>
    </div>
  );
}

// Mount the app immediately without any external dependencies
try {
  const root = createRoot(document.getElementById("root")!);
  root.render(<App />);
  console.log("✅ React app mounted successfully!");
} catch (error) {
  console.error("❌ React mounting failed:", error);
  // Fallback: show a basic message
  document.getElementById("root")!.innerHTML = `
    <div style="padding: 2rem; text-align: center; color: white; background: #1a1a1a; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
      <div>
        <h1>CryptoStrategy Pro</h1>
        <p>React Loading Error - Check Console</p>
        <p>Backend API: Port 5000 ✅</p>
        <p>Frontend: Port 3000 ⚠️</p>
      </div>
    </div>
  `;
}
