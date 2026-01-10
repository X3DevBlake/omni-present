import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function SentimentAnalysisVisualization({ assets = [] }) {
  // Generate mock sentiment data
  const sentimentData = [
    { time: '9:00 AM', sentiment: 65, confidence: 0.92 },
    { time: '10:30 AM', sentiment: 72, confidence: 0.88 },
    { time: '12:00 PM', sentiment: 58, confidence: 0.85 },
    { time: '2:00 PM', sentiment: 75, confidence: 0.90 },
    { time: '4:00 PM', sentiment: 68, confidence: 0.87 },
    { time: '6:00 PM', sentiment: 82, confidence: 0.93 }
  ];

  const assetSentiments = assets.slice(0, 5).map(asset => ({
    name: asset.symbol,
    sentiment: Math.floor(Math.random() * 100),
    change: Math.random() > 0.5 ? '+' : '-',
    color: Math.random() > 0.5 ? '#10b981' : '#ef4444'
  }));

  return (
    <div className="w-full space-y-8">
      {/* Overall Sentiment Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10"
      >
        <h3 className="text-white font-bold text-lg mb-4">Market Sentiment Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={sentimentData}>
            <defs>
              <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="time" stroke="#666" />
            <YAxis stroke="#666" domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '8px'
              }}
              labelStyle={{ color: '#fff' }}
            />
            <Area
              type="monotone"
              dataKey="sentiment"
              stroke="#06b6d4"
              fillOpacity={1}
              fill="url(#colorSentiment)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Asset Sentiment Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10"
      >
        <h3 className="text-white font-bold text-lg mb-6">Asset Sentiment Scores</h3>
        <div className="space-y-4">
          {assetSentiments.map((asset, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="p-4 rounded-lg bg-white/5 border border-white/10"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="text-white font-bold">{asset.name}</div>
                  <div className={`flex items-center gap-1 ${asset.color === '#10b981' ? 'text-green-400' : 'text-red-400'}`}>
                    {asset.color === '#10b981' ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span className="text-sm">{asset.change}{Math.abs(Math.floor(Math.random() * 10))}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">{asset.sentiment}</div>
                  <div className="text-white/60 text-xs">Sentiment Score</div>
                </div>
              </div>
              <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${asset.sentiment}%` }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  style={{ backgroundColor: asset.color }}
                  className="h-full rounded-full"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}