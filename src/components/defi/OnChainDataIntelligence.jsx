import React from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, Users } from 'lucide-react';

export default function OnChainDataIntelligence() {
  const metrics = [
    { label: 'Whale Activity', value: 'High', icon: Users, color: 'text-blue-400', trend: '+15%' },
    { label: 'Gas Prices', value: '12 Gwei', icon: Activity, color: 'text-green-400', trend: '-8%' },
    { label: 'TVL Growth', value: '$2.4B', icon: TrendingUp, color: 'text-purple-400', trend: '+23%' }
  ];

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
      <h3 className="text-white font-bold text-xl mb-4">📊 On-Chain Intelligence</h3>

      <div className="space-y-3">
        {metrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-white/5 to-white/10 border border-white/10 rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-6 h-6 ${metric.color}`} />
                <div>
                  <div className="text-white/60 text-sm">{metric.label}</div>
                  <div className="text-white font-bold">{metric.value}</div>
                </div>
              </div>
              <div className="text-green-400 font-bold">{metric.trend}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}