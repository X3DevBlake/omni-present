import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Zap, GitMerge, Activity, AlertCircle, TrendingUp } from 'lucide-react';

export default function MultiAgentCollaborationDashboard() {
  const [selectedTeam, setSelectedTeam] = useState(0);

  const teams = [
    {
      id: 1,
      name: 'Market Analysis Team',
      agents: [
        { name: 'Market Sentinel', status: 'active', task: 'Price monitoring' },
        { name: 'Sentiment Bot', status: 'active', task: 'News analysis' },
        { name: 'Risk Guardian', status: 'active', task: 'Risk assessment' },
      ],
      progress: 78,
      health: 94,
      conflicts: 0,
      strategy: 'Real-time market consensus with sentiment weighting',
    },
    {
      id: 2,
      name: 'Portfolio Optimization',
      agents: [
        { name: 'Allocator Pro', status: 'active', task: 'Asset allocation' },
        { name: 'Tax Optimizer', status: 'active', task: 'Tax efficiency' },
        { name: 'Rebalancer', status: 'idle', task: 'Rebalancing' },
      ],
      progress: 45,
      health: 88,
      conflicts: 1,
      strategy: 'Multi-objective optimization with tax awareness',
    },
  ];

  const currentTeam = teams[selectedTeam];

  const communicationFlows = [
    { from: 'Market Sentinel', to: 'Sentiment Bot', type: 'Data sharing', latency: '150ms' },
    { from: 'Sentiment Bot', to: 'Risk Guardian', type: 'Alert relay', latency: '200ms' },
    { from: 'Risk Guardian', to: 'Market Sentinel', type: 'Feedback', latency: '100ms' },
  ];

  return (
    <div className="space-y-6">
      {/* Team Selector */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {teams.map((team, idx) => (
          <motion.button
            key={team.id}
            whileHover={{ scale: 1.05 }}
            onClick={() => setSelectedTeam(idx)}
            className={`px-4 py-2 rounded-lg border whitespace-nowrap flex-shrink-0 transition-all flex items-center gap-2 ${
              selectedTeam === idx
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-white/5 border-white/10 text-white/80 hover:border-white/30'
            }`}
          >
            <Users className="w-4 h-4" />
            {team.name}
          </motion.button>
        ))}
      </div>

      {/* Team Overview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Team Health', value: `${currentTeam.health}%`, icon: Activity, color: 'green' },
          { label: 'Task Progress', value: `${currentTeam.progress}%`, icon: TrendingUp, color: 'cyan' },
          { label: 'Active Agents', value: currentTeam.agents.filter(a => a.status === 'active').length, icon: Users, color: 'purple' },
          { label: 'Conflicts', value: currentTeam.conflicts, icon: AlertCircle, color: currentTeam.conflicts > 0 ? 'red' : 'green' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          const colorMap = { cyan: 'cyan-400', green: 'green-400', purple: 'purple-400', red: 'red-400' };
          return (
            <motion.div
              key={idx}
              whileHover={{ y: -2 }}
              className="bg-white/5 border border-white/10 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-white/60 text-sm">{stat.label}</p>
                <Icon className={`w-4 h-4 text-${colorMap[stat.color]}`} />
              </div>
              <p className={`text-2xl font-bold text-${colorMap[stat.color]} mt-2`}>{stat.value}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Active Agents */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 border border-white/10 rounded-lg p-6"
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" />
          Active Agents ({currentTeam.agents.filter(a => a.status === 'active').length}/{currentTeam.agents.length})
        </h3>
        <div className="space-y-2">
          {currentTeam.agents.map((agent, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
            >
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">{agent.name}</p>
                <p className="text-white/60 text-xs">{agent.task}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${agent.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}`} />
                <span className="text-white/60 text-xs capitalize">{agent.status}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Communication Flows */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 border border-white/10 rounded-lg p-6"
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <GitMerge className="w-5 h-5 text-purple-400" />
          Communication Flows
        </h3>
        <div className="space-y-2">
          {communicationFlows.map((flow, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
            >
              <div className="flex-1">
                <p className="text-white text-sm">
                  <span className="font-semibold">{flow.from}</span>
                  <span className="text-white/60 mx-2">→</span>
                  <span className="font-semibold">{flow.to}</span>
                </p>
                <p className="text-white/60 text-xs">{flow.type}</p>
              </div>
              <p className="text-cyan-400 text-xs font-semibold">{flow.latency}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Emergent Strategy */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/20 rounded-lg p-6"
      >
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Emergent Strategy
        </h3>
        <p className="text-white/80 text-sm mb-3">{currentTeam.strategy}</p>
        <div className="space-y-2">
          <p className="text-white/70 text-xs">
            <span className="font-semibold">Key Components:</span>
          </p>
          {[
            'Real-time data synthesis from 3 data sources',
            'Consensus-based decision making',
            'Continuous learning and adaptation',
          ].map((comp, idx) => (
            <div key={idx} className="text-white/60 text-xs pl-4">• {comp}</div>
          ))}
        </div>
      </motion.div>

      {/* Task Progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/5 border border-white/10 rounded-lg p-6"
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          Current Task Progress
        </h3>
        <div className="space-y-3">
          {[
            { task: 'Data aggregation', progress: 92, status: 'near-complete' },
            { task: 'Analysis synthesis', progress: 78, status: 'in-progress' },
            { task: 'Strategy generation', progress: 45, status: 'in-progress' },
          ].map((item, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-white/80 text-sm">{item.task}</p>
                <span className="text-cyan-400 font-bold text-sm">{item.progress}%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.progress}%` }}
                  transition={{ duration: 2 }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}