import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Lightbulb, Zap, BarChart3, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PortfolioAdvisor() {
  const [recommendations, setRecommendations] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [selectedRec, setSelectedRec] = useState(null);

  useEffect(() => {
    analyzePortfolio();
    const interval = setInterval(analyzePortfolio, 10000);
    return () => clearInterval(interval);
  }, []);

  const analyzePortfolio = async () => {
    setIsAnalyzing(true);
    try {
      // Mock portfolio data - in real app, fetch from user account
      const mockPortfolio = [
        { asset: 'OMNI', allocation: 35, trend: 5.2, performance: 'good' },
        { asset: 'ETH', allocation: 25, trend: -2.1, performance: 'neutral' },
        { asset: 'USDT', allocation: 25, trend: 0.1, performance: 'stable' },
        { asset: 'BTC', allocation: 15, trend: 3.8, performance: 'good' }
      ];
      setPortfolio(mockPortfolio);

      // Generate AI recommendations
      const recs = generateRecommendations(mockPortfolio);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error analyzing portfolio:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateRecommendations = (assets) => {
    const recommendations = [];
    const totalAlloc = assets.reduce((sum, a) => sum + a.allocation, 0);
    
    // Diversification check
    if (assets.some(a => a.allocation > 40)) {
      recommendations.push({
        id: 'diversify',
        type: 'diversification',
        title: 'Rebalance for Diversification',
        description: 'One asset exceeds 40% allocation. Consider reducing concentration risk.',
        action: 'Rebalance now',
        impact: 'Reduce portfolio volatility by ~8%',
        priority: 'high'
      });
    }

    // Underperforming asset
    const underperforming = assets.find(a => a.trend < -2);
    if (underperforming) {
      recommendations.push({
        id: 'underperform',
        type: 'optimization',
        title: `Review ${underperforming.asset} Position`,
        description: `${underperforming.asset} is down ${Math.abs(underperforming.trend)}%. Evaluate hold vs. reallocate.`,
        action: 'View analysis',
        impact: 'Potential 3-5% recovery opportunity',
        priority: 'medium'
      });
    }

    // Market trend opportunity
    const topPerformer = assets.reduce((best, a) => a.trend > best.trend ? a : best);
    recommendations.push({
      id: 'opportunity',
      type: 'opportunity',
      title: `Capitalize on ${topPerformer.asset} Momentum`,
      description: `${topPerformer.asset} trending +${topPerformer.trend}%. Market sentiment bullish.`,
      action: 'Increase allocation',
      impact: 'Potential 5-7% upside',
      priority: 'medium'
    });

    // Yield strategy
    recommendations.push({
      id: 'yield',
      type: 'strategy',
      title: 'Optimize Staking Returns',
      description: 'Current yield: 4.2%. Available strategies could achieve 6-8% APY.',
      action: 'View staking options',
      impact: 'Additional $50-100/month revenue',
      priority: 'low'
    });

    return recommendations;
  };

  const simulateRecommendation = (rec) => {
    setSelectedRec(rec);
  };

  const priorityColor = {
    high: 'from-red-500/20 to-red-600/10 border-red-500/30',
    medium: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
    low: 'from-green-500/20 to-green-600/10 border-green-500/30'
  };

  const priorityBadge = {
    high: 'bg-red-500/20 text-red-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    low: 'bg-green-500/20 text-green-400'
  };

  return (
    <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <Lightbulb className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-white font-bold">AI Portfolio Advisor</h3>
            <p className="text-white/60 text-xs">Personalized investment recommendations</p>
          </div>
        </div>
        {isAnalyzing && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-cyan-400 text-xs">Analyzing...</span>
          </div>
        )}
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {portfolio.map((asset, idx) => (
          <motion.div
            key={asset.asset}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white/5 rounded-lg p-3"
          >
            <div className="text-white font-semibold text-sm mb-1">{asset.asset}</div>
            <div className="text-white text-lg font-bold mb-1">{asset.allocation}%</div>
            <div className={`text-xs ${asset.trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {asset.trend > 0 ? '+' : ''}{asset.trend}%
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recommendations List */}
      <div className="space-y-3">
        <div className="text-white/60 text-sm font-semibold">Active Recommendations</div>
        <AnimatePresence>
          {recommendations.map((rec, idx) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => simulateRecommendation(rec)}
              className={`cursor-pointer bg-gradient-to-r ${priorityColor[rec.priority]} border rounded-lg p-4 hover:scale-102 transition-all group`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-white/10 rounded group-hover:bg-white/20 transition-colors">
                    {rec.type === 'opportunity' ? <Zap className="w-4 h-4 text-cyan-400" /> :
                     rec.type === 'strategy' ? <TrendingUp className="w-4 h-4 text-green-400" /> :
                     <BarChart3 className="w-4 h-4 text-purple-400" />}
                  </div>
                  <h4 className="text-white font-semibold text-sm">{rec.title}</h4>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${priorityBadge[rec.priority]}`}>
                  {rec.priority}
                </span>
              </div>
              <p className="text-white/70 text-xs mb-3">{rec.description}</p>
              <div className="flex items-center justify-between">
                <div className="text-xs text-white/60">{rec.action}</div>
                <div className="text-xs text-green-400 font-semibold">{rec.impact}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Simulation View */}
      <AnimatePresence>
        {selectedRec && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-6 bg-black/40 rounded-lg p-4 border border-cyan-500/20"
          >
            <div className="flex items-start justify-between mb-3">
              <h4 className="text-white font-bold text-sm">Impact Simulation</h4>
              <button
                onClick={() => setSelectedRec(null)}
                className="text-white/40 hover:text-white text-lg"
              >
                ×
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Portfolio volatility:</span>
                <span className="text-white">-3.2% reduction</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Expected ROI:</span>
                <span className="text-green-400">+{Math.floor(Math.random() * 8) + 2}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Implementation cost:</span>
                <span className="text-white">0.1% fees</span>
              </div>
            </div>
            <button className="mt-3 w-full py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-400 rounded-lg text-xs font-semibold transition-colors">
              Execute Strategy
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}