import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, TrendingUp, AlertTriangle, Bell, Zap, Target } from 'lucide-react';
import { toast } from 'sonner';

export default function AIPortfolioAssistant({ portfolio, onRecommendation }) {
  const [insights, setInsights] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    analyzePortfolio();
    const interval = setInterval(checkMarketConditions, 30000);
    return () => clearInterval(interval);
  }, [portfolio]);

  const analyzePortfolio = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const newInsights = [
        {
          type: 'opportunity',
          title: 'High-Yield Farming Detected',
          description: 'OMNI/ETH pool showing 245% APY with low risk',
          action: 'Recommend allocating 15% of portfolio',
          confidence: 92,
          icon: TrendingUp,
          color: 'green'
        },
        {
          type: 'risk',
          title: 'Portfolio Concentration Risk',
          description: 'Over 60% exposure to single asset',
          action: 'Diversify into stablecoins or BTC',
          confidence: 88,
          icon: AlertTriangle,
          color: 'yellow'
        },
        {
          type: 'timing',
          title: 'Optimal Swap Window',
          description: 'Gas fees 40% below average - good time for rebalancing',
          action: 'Execute planned token swaps now',
          confidence: 95,
          icon: Zap,
          color: 'cyan'
        }
      ];
      
      setInsights(newInsights);
      setIsAnalyzing(false);
    }, 2000);
  };

  const checkMarketConditions = () => {
    // Simulate market change detection
    if (Math.random() > 0.7) {
      const notification = {
        id: Date.now(),
        type: 'alert',
        message: 'OMNI price up 8% - Consider taking profits',
        timestamp: new Date()
      };
      
      setNotifications(prev => [notification, ...prev.slice(0, 4)]);
      toast.success(notification.message, { icon: '📈' });
    }
  };

  const acceptRecommendation = (insight) => {
    toast.success(`Implementing: ${insight.title}`);
    if (onRecommendation) onRecommendation(insight);
  };

  return (
    <div className="space-y-6">
      {/* AI Assistant Header */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Brain className="w-6 h-6 text-purple-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-white font-bold text-xl">AI Portfolio Assistant</h3>
            <div className="text-purple-400 text-sm">Powered by advanced market analysis</div>
          </div>
        </div>
        
        {isAnalyzing && (
          <div className="flex items-center gap-2 text-white/60">
            <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
            Analyzing market conditions...
          </div>
        )}
      </div>

      {/* Real-time Notifications */}
      {notifications.length > 0 && (
        <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-5 h-5 text-cyan-400" />
            <span className="text-white font-semibold">Market Alerts</span>
          </div>
          <div className="space-y-2">
            {notifications.map(notif => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 rounded-lg p-3 text-sm text-white/80"
              >
                {notif.message}
                <div className="text-white/40 text-xs mt-1">
                  {notif.timestamp.toLocaleTimeString()}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* AI Insights */}
      <div className="space-y-4">
        <h4 className="text-white font-bold flex items-center gap-2">
          <Target className="w-5 h-5 text-cyan-400" />
          Personalized Insights
        </h4>
        
        {insights.map((insight, i) => {
          const Icon = insight.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-black/40 backdrop-blur-xl border border-${insight.color}-500/30 rounded-2xl p-6`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl bg-${insight.color}-500/20 flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-6 h-6 text-${insight.color}-400`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="text-white font-bold">{insight.title}</h5>
                    <div className={`px-2 py-1 rounded-lg bg-${insight.color}-500/20 text-${insight.color}-400 text-xs`}>
                      {insight.confidence}% confidence
                    </div>
                  </div>
                  
                  <p className="text-white/70 text-sm mb-3">{insight.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-400 text-sm">{insight.action}</span>
                    <button
                      onClick={() => acceptRecommendation(insight)}
                      className={`px-4 py-2 bg-${insight.color}-500 hover:bg-${insight.color}-600 text-white rounded-lg text-sm transition-all`}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Market Trend Analysis */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h4 className="text-white font-bold mb-4">Market Trend Analysis</h4>
        <div className="space-y-3">
          {[
            { asset: 'OMNI', trend: 'Bullish', confidence: 'High', change: '+12.5%' },
            { asset: 'ETH', trend: 'Neutral', confidence: 'Medium', change: '+2.1%' },
            { asset: 'BTC', trend: 'Bullish', confidence: 'High', change: '+8.3%' }
          ].map((item, i) => (
            <div key={i} className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
              <div>
                <span className="text-white font-semibold">{item.asset}</span>
                <span className={`ml-3 text-sm ${item.trend === 'Bullish' ? 'text-green-400' : 'text-yellow-400'}`}>
                  {item.trend}
                </span>
              </div>
              <div className="text-right">
                <div className="text-green-400 font-semibold">{item.change}</div>
                <div className="text-white/60 text-xs">{item.confidence} confidence</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}