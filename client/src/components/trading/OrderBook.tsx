import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
}

interface OrderBookProps {
  symbol: string;
}

export default function OrderBook({ symbol }: OrderBookProps) {
  const [bids, setBids] = useState<OrderBookEntry[]>([]);
  const [asks, setAsks] = useState<OrderBookEntry[]>([]);
  const [lastPrice, setLastPrice] = useState<number>(67000);
  const [priceChange, setPriceChange] = useState<number>(0);

  // Generate realistic order book data
  useEffect(() => {
    const generateOrderBook = () => {
      const basePrice = lastPrice;
      const newBids: OrderBookEntry[] = [];
      const newAsks: OrderBookEntry[]= [];
      
      // Generate bids (below current price)
      for (let i = 0; i < 10; i++) {
        const price = basePrice - (i + 1) * (Math.random() * 50 + 10);
        const quantity = Math.random() * 2 + 0.1;
        const total = price * quantity;
        newBids.push({ price, quantity, total });
      }
      
      // Generate asks (above current price)
      for (let i = 0; i < 10; i++) {
        const price = basePrice + (i + 1) * (Math.random() * 50 + 10);
        const quantity = Math.random() * 2 + 0.1;
        const total = price * quantity;
        newAsks.push({ price, quantity, total });
      }
      
      setBids(newBids);
      setAsks(newAsks.reverse()); // Reverse to show lowest ask first
    };

    generateOrderBook();
    const interval = setInterval(generateOrderBook, 3000);
    return () => clearInterval(interval);
  }, [lastPrice]);

  // Update price periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * 200;
      setLastPrice(prev => Math.max(60000, prev + change));
      setPriceChange(change);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => price.toFixed(2);
  const formatQuantity = (qty: number) => qty.toFixed(4);

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg">Order Book</CardTitle>
          <Badge variant="outline" className="text-xs">
            {symbol.replace('USDT', '')}/USDT
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          {/* Header */}
          <div className="grid grid-cols-3 gap-2 px-4 py-2 text-xs text-gray-400 border-b border-gray-700">
            <div>Price (USDT)</div>
            <div className="text-right">Amount</div>
            <div className="text-right">Total</div>
          </div>

          {/* Asks (Sell orders) */}
          <div className="space-y-0.5">
            {asks.map((ask, index) => (
              <div 
                key={`ask-${index}`}
                className="grid grid-cols-3 gap-2 px-4 py-1 text-xs hover:bg-red-900/20 relative"
              >
                <div 
                  className="absolute inset-0 bg-red-500/10"
                  style={{ width: `${Math.min(100, (ask.quantity / 2) * 100)}%` }}
                />
                <div className="text-red-400 relative z-10">{formatPrice(ask.price)}</div>
                <div className="text-right text-white relative z-10">{formatQuantity(ask.quantity)}</div>
                <div className="text-right text-gray-300 relative z-10">{ask.total.toFixed(0)}</div>
              </div>
            ))}
          </div>

          {/* Current Price */}
          <div className="px-4 py-3 border-y border-gray-700">
            <div className="flex items-center justify-between">
              <div className={`text-lg font-bold ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatPrice(lastPrice)}
              </div>
              <div className={`text-sm ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Bids (Buy orders) */}
          <div className="space-y-0.5">
            {bids.map((bid, index) => (
              <div 
                key={`bid-${index}`}
                className="grid grid-cols-3 gap-2 px-4 py-1 text-xs hover:bg-green-900/20 relative"
              >
                <div 
                  className="absolute inset-0 bg-green-500/10"
                  style={{ width: `${Math.min(100, (bid.quantity / 2) * 100)}%` }}
                />
                <div className="text-green-400 relative z-10">{formatPrice(bid.price)}</div>
                <div className="text-right text-white relative z-10">{formatQuantity(bid.quantity)}</div>
                <div className="text-right text-gray-300 relative z-10">{bid.total.toFixed(0)}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}