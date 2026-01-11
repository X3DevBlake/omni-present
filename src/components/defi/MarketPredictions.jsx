import React from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function MarketPredictions({ userEmail }) {
  const predictions = [
    { asset: 'BTC', predicted: 68500, confidence: 87, timeframe: '7 days' },
    { asset: 'ETH', predicted: 3450, confidence: 82, timeframe: '7 days' },
    { asset: 'OMNI', predicted: 2.85, confidence: 76, timeframe: '7 days' },
  ];

  return (
    <Card className="bg-black/40 border border-white/10 p-6">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <Brain className="w-5 h-5 text-cyan-400" />
        AI Market Predictions
      </h3>
      <div className="space-y-4">
        {predictions.map((pred, idx) => (
          <motion.div
            key={pred.asset}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-4 bg-black/40 border border-white/10 rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-white font-semibold">{pred.asset}</p>
              <p className="text-purple-400 text-sm">{pred.timeframe}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-white/60 text-xs mb-1">Predicted Price</p>
                <p className="text-cyan-400 font-bold">${pred.predicted}</p>
              </div>
              <div>
                <p className="text-white/60 text-xs mb-1">Confidence</p>
                <p className="text-green-400 font-bold">{pred.confidence}%</p>
              </div>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pred.confidence}%` }}
                transition={{ delay: idx * 0.1 + 0.3, duration: 0.6 }}
                className="h-full bg-gradient-to-r from-green-500 to-cyan-500"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}