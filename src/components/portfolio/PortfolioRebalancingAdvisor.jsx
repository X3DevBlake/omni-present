import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function PortfolioRebalancingAdvisor() {
  const [showRebalancingDetails, setShowRebalancingDetails] = useState(false);

  const rebalancingData = {
    currentAllocation: {
      stocks: 0.68,
      bonds: 0.25,
      cash: 0.07,
    },
    targetAllocation: {
      stocks: 0.60,
      bonds: 0.35,
      cash: 0.05,
    },
    trades: [
      { action: 'SELL', security: 'VTSAX', amount: 25000, shares: 315, reason: 'Reduce overweight stocks' },
      { action: 'BUY', security: 'BND', amount: 22000, shares: 200, reason: 'Increase bond allocation' },
      { action: 'BUY', security: 'VUG', amount: 3000, shares: 25, reason: 'Rebalance growth exposure' },
    ],
    expectedImpact: {
      riskReduction: 0.12,
      volatilityBefore: 0.145,
      volatilityAfter: 0.128,
      sharpRatioImprovement: 0.18,
      maxDrawdownReduction: 0.08,
    },
    costs: {
      transactionFees: 45,
      taxImpact: -1200,
      totalNetCost: 1245,
    },
    timeline: {
      estimatedDuration: '2-3 business days',
      rebalancingUrgency: 'medium',
      recommendedTiming: 'This week',
    },
  };

  const getAllocationColor = (allocation) => {
    if (allocation > 0.65) return 'from-red-500/20 border-red-400/20';
    if (allocation > 0.55) return 'from-yellow-500/20 border-yellow-400/20';
    return 'from-green-500/20 border-green-400/20';
  };

  return (
    <div className="space-y-6">
      {/* Current vs Target */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 border border-white/10 rounded-lg p-6"
      >
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <ArrowRightLeft className="w-6 h-6 text-cyan-400" />
          Allocation Analysis
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {Object.entries(rebalancingData.currentAllocation).map(([asset, current]) => {
            const target = rebalancingData.targetAllocation[asset];
            const drift = ((current - target) * 100).toFixed(1);
            const isOverweight = current > target;

            return (
              <motion.div
                key={asset}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-gradient-to-br ${getAllocationColor(current)} border rounded-lg p-4`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-semibold capitalize">{asset}</p>
                  {isOverweight ? (
                    <TrendingUp className="w-4 h-4 text-red-400" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-blue-400 transform rotate-180" />
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Current:</span>
                    <span className="text-white font-bold">{(current * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${current * 100}%` }}
                      className="h-full bg-cyan-500"
                    />
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-white/70">Target:</span>
                    <span className="text-white/60">{(target * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden border border-white/20">
                    <div
                      style={{ width: `${target * 100}%` }}
                      className="h-full bg-white/30"
                    />
                  </div>

                  <div className={`pt-2 border-t border-white/20 flex items-center justify-between ${
                    isOverweight ? 'text-red-400' : 'text-blue-400'
                  }`}>
                    <span className="text-xs">Drift:</span>
                    <span className="font-bold">{isOverweight ? '+' : ''}{drift}%</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => setShowRebalancingDetails(!showRebalancingDetails)}
          className="w-full px-4 py-2 bg-cyan-500/20 border border-cyan-400 rounded-lg text-cyan-300 hover:bg-cyan-500/30 transition-all font-semibold"
        >
          {showRebalancingDetails ? 'Hide Details' : 'View Rebalancing Plan'}
        </motion.button>
      </motion.div>

      {/* Detailed Trades */}
      {showRebalancingDetails && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-lg p-6"
        >
          <h4 className="text-white font-bold mb-4">Proposed Trades</h4>
          <div className="space-y-2 mb-6">
            {rebalancingData.trades.map((trade, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-3 bg-white/5 rounded-lg border ${
                  trade.action === 'BUY'
                    ? 'border-green-400/30'
                    : 'border-red-400/30'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-white font-semibold">{trade.security}</p>
                    <p className="text-white/60 text-xs mt-1">{trade.reason}</p>
                  </div>
                  <span className={`px-3 py-1 rounded text-xs font-bold ${
                    trade.action === 'BUY'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {trade.action}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">${trade.amount.toLocaleString()} ({trade.shares} shares)</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Expected Impact */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-white/60 text-xs mb-1">Risk Reduction</p>
              <p className="text-green-400 font-bold">{(rebalancingData.expectedImpact.riskReduction * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-white/60 text-xs mb-1">Volatility Impact</p>
              <p className="text-white text-sm">
                {(rebalancingData.expectedImpact.volatilityBefore * 100).toFixed(2)}% →{' '}
                <span className="text-green-400 font-bold">
                  {(rebalancingData.expectedImpact.volatilityAfter * 100).toFixed(2)}%
                </span>
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-white/60 text-xs mb-1">Sharpe Ratio Improvement</p>
              <p className="text-green-400 font-bold">+{(rebalancingData.expectedImpact.sharpRatioImprovement * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-white/60 text-xs mb-1">Max Drawdown Reduction</p>
              <p className="text-green-400 font-bold">-{(rebalancingData.expectedImpact.maxDrawdownReduction * 100).toFixed(1)}%</p>
            </div>
          </div>

          {/* Costs */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
            <h5 className="text-white font-semibold mb-3 text-sm">Rebalancing Costs</h5>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Transaction Fees</span>
                <span className="text-white">${rebalancingData.costs.transactionFees}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Tax Impact (estimated)</span>
                <span className="text-red-400">${rebalancingData.costs.taxImpact}</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-2 mt-2">
                <span className="text-white font-semibold">Total Net Cost</span>
                <span className="text-red-400 font-bold">${rebalancingData.costs.totalNetCost}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-400/20 rounded-lg p-4 mb-6">
            <p className="text-white/60 text-xs mb-2">Timeline & Urgency</p>
            <p className="text-white font-semibold">{rebalancingData.timeline.recommendedTiming}</p>
            <p className="text-white/70 text-sm mt-1">
              Estimated duration: {rebalancingData.timeline.estimatedDuration}
            </p>
          </div>

          {/* Execute Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="w-full px-6 py-3 bg-green-500/20 border border-green-400 rounded-lg text-green-300 hover:bg-green-500/30 font-bold transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            Execute Rebalancing
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}