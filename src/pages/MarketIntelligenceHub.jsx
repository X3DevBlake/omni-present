import React from 'react';
import { motion } from 'framer-motion';
import MarketAnalysisDashboard from '../components/analytics/MarketAnalysisDashboard';

export default function MarketIntelligenceHub() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-yellow-400 bg-clip-text text-transparent mb-2">
            Market Intelligence Hub
          </h1>
          <p className="text-white/60">
            AI-driven market analysis with real-time monitoring, sentiment analysis, trend detection, and predictive reports
          </p>
        </div>

        {/* Features Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { title: 'Market Monitoring', desc: 'Real-time price & volume tracking' },
            { title: 'Sentiment Analysis', desc: 'News & social sentiment scoring' },
            { title: 'Trend Detection', desc: 'Emerging opportunities identified' },
            { title: 'Predictive Reports', desc: 'AI-generated market forecasts' },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-white/30 transition-all"
            >
              <p className="text-white font-bold mb-1 text-sm">{feature.title}</p>
              <p className="text-white/60 text-xs">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <MarketAnalysisDashboard />
        </motion.div>
      </motion.div>
    </div>
  );
}