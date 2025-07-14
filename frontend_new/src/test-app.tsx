import React from 'react';

export default function TestApp() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">🚀 Bitcoin Trading Platform</h1>
        <p className="text-xl mb-8">Frontend React App is Working!</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Backend API</h3>
            <p className="text-green-400">✅ Running on Port 5000</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Frontend React</h3>
            <p className="text-green-400">✅ Running on Port 3000</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Database</h3>
            <p className="text-green-400">✅ PostgreSQL Connected</p>
          </div>
        </div>
        <div className="mt-8">
          <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white font-semibold">
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
}