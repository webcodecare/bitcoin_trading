import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface TradingViewRealWidgetProps {
  ticker: string;
  onTrade?: (action: 'buy' | 'sell', price: number) => void;
}

export default function TradingViewRealWidget({ ticker, onTrade }: TradingViewRealWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = '';

    // Create TradingView widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container';
    widgetContainer.style.height = '100%';
    widgetContainer.style.width = '100%';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.height = 'calc(100% - 25px)';
    widgetDiv.style.width = '100%';

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;

    // Convert our ticker format to TradingView format
    const tradingViewSymbol = ticker === 'BTCUSDT' ? 'BINANCE:BTCUSDT' :
                             ticker === 'ETHUSDT' ? 'BINANCE:ETHUSDT' :
                             ticker === 'SOLUSDT' ? 'BINANCE:SOLUSDT' :
                             ticker === 'ADAUSDT' ? 'BINANCE:ADAUSDT' :
                             `BINANCE:${ticker}`;

    // TradingView widget configuration matching tradingview.com
    const widgetConfig = {
      "autosize": true,
      "symbol": tradingViewSymbol,
      "interval": "15",
      "timezone": "Etc/UTC",
      "theme": "dark",
      "style": "1",
      "locale": "en",
      "toolbar_bg": "#f1f3f6",
      "enable_publishing": false,
      "allow_symbol_change": true,
      "container_id": "tradingview_widget",
      "hide_top_toolbar": false,
      "hide_legend": false,
      "save_image": false,
      "hide_volume": false,
      "support_host": "https://www.tradingview.com",
      "studies": [
        "RSI@tv-basicstudies",
        "MASimple@tv-basicstudies"
      ],
      "show_popup_button": true,
      "popup_width": "1000",
      "popup_height": "650",
      "overrides": {
        "paneProperties.background": "#131722",
        "paneProperties.vertGridProperties.color": "#363c4e",
        "paneProperties.horzGridProperties.color": "#363c4e",
        "symbolWatermarkProperties.transparency": 90,
        "scalesProperties.textColor": "#AAA",
        "mainSeriesProperties.candleStyle.wickUpColor": "#26a69a",
        "mainSeriesProperties.candleStyle.wickDownColor": "#ef5350"
      },
      "enabled_features": [
        "study_templates",
        "create_volume_indicator_by_default"
      ],
      "disabled_features": [
        "use_localstorage_for_settings",
        "volume_force_overlay"
      ]
    };

    script.innerHTML = JSON.stringify(widgetConfig);

    widgetContainer.appendChild(widgetDiv);
    widgetContainer.appendChild(script);

    // Copyright notice (required by TradingView)
    const copyrightDiv = document.createElement('div');
    copyrightDiv.className = 'tradingview-widget-copyright';
    copyrightDiv.innerHTML = '<a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span class="blue-text">Track all markets on TradingView</span></a>';
    copyrightDiv.style.height = '25px';
    copyrightDiv.style.lineHeight = '25px';
    copyrightDiv.style.textAlign = 'center';
    copyrightDiv.style.fontSize = '12px';
    copyrightDiv.style.fontFamily = '-apple-system,BlinkMacSystemFont,Trebuchet MS,Roboto,Ubuntu,sans-serif';
    copyrightDiv.style.color = '#B2B5BE';

    widgetContainer.appendChild(copyrightDiv);
    containerRef.current.appendChild(widgetContainer);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [ticker]);

  const handleQuickTrade = (action: 'buy' | 'sell') => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to start trading",
        variant: "destructive",
      });
      return;
    }

    // Simulate getting current price from TradingView
    const simulatedPrice = action === 'buy' ? 67000 : 66500;
    
    if (onTrade) {
      onTrade(action, simulatedPrice);
    }

    toast({
      title: `${action.toUpperCase()} Order`,
      description: `${action.charAt(0).toUpperCase() + action.slice(1)} order placed for ${ticker}`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Chart Header with TradingView Style */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">{ticker} / USDT</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <Badge variant="outline" className="bg-green-900 text-green-300 border-green-600">
              Live
            </Badge>
            <span className="text-xs">TradingView Professional Charts</span>
          </div>
        </div>
        
        {/* Quick Trade Actions */}
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => handleQuickTrade('buy')}
            className="bg-green-600 hover:bg-green-700 text-white font-medium px-6"
            size="sm"
          >
            BUY
          </Button>
          <Button
            onClick={() => handleQuickTrade('sell')}
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-6"
            size="sm"
          >
            SELL
          </Button>
        </div>
      </div>

      {/* TradingView Chart Container */}
      <Card className="bg-[#131722] border-gray-700">
        <CardContent className="p-0">
          <div 
            ref={containerRef}
            className="w-full h-[600px] rounded-lg overflow-hidden"
            style={{ minHeight: '600px' }}
          />
        </CardContent>
      </Card>

      {/* Chart Features Info */}
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-4">
          <div className="text-sm text-gray-300">
            <h4 className="font-semibold text-white mb-2">Professional TradingView Features:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                ✓ Real-time data
              </div>
              <div>
                ✓ Technical indicators
              </div>
              <div>
                ✓ Drawing tools
              </div>
              <div>
                ✓ Multiple timeframes
              </div>
              <div>
                ✓ Volume analysis
              </div>
              <div>
                ✓ Price alerts
              </div>
              <div>
                ✓ Chart patterns
              </div>
              <div>
                ✓ Symbol search
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}