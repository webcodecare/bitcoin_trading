import { useEffect, useState } from 'react';

export default function TestApi() {
  const [status, setStatus] = useState('Testing...');
  const [tickers, setTickers] = useState([]);

  useEffect(() => {
    // Test API connection
    fetch('/api/tickers')
      .then(res => res.json())
      .then(data => {
        setTickers(data);
        setStatus(`Success! Found ${data.length} tickers`);
      })
      .catch(err => {
        setStatus(`Error: ${err.message}`);
      });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Connection Test</h1>
      <p className="text-lg mb-4">Status: {status}</p>
      {tickers.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Sample Tickers:</h2>
          <ul className="space-y-1">
            {tickers.slice(0, 5).map((ticker: any) => (
              <li key={ticker.id} className="bg-gray-100 p-2 rounded">
                {ticker.symbol} - {ticker.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}