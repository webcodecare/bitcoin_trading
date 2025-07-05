import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CycleChartProps {
  symbol?: string;
  height?: number;
  className?: string;
}

interface CycleData {
  id: string;
  ticker: string;
  date: string;
  ma2y: string;
  deviation: string;
  createdAt: string;
}

export default function CycleChart({
  symbol = "BTC",
  height = 300,
  className,
}: CycleChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const { data: cycleData, isLoading } = useQuery({
    queryKey: ["/api/chart/cycle", symbol],
    queryFn: async () => {
      const response = await fetch(`/api/chart/cycle/${symbol}`);
      if (!response.ok) {
        throw new Error("Failed to fetch cycle data");
      }
      return await response.json() as CycleData[];
    },
  });

  const { data: forecastData } = useQuery({
    queryKey: ["/api/chart/forecast", symbol],
    queryFn: async () => {
      const response = await fetch(`/api/chart/forecast/${symbol}`);
      if (!response.ok) {
        throw new Error("Failed to fetch forecast data");
      }
      return await response.json();
    },
  });

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const loadChart = async () => {
      if (!window.LightweightCharts) {
        const script = document.createElement("script");
        script.src = "https://unpkg.com/lightweight-charts/dist/lightweight-charts.standalone.production.js";
        script.onload = initChart;
        document.head.appendChild(script);
      } else {
        initChart();
      }
    };

    const initChart = () => {
      if (!window.LightweightCharts || !chartContainerRef.current) return;

      const chart = window.LightweightCharts.createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height,
        layout: {
          background: { color: "transparent" },
          textColor: "#a0a0a0",
        },
        grid: {
          vertLines: { color: "#404040" },
          horzLines: { color: "#404040" },
        },
        crosshair: {
          mode: window.LightweightCharts.CrosshairMode.Normal,
        },
        rightPriceScale: {
          borderColor: "#404040",
        },
        timeScale: {
          borderColor: "#404040",
          timeVisible: true,
          secondsVisible: false,
        },
      });

      // 2-Year Moving Average Line
      const ma2ySeries = chart.addLineSeries({
        color: "#0052ff",
        lineWidth: 2,
        title: "2-Year MA",
      });

      // Price deviation area
      const deviationSeries = chart.addAreaSeries({
        topColor: "rgba(0, 212, 170, 0.4)",
        bottomColor: "rgba(0, 212, 170, 0.0)",
        lineColor: "#00d4aa",
        lineWidth: 2,
        title: "Price Deviation",
      });

      // Generate mock data for demonstration
      const generateMockData = () => {
        const data = [];
        const ma2yData = [];
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;

        for (let i = 0; i < 365 * 2; i++) {
          const time = (now - (365 * 2 - i) * oneDay) / 1000;
          const basePrice = 30000 + Math.sin(i * 0.01) * 20000 + Math.random() * 5000;
          const ma2y = basePrice * (0.8 + Math.sin(i * 0.005) * 0.2);
          const deviation = ((basePrice - ma2y) / ma2y) * 100;

          ma2yData.push({ time, value: ma2y });
          data.push({ time, value: Math.max(0, deviation) });
        }

        return { ma2yData, deviationData: data };
      };

      const { ma2yData, deviationData } = generateMockData();

      ma2ySeries.setData(ma2yData);
      deviationSeries.setData(deviationData);

      // Add halving event markers
      const halvingEvents = [
        { time: new Date("2020-05-11").getTime() / 1000, text: "Halving 2020" },
        { time: new Date("2024-04-19").getTime() / 1000, text: "Halving 2024" },
        { time: new Date("2028-04-01").getTime() / 1000, text: "Next Halving" },
      ];

      const markers = halvingEvents.map(event => ({
        time: event.time,
        position: "aboveBar",
        color: "#ffa502",
        shape: "circle",
        text: event.text,
      }));

      ma2ySeries.setMarkers(markers);

      // Handle resize
      const handleResize = () => {
        if (chartContainerRef.current) {
          chart.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        chart.remove();
      };
    };

    loadChart();
  }, [cycleData, forecastData, height]);

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
          <h3 className="text-lg font-semibold">2-Year Cycle Deviation Indicator</h3>
          <p className="text-sm text-muted-foreground">
            Price deviation from 2-year moving average with halving events
          </p>
        </div>
        <div ref={chartContainerRef} className="w-full" style={{ height }} />
        <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>2-Year MA</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-400 rounded"></div>
              <span>Price Deviation</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
              <span>Halving Events</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
