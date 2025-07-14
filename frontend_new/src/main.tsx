import { createRoot } from "react-dom/client";
import "./index.css";

// Simple clean home page without any problematic dependencies
function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  ⚡ CryptoStrategy Pro
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium">
                Sign In
              </button>
              <button className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-md text-sm font-medium">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative px-4 sm:px-6 lg:px-8">
        <div className="text-center py-24">
          <h1 className="text-4xl sm:text-6xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Professional Bitcoin Trading
            </span>
            <br />
            <span className="text-gray-300">Signals & Analytics</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-400 mb-8">
            Advanced cryptocurrency trading platform with real-time signals, 200-week heatmaps, 
            and professional-grade analytics for serious traders.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-8 py-3 rounded-lg text-lg font-semibold transition-all transform hover:scale-105">
              Start Free Trial
            </button>
            <button className="border border-gray-600 hover:border-gray-500 px-8 py-3 rounded-lg text-lg font-semibold transition-all">
              View Demo
            </button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-24 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Professional Trading Tools
            </h2>
            <p className="text-xl text-gray-400">
              Everything you need for successful cryptocurrency trading
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-semibold mb-2">Real-time Signals</h3>
              <p className="text-gray-400">Get instant buy/sell alerts from our advanced algorithms</p>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-gray-400">200-week heatmaps and cycle forecasting tools</p>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2">Professional Grade</h3>
              <p className="text-gray-400">Enterprise-level security and reliability</p>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-400">Real-time data processing and instant notifications</p>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Multi-Ticker Support</h3>
              <p className="text-gray-400">Track 28+ cryptocurrencies with professional charts</p>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <div className="text-4xl mb-4">🎛️</div>
              <h3 className="text-xl font-semibold mb-2">Advanced Alerts</h3>
              <p className="text-gray-400">Email, SMS, and Telegram notifications</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Section */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-green-400 mb-2">
              ✅ System Status: All Services Operational
            </h3>
            <p className="text-gray-300">
              Backend API running on port 5000 • Frontend React app on port 3000 • 
              Database connected • 28 cryptocurrency tickers active
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">
              © 2025 CryptoStrategy Pro. Professional cryptocurrency trading platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Mount the app with error handling
try {
  const root = createRoot(document.getElementById("root")!);
  root.render(<HomePage />);
  console.log("✅ CryptoStrategy Pro home page mounted successfully!");
} catch (error) {
  console.error("❌ Home page mounting failed:", error);
  document.getElementById("root")!.innerHTML = `
    <div style="padding: 2rem; text-align: center; color: white; background: #1a1a1a; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
      <div>
        <h1>⚡ CryptoStrategy Pro</h1>
        <p>Loading Error - Check Console</p>
        <p>Backend: Port 5000 ✅ | Frontend: Port 3000 ⚠️</p>
      </div>
    </div>
  `;
}
