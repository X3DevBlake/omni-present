import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Zap, GitMerge, Target, AlertCircle } from 'lucide-react';

export default function MultiAgentTeamPanel() {
  const [selectedTeam, setSelectedTeam] = useState(1);

  const teams = [
    {
      id: 1,
      name: 'Market Analysis Team',
      agents: [
        { id: 'A1', name: 'Market Analyst', specialty: 'Price Analysis', status: 'active' },
        { id: 'A2', name: 'Sentiment Bot', specialty: 'News/Social', status: 'active' },
        { id: 'A3', name: 'Risk Analyzer', specialty: 'Risk Assessment', status: 'active' },
      ],
      task: 'Real-time market monitoring',
      collaboration: 'Data aggregation & consensus',
      efficiency: 94,
      conflicts: 0,
    },
    {
      id: 2,
      name: 'Data Processing Team',
      agents: [
        { id: 'B1', name: 'Query Optimizer', specialty: 'SQL', status: 'active' },
        { id: 'B2', name: 'Data Cleaner', specialty: 'Data Quality', status: 'active' },
        { id: 'B3', name: 'Aggregator', specialty: 'Synthesis', status: 'idle' },
      ],
      task: 'Distributed Snowflake analysis',
      collaboration: 'Parallel query execution',
      efficiency: 87,
      conflicts: 0,
    },
  ];

  const currentTeam = teams.find(t => t.id === selectedTeam);

  return (
    <div className="space-y-6">
      {/* Team Selector */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {teams.map((team) => (
          <motion.button
            key={team.id}
            whileHover={{ scale: 1.05 }}
            onClick={() => setSelectedTeam(team.id)}
            className={`px-4 py-2 rounded-lg border whitespace-nowrap transition-all flex-shrink-0 ${
              selectedTeam === team.id
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-white/5 border-white/10 text-white/80 hover:border-white/30'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            {team.name}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {currentTeam && (
          <motion.div
            key={currentTeam.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Team Overview */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">{currentTeam.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/60 text-sm mb-1">Task</p>
                  <p className="text-white font-semibold">{currentTeam.task}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/60 text-sm mb-1">Collaboration</p>
                  <p className="text-white font-semibold">{currentTeam.collaboration}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/60 text-sm mb-1">Efficiency</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: `${currentTeam.efficiency}%` }} />
                    </div>
                    <p className="text-green-400 font-bold text-sm">{currentTeam.efficiency}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Agent Members */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                Team Members ({currentTeam.agents.length})
              </h4>
              <div className="space-y-2">
                {currentTeam.agents.map((agent) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex-1">
                      <p className="text-white font-semibold">{agent.name}</p>
                      <p className="text-white/60 text-sm">{agent.specialty}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${agent.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}`} />
                      <span className="text-white/60 text-xs capitalize">{agent.status}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Collaboration Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div
                whileHover={{ y: -2 }}
                className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/20 rounded-lg p-4"
              >
                <p className="text-green-400 font-bold mb-2 flex items-center gap-2">
                  <GitMerge className="w-4 h-4" />
                  Consensus Building
                </p>
                <p className="text-white/80 text-sm">Multi-agent consensus protocol active - 3 agreement cycles</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -2 }}
                className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 rounded-lg p-4"
              >
                <p className="text-cyan-400 font-bold mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Task Delegation
                </p>
                <p className="text-white/80 text-sm">{currentTeam.agents.filter(a => a.status === 'active').length}/{currentTeam.agents.length} agents active</p>
              </motion.div>
            </div>

            {/* Emergent Strategy */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 border border-white/10 rounded-lg p-6"
            >
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                Emergent Strategy
              </h4>
              <p className="text-white/80 mb-3">
                Collective intelligence has identified synergistic approach combining real-time monitoring with predictive modeling.
              </p>
              <div className="bg-white/5 rounded-lg p-3 text-sm text-white/70">
                <p className="font-semibold text-white mb-2">Integrated Approach:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Parallel data aggregation (Query Bot + Cleaner)</li>
                  <li>Real-time consensus on market signals</li>
                  <li>Adaptive strategy based on emerging patterns</li>
                </ul>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}