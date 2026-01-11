import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function AutonomousTrader({ userEmail }) {
  const strategies = [
    { name: 'Momentum Trading', winRate: 62.5, trades: 120, status: 'active' },
    { name: 'Mean Reversion', winRate: 58.3, trades: 89, status: 'active' },
    { name: 'Grid Trading', winRate: 71.2, trades: 156, status: 'active' },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-black/40 border border-white/10 p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          Active Trading Strategies
        </h3>
        <div className="space-y-4">
          {strategies.map((strategy, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 bg-black/40 border border-white/10 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-white font-semibold">{strategy.name}</p>
                <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-semibold">
                  {strategy.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white/60 text-xs mb-1">Win Rate</p>
                  <p className="text-cyan-400 font-bold">{strategy.winRate}%</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-1">Trades</p>
                  <p className="text-cyan-400 font-bold">{strategy.trades}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      <Card className="bg-black/40 border border-white/10 p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Recent Trades
        </h3>
        <p className="text-white/60 text-center py-8">Trade history loading...</p>
      </Card>
    </div>
  );
}