import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import AgentWorldSimulation from '../components/omni/AgentWorldSimulation';
import AgentLocationTracker from '../components/agents/AgentLocationTracker';
import { base44 } from '@/api/base44Client';

export default function AgentSimulation3D() {
  const [agents, setAgents] = useState([]);
  const [isSimulating, setIsSimulating] = useState(true);
  const [viewMode, setViewMode] = useState('3d'); // '3d' or 'map'

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    const user = await base44.auth.me();
    const agentsData = await base44.entities.Agent.filter({ created_by: user.email });
    setAgents(agentsData);
  };

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Agent <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Simulation</span>
          </h1>
          <p className="text-white/60 text-lg">
            Immersive 3D world with real-time agent tracking and behavior
          </p>
        </motion.div>

        {/* Controls */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSimulating(!isSimulating)}
                className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-xl hover:bg-cyan-500/30 transition-all flex items-center gap-2"
              >
                {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isSimulating ? 'Pause' : 'Resume'}
              </button>
              <button
                onClick={loadAgents}
                className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode('3d')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  viewMode === '3d'
                    ? 'bg-purple-500/20 border border-purple-500/30 text-purple-400'
                    : 'bg-white/5 border border-white/10 text-white/60'
                }`}
              >
                3D World
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  viewMode === 'map'
                    ? 'bg-purple-500/20 border border-purple-500/30 text-purple-400'
                    : 'bg-white/5 border border-white/10 text-white/60'
                }`}
              >
                Map View
              </button>
            </div>
          </div>
        </div>

        {/* Simulation View */}
        {viewMode === '3d' ? (
          <AgentWorldSimulation agents={agents} isActive={isSimulating} />
        ) : (
          <AgentLocationTracker agents={agents} />
        )}

        {/* Agent Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="text-cyan-400 text-3xl font-bold mb-2">{agents.length}</div>
            <div className="text-white/60">Active Agents</div>
          </div>
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="text-green-400 text-3xl font-bold mb-2">
              {agents.filter(a => a.status === 'active').length}
            </div>
            <div className="text-white/60">Currently Active</div>
          </div>
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="text-purple-400 text-3xl font-bold mb-2">247 ZS</div>
            <div className="text-white/60">Processing Speed</div>
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}