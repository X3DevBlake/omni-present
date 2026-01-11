import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, GitBranch, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function CollaborativeTaskFlowVisualizer() {
  const [selectedTask, setSelectedTask] = useState(null);

  const executionFlow = {
    goal: 'Build Comprehensive Portfolio Strategy',
    status: 'in_progress',
    phase: 'Phase 2: Analysis & Synthesis',
    completionPercent: 45,
    tasks: [
      {
        id: 'T1',
        name: 'Market Data Aggregation',
        agent: 'Market Sentinel',
        status: 'completed',
        progress: 100,
        duration: '2h 15m',
        outputs: ['historical_prices', 'volume_data', 'volatility_metrics'],
      },
      {
        id: 'T2',
        name: 'Sentiment Analysis',
        agent: 'Sentiment Bot',
        status: 'completed',
        progress: 100,
        duration: '1h 45m',
        outputs: ['sentiment_scores', 'trend_analysis'],
        dependsOn: ['T1'],
      },
      {
        id: 'T3',
        name: 'Risk Assessment',
        agent: 'Risk Guardian',
        status: 'in_progress',
        progress: 65,
        duration: 'Est. 1h 30m',
        outputs: ['risk_profile', 'correlation_matrix'],
        dependsOn: ['T1', 'T2'],
      },
      {
        id: 'T4',
        name: 'Strategy Synthesis',
        agent: 'Portfolio Manager',
        status: 'waiting',
        progress: 0,
        duration: 'Est. 2h',
        outputs: ['investment_strategy', 'recommendations'],
        dependsOn: ['T3'],
      },
      {
        id: 'T5',
        name: 'Validation & Backtesting',
        agent: 'Analyst Collective',
        status: 'waiting',
        progress: 0,
        duration: 'Est. 1h 30m',
        outputs: ['validation_report', 'performance_metrics'],
        dependsOn: ['T4'],
      },
    ],
    dataFlows: [
      { from: 'T1', to: 'T2', data: 'market_data' },
      { from: 'T1', to: 'T3', data: 'price_volatility' },
      { from: 'T2', to: 'T3', data: 'sentiment_indicators' },
      { from: 'T3', to: 'T4', data: 'risk_metrics' },
      { from: 'T4', to: 'T5', data: 'strategy_proposal' },
    ],
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'green';
      case 'in_progress': return 'cyan';
      case 'waiting': return 'gray';
      case 'failed': return 'red';
      default: return 'blue';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return CheckCircle2;
      case 'in_progress': return Clock;
      case 'waiting': return AlertCircle;
      default: return AlertCircle;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 border border-white/10 rounded-lg p-6"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">{executionFlow.goal}</h3>
            <p className="text-white/60 text-sm">{executionFlow.phase}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            executionFlow.status === 'in_progress' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-green-500/20 text-green-400'
          }`}>
            {executionFlow.status}
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-white/80 font-semibold">Overall Progress</p>
            <p className="text-cyan-400 font-bold">{executionFlow.completionPercent}%</p>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${executionFlow.completionPercent}%` }}
              transition={{ duration: 2 }}
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
            />
          </div>
        </div>
      </motion.div>

      {/* Task Flow Diagram */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 border border-white/10 rounded-lg p-6 overflow-x-auto"
      >
        <h4 className="text-white font-bold mb-6 flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-purple-400" />
          Task Execution Flow
        </h4>
        <div className="flex gap-4 min-w-max pb-4">
          {executionFlow.tasks.map((task, idx) => {
            const StatusIcon = getStatusIcon(task.status);
            const colorClass = getStatusColor(task.status);
            const colorMap = {
              green: 'green-400',
              cyan: 'cyan-400',
              gray: 'gray-400',
              red: 'red-400',
              blue: 'blue-400',
            };

            return (
              <motion.div
                key={task.id}
                whileHover={{ scale: 1.05, y: -5 }}
                onClick={() => setSelectedTask(task)}
                className={`flex-shrink-0 w-48 cursor-pointer transition-all ${
                  selectedTask?.id === task.id
                    ? `bg-${colorMap[colorClass]}/20 border border-${colorMap[colorClass]}`
                    : 'bg-white/5 border border-white/10'
                } rounded-lg p-4 hover:border-white/30`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-bold text-sm">{task.name}</p>
                  <StatusIcon className={`w-4 h-4 text-${colorMap[colorClass]}`} />
                </div>
                <p className="text-white/60 text-xs mb-2">{task.agent}</p>
                <div className="space-y-1 mb-3">
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${task.progress}%` }}
                      className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                    />
                  </div>
                  <p className="text-white/60 text-xs">{task.progress}%</p>
                </div>
                <p className="text-white/50 text-xs">{task.duration}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Data Flow Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 border border-white/10 rounded-lg p-6"
      >
        <h4 className="text-white font-bold mb-4">Data Flow Between Tasks</h4>
        <div className="space-y-2">
          {executionFlow.dataFlows.map((flow, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
            >
              <p className="text-white/80 text-sm font-mono flex-1">{flow.from}</p>
              <ArrowRight className="w-4 h-4 text-cyan-400" />
              <p className="text-white/80 text-sm font-mono flex-1">{flow.to}</p>
              <span className="px-2 py-1 bg-cyan-500/20 border border-cyan-400/30 rounded text-cyan-300 text-xs font-semibold">
                {flow.data}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Task Details */}
      {selectedTask && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/20 rounded-lg p-6"
        >
          <h4 className="text-white font-bold mb-4">{selectedTask.name} - Details</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-white/60 text-sm mb-1">Assigned Agent</p>
              <p className="text-white font-semibold">{selectedTask.agent}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm mb-1">Duration</p>
              <p className="text-white font-semibold">{selectedTask.duration}</p>
            </div>
            <div className="col-span-2">
              <p className="text-white/60 text-sm mb-2">Output Data</p>
              <div className="flex flex-wrap gap-2">
                {selectedTask.outputs.map((output, idx) => (
                  <span key={idx} className="px-2 py-1 bg-white/10 rounded text-white/80 text-xs">
                    {output}
                  </span>
                ))}
              </div>
            </div>
            {selectedTask.dependsOn.length > 0 && (
              <div className="col-span-2">
                <p className="text-white/60 text-sm mb-2">Depends On</p>
                <p className="text-white text-sm">{selectedTask.dependsOn.join(', ')}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Metrics Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-3"
      >
        {[
          { label: 'Completed', value: '2 tasks', color: 'green' },
          { label: 'In Progress', value: '1 task', color: 'cyan' },
          { label: 'Waiting', value: '2 tasks', color: 'gray' },
          { label: 'Est. Total Time', value: '8h 30m', color: 'blue' },
        ].map((metric, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -2 }}
            className="bg-white/5 border border-white/10 rounded-lg p-3 hover:border-white/30 transition-all"
          >
            <p className="text-white/60 text-xs mb-1">{metric.label}</p>
            <p className="text-white font-bold">{metric.value}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}