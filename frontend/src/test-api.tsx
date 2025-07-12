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
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-primary">API Connection Test</h1>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-lg mb-4">Status: <span className="text-primary font-semibold">{status}</span></p>
          {tickers.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-foreground">Sample Tickers:</h2>
              <div className="grid gap-3">
                {tickers.slice(0, 5).map((ticker: any) => (
                  <div key={ticker.id} className="bg-secondary/50 border border-border p-4 rounded-lg">
                    <div className="font-semibold text-primary">{ticker.symbol}</div>
                    <div className="text-muted-foreground">{ticker.description}</div>
                    <div className="text-sm text-muted-foreground mt-1">Category: {ticker.category}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}