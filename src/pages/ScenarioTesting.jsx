import React from 'react';
import { motion } from 'framer-motion';
import { Play, CheckCircle, XCircle, Clock } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function ScenarioTesting() {
  const scenarios = [
    { id: 1, name: 'Urban Navigation Test', status: 'passed', duration: '12m 34s', passRate: 96 },
    { id: 2, name: 'Emergency Response', status: 'running', duration: '5m 12s', passRate: null },
    { id: 3, name: 'Resource Competition', status: 'failed', duration: '8m 45s', passRate: 42 }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Scenario Testing</h1>
          <p className="text-white/60">Validate agent behavior in controlled environments</p>
        </motion.div>

        <div className="space-y-4">
          {scenarios.map((scenario, i) => (
            <motion.div key={scenario.id} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    scenario.status === 'passed' ? 'bg-green-500/20' :
                    scenario.status === 'running' ? 'bg-blue-500/20 animate-pulse' :
                    'bg-red-500/20'
                  }`}>
                    {scenario.status === 'passed' ? <CheckCircle className="w-6 h-6 text-green-400" /> :
                     scenario.status === 'running' ? <Play className="w-6 h-6 text-blue-400" /> :
                     <XCircle className="w-6 h-6 text-red-400" />}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{scenario.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-white/60">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {scenario.duration}
                      </span>
                      {scenario.passRate !== null && (
                        <>
                          <span>•</span>
                          <span>Pass Rate: {scenario.passRate}%</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button className="px-4 py-2 bg-blue-500/20 border border-blue-500/40 text-blue-400 rounded-lg hover:bg-blue-500/30">
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}