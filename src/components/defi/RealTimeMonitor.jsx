import React from 'react';
import { motion } from 'framer-motion';
import { Radio, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function RealTimeMonitor({ userEmail }) {
  return (
    <Card className="bg-black/40 border border-white/10 p-6">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <Radio className="w-5 h-5 text-red-400" />
        Real-Time Market Monitor
      </h3>
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-black/40 border border-white/10 rounded-lg"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <p className="text-white font-semibold">Live Price Feed</p>
          </div>
          <p className="text-white/60 text-sm">BTC: $65,230 | ETH: $3,215 | OMNI: $2.42</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <p className="text-red-400 font-semibold">Volatility Alert</p>
          </div>
          <p className="text-white/60 text-sm">ETH volatility exceeded 4.2% in last hour</p>
        </motion.div>
      </div>
    </Card>
  );
}