import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Bot, BarChart3, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AITradingStrategyPanel from '../components/trading/AITradingStrategyPanel';
import MarketPredictionDashboard from '../components/trading/MarketPredictionDashboard';
import RealTimeMarketFeed from '../components/trading/RealTimeMarketFeed';
import BacktestingEngine from '../components/trading/BacktestingEngine';

export default function AdvancedDeFiTrading() {
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white flex items-center gap-3 mb-2">
            <Zap className="w-8 h-8 text-cyan-400" />
            Advanced DeFi Trading
          </h1>
          <p className="text-white/60 text-lg">AI-powered trading strategies & market analysis</p>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="strategies" className="space-y-6">
          <TabsList className="bg-white/10 border border-white/20 p-1 rounded-lg w-full justify-start overflow-x-auto flex-nowrap">
            <TabsTrigger value="strategies" className="flex items-center gap-2 flex-shrink-0">
              <Bot className="w-4 h-4" />
              AI Strategies
            </TabsTrigger>
            <TabsTrigger value="live" className="flex items-center gap-2 flex-shrink-0">
              <TrendingUp className="w-4 h-4" />
              Live Feed
            </TabsTrigger>
            <TabsTrigger value="predictions" className="flex items-center gap-2 flex-shrink-0">
              <TrendingUp className="w-4 h-4" />
              Predictions
            </TabsTrigger>
            <TabsTrigger value="backtest" className="flex items-center gap-2 flex-shrink-0">
              <BarChart3 className="w-4 h-4" />
              Backtest
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 flex-shrink-0">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* AI Strategies Tab */}
          <TabsContent value="strategies">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {userEmail ? (
                <AITradingStrategyPanel userEmail={userEmail} />
              ) : (
                <p className="text-white/60 text-center py-12">Loading...</p>
              )}
            </motion.div>
          </TabsContent>

          {/* Live Feed Tab */}
          <TabsContent value="live">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <RealTimeMarketFeed />
            </motion.div>
          </TabsContent>

          {/* Market Predictions Tab */}
          <TabsContent value="predictions">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <MarketPredictionDashboard />
            </motion.div>
          </TabsContent>

          {/* Backtesting Tab */}
          <TabsContent value="backtest">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {userEmail ? (
                <BacktestingEngine userEmail={userEmail} />
              ) : (
                <p className="text-white/60 text-center py-12">Loading...</p>
              )}
            </motion.div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="text-white font-bold mb-4">Portfolio Performance</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Total Trades</span>
                    <span className="text-cyan-400 font-semibold">247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Win Rate</span>
                    <span className="text-green-400 font-semibold">73.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Avg ROI</span>
                    <span className="text-cyan-400 font-semibold">12.5%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="text-white font-bold mb-4">Risk Metrics</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Sharpe Ratio</span>
                    <span className="text-cyan-400 font-semibold">2.34</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Max Drawdown</span>
                    <span className="text-red-400 font-semibold">-8.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Volatility</span>
                    <span className="text-yellow-400 font-semibold">18.5%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}