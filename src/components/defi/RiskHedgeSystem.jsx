import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function RiskHedgeSystem({ userEmail }) {
  const hedges = [
    { type: 'Stop Loss', trigger: '-5%', status: 'active', protected: 'BTC, ETH' },
    { type: 'Take Profit', trigger: '+15%', status: 'active', protected: 'OMNI/USDT' },
    { type: 'Volatility Hedge', trigger: 'VIX > 25', status: 'active', protected: 'Portfolio' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 rounded-lg p-4"
        >
          <p className="text-red-400 text-sm font-semibold mb-1">Max Drawdown</p>
          <p className="text-3xl font-bold text-white">-8.2%</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-green-500/10 border border-green-500/30 rounded-lg p-4"
        >
          <p className="text-green-400 text-sm font-semibold mb-1">Risk Score</p>
          <p className="text-3xl font-bold text-white">3.2/10</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4"
        >
          <p className="text-blue-400 text-sm font-semibold mb-1">Hedges Active</p>
          <p className="text-3xl font-bold text-white">3</p>
        </motion.div>
      </div>

      <Card className="bg-black/40 border border-white/10 p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-400" />
          Active Hedge Positions
        </h3>
        <div className="space-y-3">
          {hedges.map((hedge, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 bg-black/40 border border-white/10 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-white font-semibold">{hedge.type}</p>
                <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs">
                  {hedge.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-white/60 text-xs mb-1">Trigger</p>
                  <p className="text-cyan-400">{hedge.trigger}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-1">Protecting</p>
                  <p className="text-cyan-400">{hedge.protected}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}