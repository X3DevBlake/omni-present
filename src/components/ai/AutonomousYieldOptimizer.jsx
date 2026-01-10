import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRightLeft, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function AutonomousYieldOptimizer() {
  const [opportunities, setOpportunities] = useState([]);
  const [activeStrategies, setActiveStrategies] = useState([]);

  useEffect(() => {
    const findOpportunities = () => {
      const newOpps = [
        {
          type: 'arbitrage',
          chains: ['Ethereum', 'Polygon'],
          profit: 3.2,
          protocol: 'Uniswap → QuickSwap',
          execution: 'pending'
        },
        {
          type: 'yield_optimization',
          protocol: 'Aave',
          currentAPY: 8.5,
          betterAPY: 12.3,
          migration: 'Aave → Compound',
          execution: 'ready'
        },
        {
          type: 'flash_loan',
          opportunity: 'Price discrepancy',
          potential: 1.8,
          risk: 'low',
          execution: 'analyzing'
        }
      ];
      setOpportunities(newOpps);
    };

    findOpportunities();
    const interval = setInterval(findOpportunities, 10000);
    return () => clearInterval(interval);
  }, []);

  const executeStrategy = (opp) => {
    const newStrategy = {
      ...opp,
      executedAt: new Date().toISOString(),
      status: 'active'
    };
    setActiveStrategies([newStrategy, ...activeStrategies].slice(0, 5));
    toast.success(`AI executing ${opp.type} strategy`);
  };

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
      <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-yellow-400" />
        Autonomous Yield Optimizer
      </h3>

      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
        <div className="text-yellow-400 font-bold text-lg">AI Scanning 24/7</div>
        <div className="text-white/60 text-sm">Monitoring {opportunities.length} real-time opportunities across chains</div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="text-white font-bold mb-3">🎯 Detected Opportunities</h4>
          <div className="space-y-3">
            {opportunities.map((opp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white font-bold capitalize">{opp.type.replace('_', ' ')}</div>
                  {opp.profit && (
                    <div className="text-green-400 font-bold">+{opp.profit}%</div>
                  )}
                </div>
                <div className="text-white/60 text-sm mb-3">
                  {opp.protocol || opp.migration || opp.opportunity}
                </div>
                <button
                  onClick={() => executeStrategy(opp)}
                  className="w-full px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded text-white text-sm font-bold"
                >
                  Auto-Execute
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-3">⚡ Active Strategies</h4>
          <div className="space-y-2">
            {activeStrategies.map((strategy, i) => (
              <div key={i} className="bg-black/40 border border-white/10 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-white font-bold text-sm capitalize">{strategy.type.replace('_', ' ')}</div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div className="text-white/60 text-xs">{new Date(strategy.executedAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}