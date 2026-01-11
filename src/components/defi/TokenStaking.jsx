import React from 'react';
import { motion } from 'framer-motion';
import { Coins, Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function TokenStaking({ userEmail }) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 border border-green-500/30 rounded-lg p-4"
        >
          <p className="text-green-400 text-sm font-semibold mb-1">Staked Balance</p>
          <p className="text-3xl font-bold text-white">250,000 OMNI</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4"
        >
          <p className="text-blue-400 text-sm font-semibold mb-1">Annual Reward</p>
          <p className="text-3xl font-bold text-white">45,000 OMNI</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4"
        >
          <p className="text-purple-400 text-sm font-semibold mb-1">APY</p>
          <p className="text-3xl font-bold text-white">18%</p>
        </motion.div>
      </div>

      <Card className="bg-black/40 border border-white/10 p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-indigo-400" />
          Staking Tiers
        </h3>
        <p className="text-white/60 text-center py-6">Staking tier details coming soon...</p>
      </Card>
    </div>
  );
}