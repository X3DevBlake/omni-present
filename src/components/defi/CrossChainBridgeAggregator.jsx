import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CrossChainBridgeAggregator() {
  const routes = [
    { from: 'Ethereum', to: 'Polygon', time: '5 min', fee: '$2.50', best: true },
    { from: 'Ethereum', to: 'Arbitrum', time: '10 min', fee: '$1.80', best: false },
    { from: 'BSC', to: 'Avalanche', time: '3 min', fee: '$0.50', best: true }
  ];

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
      <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
        <ArrowRightLeft className="w-6 h-6 text-purple-400" />
        Cross-Chain Bridge
      </h3>

      <div className="space-y-3">
        {routes.map((route, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02 }}
            className={`rounded-xl p-4 border ${
              route.best 
                ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30' 
                : 'bg-gradient-to-r from-white/5 to-white/10 border-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold">{route.from}</span>
                <ArrowRightLeft className="w-4 h-4 text-white/60" />
                <span className="text-white font-bold">{route.to}</span>
              </div>
              {route.best && (
                <div className="px-2 py-1 bg-green-500/20 border border-green-500/40 rounded text-green-400 text-xs">
                  Best Route
                </div>
              )}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">{route.time}</span>
              <span className="text-cyan-400 font-bold">{route.fee}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}