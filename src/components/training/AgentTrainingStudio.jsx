import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, TrendingUp, Target, Zap } from 'lucide-react';

export default function AgentTrainingStudio() {
  const [selectedAgent, setSelectedAgent] = useState('agent_1');

  const agents = [
    { id: 'agent_1', name: 'Portfolio Manager', trainingProgress: 65, status: 'In Training' },
    { id: 'agent_2', name: 'Market Analyst', trainingProgress: 89, status: 'Near Complete' },
    { id: 'agent_3', name: 'Risk Guardian', trainingProgress: 42, status: 'Early Stage' },
  ];

  const currentAgent = agents.find(a => a.id === selectedAgent);

  const trainingMetrics = {
    accuracy: 0.87,
    speed: 0.92,
    completionRate: 0.78,
    consistencyScore: 0.85,
  };

  const learningCurve = [
    { epoch: 1, accuracy: 0.62, loss: 0.42 },
    { epoch: 2, accuracy: 0.68, loss: 0.38 },
    { epoch: 3, accuracy: 0.72, loss: 0.35 },
    { epoch: 4, accuracy: 0.78, loss: 0.28 },
    { epoch: 5, accuracy: 0.83, loss: 0.22 },
    { epoch: 6, accuracy: 0.87, loss: 0.18 },
  ];

  return (
    <div className="space-y-6">
      {/* Agent Selector */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {agents.map(agent => (
          <motion.button
            key={agent.id}
            whileHover={{ scale: 1.05 }}
            onClick={() => setSelectedAgent(agent.id)}
            className={`px-4 py-2 rounded-lg border whitespace-nowrap flex-shrink-0 transition-all ${
              selectedAgent === agent.id
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-white/5 border-white/10 text-white/80 hover:border-white/30'
            }`}
          >
            <BookOpen className="w-4 h-4 inline mr-2" />
            {agent.name}
          </motion.button>
        ))}
      </div>

      {currentAgent && (
        <div className="space-y-6">
          {/* Progress Overview */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">{currentAgent.name}</h3>
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">
                {currentAgent.status}
              </span>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/80 font-semibold">Overall Progress</p>
                  <p className="text-cyan-400 font-bold">{currentAgent.trainingProgress}%</p>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${currentAgent.trainingProgress}%` }}
                    transition={{ duration: 2 }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                  />
                </div>
              </div>
              <p className="text-white/60 text-sm">Estimated completion: {10 - Math.ceil(currentAgent.trainingProgress / 10)} days</p>
            </div>
          </motion.div>

          {/* Training Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3"
          >
            {[
              { label: 'Accuracy', value: (trainingMetrics.accuracy * 100).toFixed(1) + '%', icon: Target },
              { label: 'Speed', value: (trainingMetrics.speed * 100).toFixed(1) + '%', icon: Zap },
              { label: 'Task Completion', value: (trainingMetrics.completionRate * 100).toFixed(1) + '%', icon: TrendingUp },
              { label: 'Consistency', value: (trainingMetrics.consistencyScore * 100).toFixed(1) + '%', icon: BookOpen },
            ].map((metric, idx) => {
              const Icon = metric.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -2 }}
                  className="bg-white/5 border border-white/10 rounded-lg p-3 hover:border-white/20 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-xs">{metric.label}</p>
                      <p className="text-cyan-400 font-bold">{metric.value}</p>
                    </div>
                    <Icon className="w-4 h-4 text-cyan-400/40" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Learning Curve */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 border border-white/10 rounded-lg p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4">Learning Curve</h3>
            <div className="space-y-3">
              {learningCurve.map((point, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <p className="text-white/60 text-sm w-12">Epoch {point.epoch}</p>
                  <div className="flex-1">
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${point.accuracy * 100}%` }}
                        transition={{ delay: idx * 0.1 }}
                        className="h-full bg-green-500"
                      />
                    </div>
                  </div>
                  <p className="text-cyan-400 font-bold text-sm w-12">{(point.accuracy * 100).toFixed(0)}%</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Training Controls */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="flex-1 px-4 py-2 bg-cyan-500/20 border border-cyan-400 rounded-lg text-cyan-300 hover:bg-cyan-500/30 transition-all"
            >
              Continue Training
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white/80 hover:bg-white/20 transition-all"
            >
              View Feedback
            </motion.button>
          </motion.div>
        </div>
      )}
    </div>
  );
}