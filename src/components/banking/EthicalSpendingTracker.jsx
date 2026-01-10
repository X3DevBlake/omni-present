import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Heart, Users } from 'lucide-react';

export default function EthicalSpendingTracker() {
  const impacts = [
    { category: 'Environmental', icon: Leaf, score: 78, color: 'text-green-400', bg: 'from-green-500/10 to-emerald-500/10', border: 'border-green-500/30' },
    { category: 'Social', icon: Heart, score: 85, color: 'text-pink-400', bg: 'from-pink-500/10 to-rose-500/10', border: 'border-pink-500/30' },
    { category: 'Fair Trade', icon: Users, score: 92, color: 'text-blue-400', bg: 'from-blue-500/10 to-cyan-500/10', border: 'border-blue-500/30' }
  ];

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
      <h3 className="text-white font-bold text-xl mb-4">🌍 Ethical Spending Impact</h3>

      <div className="grid md:grid-cols-3 gap-4">
        {impacts.map((impact, i) => {
          const Icon = impact.icon;
          return (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className={`bg-gradient-to-br ${impact.bg} border ${impact.border} rounded-xl p-4 text-center`}
            >
              <Icon className={`w-8 h-8 ${impact.color} mx-auto mb-2`} />
              <div className="text-white font-bold mb-1">{impact.category}</div>
              <div className={`text-3xl font-bold ${impact.color}`}>{impact.score}</div>
              <div className="text-white/60 text-xs">Impact Score</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}