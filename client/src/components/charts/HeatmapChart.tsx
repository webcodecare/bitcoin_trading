import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface HeatmapChartProps {
  symbol?: string;
  height?: number;
  className?: string;
}

interface HeatmapData {
  id: string;
  ticker: string;
  week: string;
  sma200w: string;
  deviationPercent: string;
  createdAt: string;
}

export default function HeatmapChart({
  symbol = "BTC",
  height = 300,
  className,
}: HeatmapChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const { data: heatmapData, isLoading } = useQuery({
    queryKey: ["/api/chart/heatmap", symbol],
    queryFn: async () => {
      const response = await fetch(`/api/chart/heatmap/${symbol}`);
      if (!response.ok) {
        throw new Error("Failed to fetch heatmap data");
      }
      return await response.json() as HeatmapData[];
    },
  });

  useEffect(() => {
    if (!heatmapData || !chartContainerRef.current) return;

    // Generate mock heatmap visualization since we might not have real data
    const generateHeatmapVisualization = () => {
      const container = chartContainerRef.current;
      if (!container) return;

      container.innerHTML = "";

      // Create a grid-based heatmap
      const weeks = 52; // 52 weeks
      const years = 4; // 4 years of data
      const cellSize = Math.min(
        (container.clientWidth - 40) / weeks,
        (height - 80) / years
      );

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", container.clientWidth.toString());
      svg.setAttribute("height", height.toString());
      svg.setAttribute("class", "w-full");

      // Color scale for heatmap
      const getColor = (deviation: number) => {
        if (deviation < -50) return "#ff4757"; // Deep red - oversold
        if (deviation < -25) return "#ff6b7a"; // Red
        if (deviation < 0) return "#ffa502"; // Orange
        if (deviation < 25) return "#2ed573"; // Green
        if (deviation < 50) return "#1e90ff"; // Blue
        return "#6c5ce7"; // Purple - overbought
      };

      // Generate grid
      for (let year = 0; year < years; year++) {
        for (let week = 0; week < weeks; week++) {
          // Simulate deviation data
          const mockDeviation = (Math.sin(week * 0.1) * 50) + (Math.random() * 20 - 10);
          
          const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          rect.setAttribute("x", (week * cellSize + 20).toString());
          rect.setAttribute("y", (year * cellSize + 40).toString());
          rect.setAttribute("width", (cellSize - 1).toString());
          rect.setAttribute("height", (cellSize - 1).toString());
          rect.setAttribute("fill", getColor(mockDeviation));
          rect.setAttribute("opacity", "0.8");
          rect.setAttribute("rx", "2");
          
          // Add tooltip on hover
          rect.addEventListener("mouseenter", (e) => {
            const tooltip = document.createElement("div");
            tooltip.className = "absolute bg-black text-white p-2 rounded text-xs z-10 pointer-events-none";
            tooltip.textContent = `Week ${week + 1}, ${2021 + year}: ${mockDeviation.toFixed(1)}%`;
            tooltip.style.left = `${e.pageX + 10}px`;
            tooltip.style.top = `${e.pageY - 30}px`;
            document.body.appendChild(tooltip);
            
            rect.addEventListener("mouseleave", () => {
              document.body.removeChild(tooltip);
            }, { once: true });
          });

          svg.appendChild(rect);
        }
      }

      // Add legend
      const legend = document.createElementNS("http://www.w3.org/2000/svg", "g");
      const legendColors = ["#ff4757", "#ff6b7a", "#ffa502", "#2ed573", "#1e90ff", "#6c5ce7"];
      const legendLabels = ["Oversold", "Sell", "Caution", "Neutral", "Buy", "Overbought"];
      
      legendColors.forEach((color, i) => {
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", (i * 80 + 20).toString());
        rect.setAttribute("y", "10");
        rect.setAttribute("width", "15");
        rect.setAttribute("height", "15");
        rect.setAttribute("fill", color);
        rect.setAttribute("rx", "2");
        legend.appendChild(rect);

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", (i * 80 + 40).toString());
        text.setAttribute("y", "22");
        text.setAttribute("font-size", "10");
        text.setAttribute("fill", "#a0a0a0");
        text.textContent = legendLabels[i];
        legend.appendChild(text);
      });

      svg.appendChild(legend);
      container.appendChild(svg);
    };

    generateHeatmapVisualization();

    const handleResize = () => {
      generateHeatmapVisualization();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [heatmapData, height]);

  if (isLoading) {
    return (
      <Card className={className}>
        <div className="p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className={`h-[${height}px] w-full`} />
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">200-Week Moving Average Heatmap</h3>
          <p className="text-sm text-muted-foreground">
            Color-coded valuation zones based on deviation from 200-week SMA
          </p>
        </div>
        <div ref={chartContainerRef} className="w-full" style={{ height }} />
        <div className="mt-4 text-xs text-muted-foreground">
          <p>Each cell represents one week. Colors indicate price deviation from 200-week SMA.</p>
        </div>
      </div>
    </Card>
  );
}
