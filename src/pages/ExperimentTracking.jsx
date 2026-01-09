import React from 'react';
import { motion } from 'framer-motion';
import { Beaker, GitBranch, TrendingUp } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function ExperimentTracking() {
  const experiments = [
    { id: 1, name: 'Vision Model v3', status: 'running', accuracy: 94.2, runtime: '3h 24m' },
    { id: 2, name: 'Multi-Agent Coordination', status: 'completed', accuracy: 87.5, runtime: '6h 12m' },
    { id: 3, name: 'Behavior Pattern Recognition', status: 'failed', accuracy: 62.1, runtime: '1h 45m' }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Experiment Tracking</h1>
          <p className="text-white/60">Monitor AI experiments and model performance</p>
        </motion.div>

        <div className="space-y-4">
          {experiments.map((exp, i) => (
            <motion.div key={exp.id} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    exp.status === 'running' ? 'bg-blue-500/20 animate-pulse' :
                    exp.status === 'completed' ? 'bg-green-500/20' :
                    'bg-red-500/20'
                  }`}>
                    <Beaker className={`w-6 h-6 ${
                      exp.status === 'running' ? 'text-blue-400' :
                      exp.status === 'completed' ? 'text-green-400' :
                      'text-red-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{exp.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-white/60">
                      <span>Accuracy: {exp.accuracy}%</span>
                      <span>•</span>
                      <span>Runtime: {exp.runtime}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs ${
                  exp.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                  exp.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {exp.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}