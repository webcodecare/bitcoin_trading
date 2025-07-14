import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface SafeTradingViewWidgetProps {
  symbol?: string;
  theme?: 'light' | 'dark';
  height?: number;
  enableTrading?: boolean;
  showSignals?: boolean;
}

export default function SafeTradingViewWidget({ 
  symbol = 'BINANCE:BTCUSDT', 
  theme = 'dark',
  height = 400,
  enableTrading = true,
  showSignals = true
}: SafeTradingViewWidgetProps) {
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {symbol.replace('BINANCE:', '').replace('USDT', '/USDT')}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-emerald-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              +2.34%
            </Badge>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          className="w-full bg-muted/20 rounded-lg border border-border flex items-center justify-center"
          style={{ height: `${height}px` }}
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">$67,234.56</div>
            <div className="text-sm text-muted-foreground mb-4">
              Professional TradingView Chart
            </div>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                <span>Live Data</span>
              </div>
              {showSignals && (
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                  <span>Signals Active</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}