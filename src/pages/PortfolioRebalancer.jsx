import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, RefreshCw, TrendingUp, AlertTriangle } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import EnhancedHubNav from '../components/navigation/EnhancedHubNav';
import AIPortfolioAssistant from '../components/defi/AIPortfolioAssistant';
import { Pie } from 'recharts';
import { toast } from 'sonner';

export default function PortfolioRebalancer() {
  const [portfolio, setPortfolio] = useState([
    { name: 'OMNI', value: 5000, target: 40, current: 35, color: '#00f5ff' },
    { name: 'ETH', value: 3000, target: 30, current: 21, color: '#a855f7' },
    { name: 'USDT', value: 4000, target: 20, current: 28, color: '#10b981' },
    { name: 'BTC', value: 2000, target: 10, current: 14, color: '#f59e0b' }
  ]);
  const [autoRebalance, setAutoRebalance] = useState(false);
  const [rebalanceThreshold, setRebalanceThreshold] = useState(5);

  const totalValue = portfolio.reduce((sum, asset) => sum + asset.value, 0);

  const calculateRebalanceNeeded = () => {
    return portfolio.some(asset => Math.abs(asset.current - asset.target) > rebalanceThreshold);
  };

  const executeRebalance = () => {
    toast.success('Portfolio rebalanced successfully!');
    const rebalanced = portfolio.map(asset => ({
      ...asset,
      current: asset.target,
      value: (totalValue * asset.target) / 100
    }));
    setPortfolio(rebalanced);
  };

  useEffect(() => {
    if (autoRebalance && calculateRebalanceNeeded()) {
      executeRebalance();
    }
  }, [autoRebalance, portfolio]);

  return (
    <>
      <EnhancedHubNav currentHub="DeFiHub" />
      <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Portfolio Rebalancer</span>
          </h1>
          <p className="text-white/60 text-lg">AI-powered automated portfolio optimization</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Portfolio Overview */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-bold text-xl mb-4">Current Portfolio</h3>
            <div className="mb-6">
              <div className="text-3xl font-bold text-white mb-2">${totalValue.toLocaleString()}</div>
              <div className="text-green-400 text-sm">+12.5% this month</div>
            </div>

            <div className="space-y-3">
              {portfolio.map((asset, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full" style={{ backgroundColor: asset.color }} />
                      <span className="text-white font-semibold">{asset.name}</span>
                    </div>
                    <span className="text-white">${asset.value.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-white/60">Current: </span>
                      <span className="text-white">{asset.current}%</span>
                    </div>
                    <div>
                      <span className="text-white/60">Target: </span>
                      <span className="text-cyan-400">{asset.target}%</span>
                    </div>
                    {Math.abs(asset.current - asset.target) > rebalanceThreshold && (
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    )}
                  </div>
                  <div className="mt-2 bg-white/10 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all"
                      style={{ width: `${asset.current}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rebalancing Controls */}
          <div className="space-y-6">
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-bold text-xl mb-4">Rebalancing Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Auto Rebalance</span>
                  <button
                    onClick={() => setAutoRebalance(!autoRebalance)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      autoRebalance 
                        ? 'bg-green-500 text-white' 
                        : 'bg-white/5 text-white/60'
                    }`}
                  >
                    {autoRebalance ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-white/60">Rebalance Threshold</span>
                    <span className="text-white">{rebalanceThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={rebalanceThreshold}
                    onChange={(e) => setRebalanceThreshold(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                {calculateRebalanceNeeded() && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-yellow-400 mb-2">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-semibold">Rebalance Recommended</span>
                    </div>
                    <p className="text-white/60 text-sm">
                      Some assets have drifted beyond the threshold
                    </p>
                  </div>
                )}

                <button
                  onClick={executeRebalance}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 transition-all"
                >
                  <RefreshCw className="w-5 h-5 inline mr-2" />
                  Rebalance Now
                </button>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                <h3 className="text-white font-bold">AI Recommendations</h3>
              </div>
              
              <div className="space-y-3">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-white text-sm font-semibold mb-1">Increase OMNI Allocation</div>
                  <div className="text-white/60 text-xs">Market sentiment is bullish. Consider +5%</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-white text-sm font-semibold mb-1">Reduce USDT Exposure</div>
                  <div className="text-white/60 text-xs">Over-allocated. Recommend -8%</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-white text-sm font-semibold mb-1">Optimal Timing</div>
                  <div className="text-white/60 text-xs">Gas fees are low. Good time to rebalance</div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Portfolio Assistant */}
          <div className="mt-6">
            <AIPortfolioAssistant 
              portfolio={portfolio}
              onRecommendation={(insight) => {
                if (insight.type === 'opportunity') executeRebalance();
              }}
            />
          </div>
        </div>
      </div>
    </AuroraBackground>
    </>
  );
}