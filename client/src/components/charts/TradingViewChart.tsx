import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface TradingViewChartProps {
  symbol?: string;
  interval?: string;
  height?: number;
  showSignals?: boolean;
  className?: string;
}

interface ChartData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface Signal {
  id: string;
  ticker: string;
  signalType: "buy" | "sell";
  price: string;
  timestamp: string;
  source: string;
  note?: string;
}

export default function TradingViewChart({
  symbol = "BTCUSDT",
  interval = "1h",
  height = 400,
  showSignals = true,
  className,
}: TradingViewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const [signals, setSignals] = useState<Signal[]>([]);

  // Fetch market data
  const { data: marketData, isLoading: isLoadingMarket } = useQuery({
    queryKey: ["/api/market/klines", symbol, interval],
    queryFn: async () => {
      const response = await fetch(`/api/market/klines/${symbol}?interval=${interval}&limit=100`);
      if (!response.ok) {
        throw new Error("Failed to fetch market data");
      }
      return await response.json();
    },
    refetchInterval: 60000, // Refetch every minute
  });

  // Fetch signals if enabled
  const { data: signalData, isLoading: isLoadingSignals } = useQuery({
    queryKey: ["/api/signals", symbol],
    queryFn: async () => {
      const response = await fetch(`/api/signals?ticker=${symbol}&limit=50`);
      if (!response.ok) {
        throw new Error("Failed to fetch signals");
      }
      return await response.json();
    },
    enabled: showSignals,
  });

  // WebSocket for real-time updates
  useWebSocket((message) => {
    if (message.type === "new_signal" && message.signal) {
      const signal = message.signal as Signal;
      if (signal.ticker === symbol) {
        setSignals(prev => [signal, ...prev.slice(0, 49)]); // Keep last 50 signals
        
        // Add marker to chart if it exists
        if (chartRef.current && window.LightweightCharts) {
          // This would add a real-time marker to the chart
          console.log("New signal received:", signal);
        }
      }
    }
  });

  useEffect(() => {
    if (signalData) {
      setSignals(signalData);
    }
  }, [signalData]);

  useEffect(() => {
    if (!marketData || !chartContainerRef.current) return;

    // Load TradingView Lightweight Charts library
    const loadChart = async () => {
      if (!window.LightweightCharts) {
        // Load the library dynamically
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

      // Clear any existing chart
      if (chartRef.current) {
        chartRef.current.remove();
      }

      // Create chart
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

      // Add candlestick series
      const candleSeries = chart.addCandlestickSeries({
        upColor: "#00d4aa",
        downColor: "#ff4757",
        borderUpColor: "#00d4aa",
        borderDownColor: "#ff4757",
        wickUpColor: "#00d4aa",
        wickDownColor: "#ff4757",
      });

      // Format data for the chart
      const formattedData = marketData.map((item: ChartData) => ({
        time: new Date(item.time).getTime() / 1000,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      }));

      candleSeries.setData(formattedData);

      // Add volume series
      const volumeSeries = chart.addHistogramSeries({
        color: "#26a69a",
        priceFormat: {
          type: "volume",
        },
        priceScaleId: "",
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      const volumeData = marketData.map((item: ChartData) => ({
        time: new Date(item.time).getTime() / 1000,
        value: item.volume,
        color: item.close > item.open ? "#00d4aa" : "#ff4757",
      }));

      volumeSeries.setData(volumeData);

      // Add signal markers if enabled
      if (showSignals && signals.length > 0) {
        const markers = signals.map((signal) => ({
          time: new Date(signal.timestamp).getTime() / 1000,
          position: signal.signalType === "buy" ? "belowBar" : "aboveBar",
          color: signal.signalType === "buy" ? "#00d4aa" : "#ff4757",
          shape: signal.signalType === "buy" ? "arrowUp" : "arrowDown",
          text: `${signal.signalType.toUpperCase()} @ $${signal.price}`,
        }));

        try {
          candleSeries.setMarkers(markers);
        } catch (error) {
          console.warn("Failed to set markers:", error);
        }
      }

      chartRef.current = chart;

      // Handle resize
      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        if (chartRef.current) {
          chartRef.current.remove();
        }
      };
    };

    loadChart();

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [marketData, signals, height, showSignals]);

  if (isLoadingMarket || (showSignals && isLoadingSignals)) {
    return (
      <Card className={className}>
        <div className="p-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className={`h-[${height}px] w-full`} />
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">{symbol}</h3>
            <p className="text-sm text-muted-foreground">
              {interval} intervals {showSignals && "• With trading signals"}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">Live</span>
          </div>
        </div>
        <div ref={chartContainerRef} className="w-full" style={{ height }} />
      </div>
    </Card>
  );
}
