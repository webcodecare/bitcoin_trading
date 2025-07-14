import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Thermometer } from "lucide-react";

interface SafeHeatmapChartProps {
  symbol?: string;
  height?: number;
  className?: string;
}

export default function SafeHeatmapChart({ 
  symbol = 'BTC', 
  height = 400,
  className = ""
}: SafeHeatmapChartProps) {
  
  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            200-Week Heatmap
          </CardTitle>
          <Badge variant="outline">
            <Thermometer className="h-3 w-3 mr-1" />
            {symbol}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          className="w-full bg-gradient-to-br from-red-900/20 via-yellow-900/20 to-emerald-900/20 rounded-lg border border-border flex items-center justify-center"
          style={{ height: `${height}px` }}
        >
          <div className="text-center">
            <div className="text-xl font-bold text-primary mb-2">Heat Index: 0.65</div>
            <div className="text-sm text-muted-foreground mb-4">
              200-Week SMA Analysis
            </div>
            <div className="flex items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-400 rounded"></div>
                <span>Overheated</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                <span>Normal</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-emerald-400 rounded"></div>
                <span>Undervalued</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}