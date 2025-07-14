import { Switch, Route } from "wouter";

function TestHome() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">CryptoStrategy Pro</h1>
        <p className="text-xl mb-8">Professional Bitcoin Trading Platform</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Real-time Signals</h3>
            <p>Get instant buy/sell alerts from our advanced algorithms</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
            <p>200-week heatmaps and cycle forecasting tools</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Professional Grade</h3>
            <p>Enterprise-level security and reliability</p>
          </div>
        </div>
        
        <div className="mt-8">
          <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold">
            Get Started
          </button>
          <button className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg font-semibold ml-4">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TestApp() {
  return (
    <Switch>
      <Route path="/" component={TestHome} />
      <Route>404 - Page Not Found</Route>
    </Switch>
  );
}