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

    // Advanced TradingView widget configuration with professional features
    const widgetConfig = {
      "autosize": true,
      "symbol": tradingViewSymbol,
      "interval": "15",
      "timezone": "Etc/UTC",
      "theme": "dark",
      "style": "1",
      "locale": "en",
      "toolbar_bg": "#131722",
      "enable_publishing": false,
      "allow_symbol_change": true,
      "container_id": "tradingview_widget",
      "hide_top_toolbar": false,
      "hide_legend": false,
      "save_image": true,
      "hide_volume": false,
      "support_host": "https://www.tradingview.com",
      "studies": [
        "RSI@tv-basicstudies",
        "MASimple@tv-basicstudies",
        "MACD@tv-basicstudies",
        "BB@tv-basicstudies",
        "StochasticRSI@tv-basicstudies",
        "Volume@tv-basicstudies"
      ],
      "show_popup_button": true,
      "popup_width": "1200",
      "popup_height": "800",
      "overrides": {
        "paneProperties.background": "#131722",
        "paneProperties.backgroundType": "solid",
        "paneProperties.vertGridProperties.color": "#2a2e39",
        "paneProperties.horzGridProperties.color": "#2a2e39", 
        "paneProperties.vertGridProperties.style": 0,
        "paneProperties.horzGridProperties.style": 0,
        "symbolWatermarkProperties.transparency": 90,
        "scalesProperties.textColor": "#787b86",
        "scalesProperties.backgroundColor": "#131722",
        "mainSeriesProperties.candleStyle.upColor": "#089981",
        "mainSeriesProperties.candleStyle.downColor": "#f23645",
        "mainSeriesProperties.candleStyle.wickUpColor": "#089981",
        "mainSeriesProperties.candleStyle.wickDownColor": "#f23645",
        "mainSeriesProperties.candleStyle.borderUpColor": "#089981",
        "mainSeriesProperties.candleStyle.borderDownColor": "#f23645",
        "volumePaneSize": "medium"
      },
      "enabled_features": [
        "study_templates",
        "create_volume_indicator_by_default",
        "header_symbol_search",
        "header_resolutions",
        "header_chart_type",
        "header_settings",
        "header_indicators",
        "header_compare",
        "header_undo_redo",
        "header_screenshot",
        "header_fullscreen_button",
        "use_localstorage_for_settings",
        "drawing_templates",
        "left_toolbar",
        "control_bar",
        "timeframes_toolbar",
        "edit_buttons_in_legend",
        "context_menus",
        "border_around_the_chart",
        "remove_library_container_border"
      ],
      "disabled_features": [
        "header_saveload",
        "go_to_date"
      ],
      "favorites": {
        "intervals": ["1", "5", "15", "30", "60", "240", "1D", "1W"],
        "chartTypes": ["Area", "Candles", "Line"]
      },
      "custom_css_url": "",
      "loading_screen": {
        "backgroundColor": "#131722",
        "foregroundColor": "#2962ff"
      }
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

      {/* Advanced Trading Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Panel */}
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <h4 className="font-semibold text-white mb-4">Advanced Order Panel</h4>
            <div className="space-y-4">
              {/* Order Type */}
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Order Type</label>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">Market</Button>
                  <Button variant="ghost" size="sm" className="flex-1">Limit</Button>
                  <Button variant="ghost" size="sm" className="flex-1">Stop</Button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Amount (USDT)</label>
                <div className="flex space-x-2">
                  <input 
                    type="number" 
                    placeholder="0.00"
                    className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                  />
                </div>
                <div className="flex space-x-1 mt-2">
                  <Button variant="ghost" size="sm" className="text-xs">25%</Button>
                  <Button variant="ghost" size="sm" className="text-xs">50%</Button>
                  <Button variant="ghost" size="sm" className="text-xs">75%</Button>
                  <Button variant="ghost" size="sm" className="text-xs">Max</Button>
                </div>
              </div>

              {/* Buy/Sell Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={() => handleQuickTrade('buy')}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-3"
                >
                  BUY {ticker.replace('USDT', '')}
                </Button>
                <Button 
                  onClick={() => handleQuickTrade('sell')}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-3"
                >
                  SELL {ticker.replace('USDT', '')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Features */}
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <h4 className="font-semibold text-white mb-4">Professional Features</h4>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>✓ RSI & MACD Indicators</span>
                <Badge variant="outline" className="text-xs">Active</Badge>
              </div>
              <div className="flex justify-between">
                <span>✓ Bollinger Bands</span>
                <Badge variant="outline" className="text-xs">Active</Badge>
              </div>
              <div className="flex justify-between">
                <span>✓ Volume Analysis</span>
                <Badge variant="outline" className="text-xs">Active</Badge>
              </div>
              <div className="flex justify-between">
                <span>✓ Drawing Tools</span>
                <Badge variant="secondary" className="text-xs">Available</Badge>
              </div>
              <div className="flex justify-between">
                <span>✓ Price Alerts</span>
                <Badge variant="secondary" className="text-xs">Available</Badge>
              </div>
              <div className="flex justify-between">
                <span>✓ Chart Patterns</span>
                <Badge variant="secondary" className="text-xs">Available</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Info */}
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <h4 className="font-semibold text-white mb-4">Market Information</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">24h Volume:</span>
                <span className="text-white font-medium">$2.4B</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">24h High:</span>
                <span className="text-green-400 font-medium">$71,200</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">24h Low:</span>
                <span className="text-red-400 font-medium">$65,800</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Market Cap:</span>
                <span className="text-white font-medium">$1.37T</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Fear & Greed:</span>
                <Badge variant="outline" className="text-yellow-400">Neutral 52</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}