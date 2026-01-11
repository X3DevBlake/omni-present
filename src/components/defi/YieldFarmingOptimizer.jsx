import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Sprout, Zap, TrendingUp, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function YieldFarmingOptimizer({ userEmail }) {
  const { data: strategies = [] } = useQuery({
    queryKey: ['yieldStrategies', userEmail],
    queryFn: () => base44.entities.TradingStrategy.filter(
      { user_email: userEmail },
      '-created_date',
      50
    ),
    enabled: !!userEmail
  });

  const totalDeposited = strategies.reduce((sum, s) => sum + (s.capital_deployed || 0), 0);
  const totalYield = strategies.reduce((sum, s) => sum + (s.yield_earned || 0), 0);
  const avgAPY = strategies.length > 0 
    ? (strategies.reduce((sum, s) => sum + (s.apy || 0), 0) / strategies.length).toFixed(2)
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 border border-green-500/30 rounded-lg p-4"
        >
          <p className="text-green-400 text-sm font-semibold mb-1">Capital Deployed</p>
          <p className="text-2xl font-bold text-white">${totalDeposited.toFixed(2)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4"
        >
          <p className="text-blue-400 text-sm font-semibold mb-1">Yield Earned</p>
          <p className="text-2xl font-bold text-white">${totalYield.toFixed(2)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4"
        >
          <p className="text-purple-400 text-sm font-semibold mb-1">Avg APY</p>
          <p className="text-2xl font-bold text-white">{avgAPY}%</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4"
        >
          <p className="text-cyan-400 text-sm font-semibold mb-1">Active Strategies</p>
          <p className="text-2xl font-bold text-white">{strategies.length}</p>
        </motion.div>
      </div>

      {/* Strategies */}
      <Card className="bg-black/40 border border-white/10 p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Sprout className="w-5 h-5 text-green-400" />
          Yield Farming Strategies
        </h3>

        {strategies.length === 0 ? (
          <p className="text-white/60 text-center py-8">No active yield farming strategies</p>
        ) : (
          <div className="space-y-4">
            {strategies.map((strategy, idx) => {
              const roi = totalDeposited > 0 
                ? ((strategy.yield_earned / strategy.capital_deployed) * 100).toFixed(2)
                : 0;

              return (
                <motion.div
                  key={strategy.id || idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-4 bg-black/20 rounded-lg border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-white font-bold text-sm">{strategy.name}</p>
                      <p className="text-white/60 text-xs uppercase">{strategy.platform}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-sm">${(strategy.capital_deployed || 0).toFixed(2)}</p>
                      <p className="text-green-400 text-xs font-semibold">{strategy.apy || 0}% APY</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div>
                      <div className="flex justify-between text-xs text-white/60 mb-1">
                        <span>Yield Earned</span>
                        <span>${(strategy.yield_earned || 0).toFixed(2)}</span>
                      </div>
                      <Progress value={Math.min(100, (roi * 10))} className="h-1.5" />
                    </div>
                  </div>

                  <div className="flex justify-between text-xs text-white/60 mb-2">
                    <span>Status: <span className="text-green-400">{strategy.status}</span></span>
                    <span>ROI: {roi}%</span>
                  </div>

                  <p className="text-white/50 text-xs">Strategy: {strategy.description || 'Optimized yield farming'}</p>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Optimization Recommendations */}
      <Card className="bg-cyan-500/10 border border-cyan-500/30 p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-cyan-400" />
          AI Optimization Recommendations
        </h3>
        <div className="space-y-3 text-sm text-white/80">
          <div className="p-3 bg-black/20 rounded flex gap-3">
            <Zap className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <p>Rebalance high-risk positions to lock in gains and reduce exposure</p>
          </div>
          <div className="p-3 bg-black/20 rounded flex gap-3">
            <TrendingUp className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <p>Consider compounding earned yields for accelerated growth</p>
          </div>
          <div className="p-3 bg-black/20 rounded flex gap-3">
            <Target className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <p>Explore higher-yield opportunities on lower-risk protocols</p>
          </div>
        </div>
      </Card>
    </div>
  );
}