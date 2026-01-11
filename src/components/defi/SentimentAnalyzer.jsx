import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function SentimentAnalyzer({ userEmail }) {
  const sentiments = [
    { source: 'Twitter', sentiment: 'bullish', score: 72, volume: 15420 },
    { source: 'Reddit', sentiment: 'neutral', score: 58, volume: 8340 },
    { source: 'News', sentiment: 'bullish', score: 68, volume: 342 },
  ];

  return (
    <Card className="bg-black/40 border border-white/10 p-6">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-orange-400" />
        Social Sentiment Analysis
      </h3>
      <div className="space-y-4">
        {sentiments.map((item, idx) => (
          <motion.div
            key={item.source}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-4 bg-black/40 border border-white/10 rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-white font-semibold">{item.source}</p>
              <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${
                item.sentiment === 'bullish' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {item.sentiment}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mb-2">
              <p className="text-white/60">Sentiment Score: {item.score}%</p>
              <p className="text-white/60">Mentions: {item.volume}</p>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.score}%` }}
                transition={{ delay: idx * 0.1 + 0.2, duration: 0.6 }}
                className={`h-full ${item.sentiment === 'bullish' ? 'bg-green-500' : 'bg-yellow-500'}`}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}