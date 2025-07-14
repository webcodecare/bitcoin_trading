import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface SafeSimpleDemoChartProps {
  title: string;
  symbol: string;
  className?: string;
}

export default function SafeSimpleDemoChart({ title, symbol, className }: SafeSimpleDemoChartProps) {
  // Mock data for demonstration
  const mockData = {
    BTCUSDT: { price: 67234.56, change: 2.34 },
    ETHUSDT: { price: 3456.78, change: -1.23 },
    SOLUSDT: { price: 145.32, change: 4.56 },
    ADAUSDT: { price: 0.89, change: 1.78 }
  };

  const data = mockData[symbol as keyof typeof mockData] || { price: 50000, change: 0 };
  const isPositive = data.change > 0;

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isPositive ? "default" : "destructive"}>
              {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {data.change.toFixed(2)}%
            </Badge>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
        </div>
        <div className="text-2xl font-bold">
          ${data.price.toLocaleString()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="w-full h-48 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-emerald-900/20 rounded-lg border border-border flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-semibold text-primary mb-2">Live Demo Chart</div>
              <div className="text-sm text-muted-foreground mb-4">
                Real-time {symbol} data
              </div>
              <div className="flex items-center justify-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span>Buy Signal</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <span>Sell Signal</span>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded px-2 py-1 text-xs">
            Latest: <span className="font-bold text-emerald-400">BUY</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}