import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertCircle, Zap, BarChart3 } from 'lucide-react';

export default function MarketAnalysisDashboard() {
  const [selectedAsset, setSelectedAsset] = useState('SPY');
  const [timeframe, setTimeframe] = useState('1d');

  const marketData = {
    assets: [
      { symbol: 'SPY', price: 567.89, change: 2.3, sentiment: 0.72, trend: 'bullish' },
      { symbol: 'QQQ', price: 445.23, change: 3.1, sentiment: 0.68, trend: 'bullish' },
      { symbol: 'GLD', price: 192.45, change: -1.2, sentiment: 0.45, trend: 'neutral' },
      { symbol: 'BTC', price: 96543, change: 5.8, sentiment: 0.81, trend: 'bullish' },
    ],
    alerts: [
      { id: 1, type: 'Price Alert', asset: 'SPY', message: 'Breaking above 560 resistance', severity: 'medium' },
      { id: 2, type: 'Sentiment Flip', asset: 'QQQ', message: 'Sentiment shifted positive', severity: 'low' },
      { id: 3, type: 'Anomaly', asset: 'GLD', message: 'Unusual volume spike detected', severity: 'high' },
    ],
    opportunities: [
      { title: 'Tech Sector Rotation', confidence: 0.87, timeframe: '1-3 months', action: 'Consider rotating to QQQ' },
      { title: 'Gold Hedging', confidence: 0.73, timeframe: '2-4 weeks', action: 'Add defensive positioning' },
      { title: 'Crypto Strength', confidence: 0.91, timeframe: '1-2 weeks', action: 'Monitor BTC strength' },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Market Analysis</h2>
          <p className="text-white/60 text-sm">Real-time market monitoring with AI sentiment analysis</p>
        </div>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm"
        >
          <option value="1h">1 Hour</option>
          <option value="1d">1 Day</option>
          <option value="1w">1 Week</option>
          <option value="1m">1 Month</option>
        </select>
      </div>

      {/* Asset Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {marketData.assets.map((asset) => (
          <motion.div
            key={asset.symbol}
            whileHover={{ y: -5 }}
            onClick={() => setSelectedAsset(asset.symbol)}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              selectedAsset === asset.symbol
                ? 'bg-cyan-500/20 border-cyan-400'
                : 'bg-white/5 border-white/10 hover:border-white/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-white font-bold">{asset.symbol}</p>
              <span className={`text-xs font-semibold px-2 py-1 rounded ${
                asset.trend === 'bullish' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {asset.trend}
              </span>
            </div>
            <p className="text-lg font-bold text-cyan-400">${asset.price}</p>
            <p className={asset.change > 0 ? 'text-green-400 text-sm' : 'text-red-400 text-sm'}>
              {asset.change > 0 ? '+' : ''}{asset.change}%
            </p>
            <div className="mt-2 pt-2 border-t border-white/10">
              <p className="text-white/60 text-xs">Sentiment: {(asset.sentiment * 100).toFixed(0)}%</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Active Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 border border-white/10 rounded-lg p-6"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          Active Alerts
        </h3>
        <div className="space-y-2">
          {marketData.alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-3 rounded-lg border-l-4 flex items-center justify-between ${
                alert.severity === 'high' ? 'bg-red-500/10 border-red-400' : 'bg-yellow-500/10 border-yellow-400'
              }`}
            >
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">{alert.asset} - {alert.type}</p>
                <p className="text-white/60 text-xs">{alert.message}</p>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded ${
                alert.severity === 'high' ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300'
              }`}>
                {alert.severity}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Investment Opportunities */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 border border-white/10 rounded-lg p-6"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Identified Opportunities
        </h3>
        <div className="space-y-3">
          {marketData.opportunities.map((opp, idx) => (
            <motion.div
              key={idx}
              whileHover={{ x: 5 }}
              className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-white font-bold">{opp.title}</p>
                <span className="text-cyan-400 font-bold text-sm">{(opp.confidence * 100).toFixed(0)}%</span>
              </div>
              <p className="text-white/60 text-sm mb-2">{opp.action}</p>
              <p className="text-white/40 text-xs">Timeframe: {opp.timeframe}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Market Report Preview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/20 rounded-lg p-6"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          AI Market Report
        </h3>
        <div className="space-y-3 text-white/80 text-sm">
          <p>
            <span className="font-semibold text-white">Overall Sentiment:</span> Moderately Bullish (71% positive sentiment)
          </p>
          <p>
            <span className="font-semibold text-white">Key Trend:</span> Tech sector strength continuing, defensive rotation underway
          </p>
          <p>
            <span className="font-semibold text-white">Risk Level:</span> Moderate - Monitor Fed policy and earnings misses
          </p>
          <button className="mt-4 px-4 py-2 bg-cyan-500/20 border border-cyan-400 rounded-lg text-cyan-300 hover:bg-cyan-500/30 transition-all text-sm font-semibold">
            View Full Report
          </button>
        </div>
      </motion.div>
    </div>
  );
}