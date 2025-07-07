import { useEffect } from 'react';
import SignalMoodBoard from '@/components/trading/SignalMoodBoard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Activity, TrendingUp, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MoodBoard() {
  useEffect(() => {
    document.title = 'Signal Mood Board - CryptoStrategy Pro';
  }, []);

  const stats = [
    {
      icon: <Sparkles className="w-5 h-5" />,
      label: 'Active Signals',
      value: '12',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: 'Bullish Mood',
      value: '68%',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      icon: <Activity className="w-5 h-5" />,
      label: 'Signal Strength',
      value: '4.2/5',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
    {
      icon: <Zap className="w-5 h-5" />,
      label: 'Real-time Updates',
      value: '5s',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Signal Mood Board</h1>
          <p className="text-muted-foreground mt-1">
            Real-time trading signals with emoji mood indicators
          </p>
        </div>
        <Badge variant="outline" className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live</span>
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <div className={stat.color}>{stat.icon}</div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-lg font-semibold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Mood Explanation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>🎭</span>
            <span>How Mood Board Works</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Signal Emotions</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🚀</span>
                  <span><strong>Very Bullish:</strong> Strong upward momentum detected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">📈</span>
                  <span><strong>Bullish:</strong> Positive trend signals</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">💚</span>
                  <span><strong>Optimistic:</strong> Favorable market conditions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">⚡</span>
                  <span><strong>Quick Signal:</strong> Fast momentum alerts</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Signal Strength</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <Sparkles className="w-3 h-3 text-green-500" />
                    <Sparkles className="w-3 h-3 text-green-500" />
                    <Sparkles className="w-3 h-3 text-green-500" />
                    <Sparkles className="w-3 h-3 text-green-500" />
                    <Sparkles className="w-3 h-3 text-green-500" />
                  </div>
                  <span>Maximum confidence signal</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <Sparkles className="w-3 h-3 text-yellow-500" />
                    <Sparkles className="w-3 h-3 text-yellow-500" />
                    <Sparkles className="w-3 h-3 text-yellow-500" />
                    <Sparkles className="w-3 h-3 text-gray-300" />
                    <Sparkles className="w-3 h-3 text-gray-300" />
                  </div>
                  <span>Moderate confidence signal</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <Sparkles className="w-3 h-3 text-red-500" />
                    <Sparkles className="w-3 h-3 text-gray-300" />
                    <Sparkles className="w-3 h-3 text-gray-300" />
                    <Sparkles className="w-3 h-3 text-gray-300" />
                    <Sparkles className="w-3 h-3 text-gray-300" />
                  </div>
                  <span>Low confidence signal</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Mood Board */}
      <SignalMoodBoard />
    </div>
  );
}