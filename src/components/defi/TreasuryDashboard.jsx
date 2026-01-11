import React from 'react';
import { motion } from 'framer-motion';
import { Users, Wallet } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function TreasuryDashboard({ userEmail }) {
  const treasury = [
    { asset: 'OMNI', amount: 5000000, value: 12100000 },
    { asset: 'ETH', amount: 850, value: 2720000 },
    { asset: 'USDC', amount: 3200000, value: 3200000 },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-black/40 border border-white/10 p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-green-400" />
          Treasury Holdings
        </h3>
        <div className="space-y-3">
          {treasury.map((item, idx) => (
            <motion.div
              key={item.asset}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-3 bg-black/40 border border-white/10 rounded-lg flex items-center justify-between"
            >
              <div>
                <p className="text-white font-semibold">{item.asset}</p>
                <p className="text-white/60 text-sm">{item.amount.toLocaleString()} tokens</p>
              </div>
              <p className="text-cyan-400 font-bold">${(item.value / 1000000).toFixed(1)}M</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
          <p className="text-white/60 text-sm mb-1">Total Treasury Value</p>
          <p className="text-3xl font-bold text-cyan-400">$18.02M</p>
        </div>
      </Card>
    </div>
  );
}