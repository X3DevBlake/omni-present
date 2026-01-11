import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Brain, Target, Zap } from 'lucide-react';

export default function Phase8PredictiveIntelligence() {
  const features = [
    {
      title: 'Cross-Domain Analytics',
      desc: 'Analyze correlations across financial, agent, and system domains',
      icon: Brain,
      improvements: 10,
    },
    {
      title: 'Time-Series Forecasting',
      desc: 'Multivariate forecasting with confidence intervals',
      icon: TrendingUp,
      improvements: 10,
    },
    {
      title: 'Anomaly Detection',
      desc: 'Real-time detection of unusual patterns and behaviors',
      icon: Zap,
      improvements: 8,
    },
    {
      title: 'Prescriptive Planning',
      desc: 'Not just what will happen, but what should be done',
      icon: Target,
      improvements: 12,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Phase 8: Predictive Intelligence Engine
          </h1>
          <p className="text-white/60">Advanced forecasting and prescriptive recommendations (30 improvements)</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-lg p-6 hover:border-white/30 transition-all"
              >
                <Icon className="w-8 h-8 text-cyan-400 mb-3" />
                <h3 className="text-white font-bold mb-2">{feature.title}</h3>
                <p className="text-white/60 text-sm mb-4">{feature.desc}</p>
                <p className="text-cyan-400 font-semibold text-sm">{feature.improvements} Improvements</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/20 rounded-lg p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Key Capabilities</h2>
          <ul className="space-y-2 text-white/80">
            <li>✓ Multivariate time-series forecasting with Bayesian inference</li>
            <li>✓ Real-time anomaly detection across all metrics</li>
            <li>✓ Early warning systems for critical events</li>
            <li>✓ Causal relationship identification</li>
            <li>✓ Stress testing and scenario analysis</li>
            <li>✓ Prescriptive recommendations with execution capability</li>
            <li>✓ Goal decomposition and milestone planning</li>
            <li>✓ Cross-domain correlation analysis</li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
}