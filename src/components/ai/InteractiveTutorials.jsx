import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CheckCircle, ChevronRight, Zap } from 'lucide-react';

export default function InteractiveTutorials() {
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);

  const tutorials = [
    {
      id: 'trading_basics',
      title: 'Advanced Trading Techniques',
      hub: 'Omni Hub',
      level: 'advanced',
      duration: '15 min',
      steps: [
        { title: 'Understanding Market Volatility', content: 'Learn how volatility affects your trading decisions' },
        { title: 'Risk/Reward Ratios', content: 'Master the art of calculating optimal entry and exit points' },
        { title: 'Position Sizing', content: 'Manage your exposure with proper position sizing strategies' }
      ]
    },
    {
      id: 'simulation_optimization',
      title: 'Simulation Optimization Guide',
      hub: 'Labs',
      level: 'advanced',
      duration: '20 min',
      steps: [
        { title: 'Setting Up Agents', content: 'Configure agents with appropriate parameters' },
        { title: 'Environmental Control', content: 'Adjust simulation complexity and scenarios' },
        { title: 'Performance Analysis', content: 'Analyze and interpret simulation results' }
      ]
    },
    {
      id: 'agent_collaboration',
      title: 'Inter-Agent Collaboration',
      hub: 'Analytics',
      level: 'expert',
      duration: '25 min',
      steps: [
        { title: 'Workflow Design', content: 'Design efficient multi-agent workflows' },
        { title: 'Communication Protocols', content: 'Establish secure agent communication' },
        { title: 'Performance Monitoring', content: 'Monitor agent collaboration metrics' }
      ]
    },
    {
      id: 'analytics_dashboard',
      title: 'Unified Analytics Dashboard',
      hub: 'Analytics',
      level: 'intermediate',
      duration: '12 min',
      steps: [
        { title: 'Dashboard Customization', content: 'Customize your analytics dashboard' },
        { title: 'Real-Time Monitoring', content: 'Monitor live market and performance data' },
        { title: 'Report Generation', content: 'Create automated reports' }
      ]
    }
  ];

  const toggleStep = (stepIdx) => {
    const key = `${selectedTutorial.id}-${stepIdx}`;
    if (completedSteps.includes(key)) {
      setCompletedSteps(completedSteps.filter(s => s !== key));
    } else {
      setCompletedSteps([...completedSteps, key]);
    }
  };

  const getProgressPercent = () => {
    if (!selectedTutorial) return 0;
    const completed = selectedTutorial.steps.filter((_, i) =>
      completedSteps.includes(`${selectedTutorial.id}-${i}`)
    ).length;
    return Math.round((completed / selectedTutorial.steps.length) * 100);
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'intermediate': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'advanced': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'expert': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Tutorial List */}
      <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 h-fit">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <h3 className="text-white font-bold">Tutorials</h3>
        </div>
        <div className="space-y-2">
          {tutorials.map(tutorial => (
            <button
              key={tutorial.id}
              onClick={() => setSelectedTutorial(tutorial)}
              className={`w-full text-left p-3 rounded-lg transition-all ${
                selectedTutorial?.id === tutorial.id
                  ? 'bg-cyan-500/30 border border-cyan-500/50'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="text-white font-semibold text-sm mb-1">{tutorial.title}</div>
              <div className="text-white/60 text-xs">{tutorial.duration}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Tutorial Content */}
      <div className="lg:col-span-2">
        {selectedTutorial ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedTutorial.title}</h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-3 py-1 bg-white/10 text-white/70 rounded-full">
                      {selectedTutorial.hub}
                    </span>
                    <span className={`text-xs px-3 py-1 rounded-full border ${getLevelColor(selectedTutorial.level)}`}>
                      {selectedTutorial.level}
                    </span>
                    <span className="text-xs text-white/60">{selectedTutorial.duration}</span>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/70 text-sm">Progress</span>
                  <span className="text-white font-bold">{getProgressPercent()}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: `${getProgressPercent()}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-3">
              {selectedTutorial.steps.map((step, idx) => {
                const isCompleted = completedSteps.includes(`${selectedTutorial.id}-${idx}`);
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => toggleStep(idx)}
                    className={`bg-gradient-to-r ${
                      isCompleted
                        ? 'from-green-500/10 to-emerald-500/10 border-green-500/30'
                        : 'from-purple-500/10 to-pink-500/10 border-purple-500/20'
                    } border rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-white/40 rounded-full" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold text-sm mb-1 ${
                          isCompleted ? 'text-green-400 line-through' : 'text-white'
                        }`}>
                          Step {idx + 1}: {step.title}
                        </h4>
                        <p className="text-white/70 text-sm">{step.content}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/40 flex-shrink-0" />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Completion Message */}
            {getProgressPercent() === 100 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-4 text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-bold">Tutorial Completed!</span>
                </div>
                <p className="text-white/70 text-sm">Great job! You've mastered this topic.</p>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
            <Zap className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/60">Select a tutorial to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}