import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

const CORRELATIONS = [
  {
    from: 'Simulations',
    to: 'Banking',
    type: 'Market anomaly affects strategy',
    strength: 0.94,
    direction: 'positive',
    impact: '+340 basis points',
  },
  {
    from: 'Devices',
    to: 'AI Labs',
    type: 'Device performance impacts training',
    strength: 0.87,
    direction: 'negative',
    impact: '-12% accuracy',
  },
  {
    from: 'Communications',
    to: 'Banking',
    type: 'Sentiment analysis informs decisions',
    strength: 0.82,
    direction: 'positive',
    impact: '+8% risk-adjusted returns',
  },
  {
    from: 'AI Labs',
    to: 'Simulations',
    type: 'Agent learning drives scenario outcomes',
    strength: 0.91,
    direction: 'positive',
    impact: '+15% model accuracy',
  },
];

export default function CrossHubCorrelationVisualizer() {
  return (
    <Card className="bg-black/40 border-white/10 p-6">
      <h3 className="text-white font-bold mb-4">Cross-Hub Correlations</h3>
      <div className="space-y-3">
        {CORRELATIONS.map((corr, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-4 bg-white/5 border border-white/10 rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold text-sm">{corr.from}</span>
                <TrendingUp className="w-4 h-4 text-white/40" />
                <span className="text-white font-semibold text-sm">{corr.to}</span>
              </div>
              <Badge className={corr.direction === 'positive' ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'}>
                {corr.impact}
              </Badge>
            </div>

            <p className="text-white/60 text-xs mb-3">{corr.type}</p>

            <div className="flex items-center gap-3">
              <div className="flex-1 bg-white/10 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${corr.strength * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full"
                />
              </div>
              <span className="text-white font-semibold text-sm">{(corr.strength * 100).toFixed(0)}%</span>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}