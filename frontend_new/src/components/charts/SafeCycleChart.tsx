import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";

interface SafeCycleChartProps {
  symbol?: string;
  height?: number;
  className?: string;
}

export default function SafeCycleChart({ 
  symbol = 'BTC', 
  height = 300,
  className = ""
}: SafeCycleChartProps) {
  
  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Cycle Forecaster
          </CardTitle>
          <Badge variant="outline">
            <BarChart3 className="h-3 w-3 mr-1" />
            {symbol}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          className="w-full bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-pink-900/20 rounded-lg border border-border flex items-center justify-center"
          style={{ height: `${height}px` }}
        >
          <div className="text-center">
            <div className="text-xl font-bold text-primary mb-2">Cycle Phase: Accumulation</div>
            <div className="text-sm text-muted-foreground mb-4">
              Next Bull Run: ~18 months
            </div>
            <div className="flex items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-400 rounded"></div>
                <span>Accumulation</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-400 rounded"></div>
                <span>Bull Market</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-400 rounded"></div>
                <span>Distribution</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-400 rounded"></div>
                <span>Bear Market</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}