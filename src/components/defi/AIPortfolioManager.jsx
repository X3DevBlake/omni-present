import React from 'react';
import { motion } from 'framer-motion';
import { Activity, PieChart } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function AIPortfolioManager({ userEmail }) {
  const allocation = [
    { asset: 'BTC', percent: 35, amount: 28500 },
    { asset: 'ETH', percent: 30, amount: 24500 },
    { asset: 'USDC', percent: 20, amount: 16300 },
    { asset: 'Other', percent: 15, amount: 12200 },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-black/40 border border-white/10 p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-400" />
          Portfolio Allocation
        </h3>
        <div className="space-y-3">
          {allocation.map((item, idx) => (
            <motion.div
              key={item.asset}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-white font-semibold">{item.asset}</p>
                <p className="text-cyan-400 text-sm">${item.amount.toLocaleString()}</p>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percent}%` }}
                  transition={{ delay: idx * 0.1 + 0.2, duration: 0.6 }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                />
              </div>
              <p className="text-white/50 text-xs mt-1">{item.percent}% allocation</p>
            </motion.div>
          ))}
        </div>
      </Card>

      <Card className="bg-black/40 border border-white/10 p-6">
        <h3 className="text-white font-bold mb-4">Rebalancing Recommendations</h3>
        <p className="text-white/60 text-center py-6">AI recommendations coming soon...</p>
      </Card>
    </div>
  );
}