import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, BookOpen, Database, TrendingUp, Brain } from 'lucide-react';

export default function AgentLearningManager() {
  const [trainingStatus, setTrainingStatus] = useState('idle');
  const [selectedSources, setSelectedSources] = useState(['market-data', 'user-behavior']);
  const [progress, setProgress] = useState(0);
  const [metrics, setMetrics] = useState({
    accuracy: 87.3,
    learningRate: 0.023,
    dataProcessed: 15400,
    modelsTraining: 3
  });

  const knowledgeSources = [
    { id: 'market-data', name: 'Market Analysis Data', size: '2.4 GB', type: 'structured' },
    { id: 'user-behavior', name: 'User Behavior Patterns', size: '1.8 GB', type: 'behavioral' },
    { id: 'trading-strategies', name: 'Trading Strategies', size: '890 MB', type: 'document' },
    { id: 'risk-models', name: 'Risk Assessment Models', size: '1.2 GB', type: 'structured' }
  ];

  const handleTraining = (action) => {
    if (action === 'start') {
      setTrainingStatus('training');
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTrainingStatus('complete');
            return 100;
          }
          return prev + Math.random() * 5;
        });
      }, 500);
    } else if (action === 'pause') {
      setTrainingStatus('paused');
    } else if (action === 'reset') {
      setTrainingStatus('idle');
      setProgress(0);
    }
  };

  const toggleSource = (id) => {
    setSelectedSources(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Training Controls */}
      <div className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="w-6 h-6 text-purple-400" />
          <h3 className="text-white font-bold text-lg">Agent Learning Manager</h3>
          <span className={`ml-auto px-3 py-1 rounded-lg text-xs font-bold ${
            trainingStatus === 'training' ? 'bg-green-500/20 text-green-400' :
            trainingStatus === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
            trainingStatus === 'complete' ? 'bg-blue-500/20 text-blue-400' :
            'bg-white/10 text-white/60'
          }`}>
            {trainingStatus.toUpperCase()}
          </span>
        </div>

        {/* Progress Bar */}
        {progress > 0 && (
          <div className="space-y-2 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/70">Training Progress</span>
              <span className="text-purple-400 font-bold">{Math.floor(progress)}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full"
                animate={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => handleTraining('start')}
            disabled={trainingStatus === 'training'}
            className="flex-1 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-lg text-green-400 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            Start Training
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => handleTraining('pause')}
            disabled={trainingStatus !== 'training'}
            className="flex-1 py-3 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 rounded-lg text-yellow-400 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Pause className="w-4 h-4" />
            Pause
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => handleTraining('reset')}
            className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-400 font-semibold flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </motion.button>
        </div>
      </div>

      {/* Knowledge Sources */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-6 h-6 text-cyan-400" />
          <h3 className="text-white font-bold text-lg">Knowledge Sources</h3>
          <span className="ml-auto text-cyan-400 text-sm">{selectedSources.length} selected</span>
        </div>

        <div className="space-y-3">
          {knowledgeSources.map((source) => (
            <motion.button
              key={source.id}
              onClick={() => toggleSource(source.id)}
              whileHover={{ scale: 1.02 }}
              className={`w-full p-4 rounded-lg border transition-all ${
                selectedSources.includes(source.id)
                  ? 'bg-cyan-500/20 border-cyan-500/50'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  selectedSources.includes(source.id) ? 'bg-cyan-500/30' : 'bg-white/10'
                }`}>
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white font-semibold text-sm">{source.name}</p>
                  <div className="flex gap-2 text-xs text-white/50 mt-1">
                    <span>{source.size}</span>
                    <span>•</span>
                    <span>{source.type}</span>
                  </div>
                </div>
                {selectedSources.includes(source.id) && (
                  <div className="w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center">
                    <span className="text-black text-xs">✓</span>
                  </div>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Accuracy', value: `${metrics.accuracy}%`, icon: TrendingUp, color: 'green' },
          { label: 'Learning Rate', value: metrics.learningRate, icon: Brain, color: 'purple' },
          { label: 'Data Processed', value: `${(metrics.dataProcessed / 1000).toFixed(1)}K`, icon: Database, color: 'cyan' },
          { label: 'Active Models', value: metrics.modelsTraining, icon: Brain, color: 'pink' }
        ].map((metric, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`bg-${metric.color}-500/10 border border-${metric.color}-500/30 rounded-xl p-4`}
          >
            <metric.icon className={`w-5 h-5 text-${metric.color}-400 mb-2`} />
            <p className="text-white/60 text-xs mb-1">{metric.label}</p>
            <p className="text-white font-bold text-xl">{metric.value}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}