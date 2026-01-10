import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AIYieldFarmingOptimizer() {
  const opportunities = [
    { protocol: 'Aave', apy: 12.5, tvl: '2.1B', risk: 'low', recommendation: 'high' },
    { protocol: 'Compound', apy: 8.3, tvl: '1.8B', risk: 'low', recommendation: 'medium' },
    { protocol: 'Curve', apy: 15.7, tvl: '4.2B', risk: 'medium', recommendation: 'high' }
  ];

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
      <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
        <TrendingUp className="w-6 h-6 text-green-400" />
        AI Yield Farming Optimizer
      </h3>

      <div className="space-y-3">
        {opportunities.map((opp, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-white font-bold">{opp.protocol}</div>
              <div className="text-green-400 font-bold text-xl">{opp.apy}% APY</div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="text-white/60">TVL: ${opp.tvl}</div>
              <div className={`px-2 py-1 rounded text-xs ${
                opp.recommendation === 'high' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {opp.recommendation} priority
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Button className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-500">
        <Zap className="w-4 h-4 mr-2" />
        Auto-Optimize Yields
      </Button>
    </div>
  );
}