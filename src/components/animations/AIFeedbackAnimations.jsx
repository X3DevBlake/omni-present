import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Lightbulb, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';

export const AISuggestionPopup = ({ suggestion, onDismiss }) => (
  <motion.div
    initial={{ x: 400, opacity: 0, scale: 0.8 }}
    animate={{ x: 0, opacity: 1, scale: 1 }}
    exit={{ x: 400, opacity: 0, scale: 0.8 }}
    className="fixed right-6 top-24 z-50 max-w-md"
  >
    <div className="bg-gradient-to-br from-purple-500/90 to-indigo-500/90 backdrop-blur-lg p-4 rounded-xl border border-white/30 shadow-2xl">
      <div className="flex items-start gap-3">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Brain className="w-6 h-6 text-yellow-300" />
        </motion.div>
        <div className="flex-1">
          <h3 className="text-white font-bold mb-1">AI Suggestion</h3>
          <p className="text-white/90 text-sm">{suggestion}</p>
        </div>
        <button onClick={onDismiss} className="text-white/60 hover:text-white">×</button>
      </div>
    </div>
  </motion.div>
);

export const ProactiveInsightCard = ({ insight, type = 'info' }) => {
  const icons = {
    info: Lightbulb,
    warning: AlertTriangle,
    success: CheckCircle,
    insight: Sparkles
  };
  
  const colors = {
    info: 'from-blue-500 to-cyan-500',
    warning: 'from-yellow-500 to-orange-500',
    success: 'from-green-500 to-emerald-500',
    insight: 'from-purple-500 to-pink-500'
  };

  const Icon = icons[type];

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-gradient-to-r ${colors[type]} p-4 rounded-lg shadow-xl cursor-pointer`}
    >
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>
        <div>
          <h4 className="text-white font-bold text-sm">Proactive Insight</h4>
          <p className="text-white/90 text-xs">{insight}</p>
        </div>
      </div>
    </motion.div>
  );
};

export const EthicalDilemmaIndicator = ({ severity }) => {
  const colors = {
    low: '#00ff88',
    medium: '#ffaa00',
    high: '#ff4444'
  };

  return (
    <motion.div
      animate={{
        boxShadow: [
          `0 0 20px ${colors[severity]}`,
          `0 0 40px ${colors[severity]}`,
          `0 0 20px ${colors[severity]}`
        ]
      }}
      transition={{ duration: 2, repeat: Infinity }}
      className="inline-block p-2 rounded-lg bg-black/60"
    >
      <AlertTriangle className="w-5 h-5" style={{ color: colors[severity] }} />
    </motion.div>
  );
};

export const AIThinkingAnimation = () => (
  <motion.div className="flex gap-2">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
        className="w-2 h-2 bg-purple-400 rounded-full"
      />
    ))}
  </motion.div>
);