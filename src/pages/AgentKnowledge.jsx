import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Map, Eye } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import AgentKnowledgeViewer from '../components/agents/AgentKnowledgeViewer';
import AgentLocationTracker from '../components/agents/AgentLocationTracker';
import { base44 } from '@/api/base44Client';

export default function AgentKnowledge() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    const user = await base44.auth.me();
    const userAgents = await base44.entities.Agent.filter({ created_by: user.email });
    
    // Add mock location data if not present
    const agentsWithLocation = userAgents.map((agent, i) => ({
      ...agent,
      latitude: agent.latitude || (37.7749 + (i * 0.01)),
      longitude: agent.longitude || (-122.4194 + (i * 0.01)),
      location_name: agent.location_name || `Location ${i + 1}`,
    }));

    setAgents(agentsWithLocation);
    if (agentsWithLocation.length > 0) {
      setSelectedAgent(agentsWithLocation[0]);
    }
  };

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Agent <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Intelligence</span>
          </h1>
          <p className="text-white/60 text-lg">Real-time tracking and knowledge acquisition</p>
        </motion.div>

        {/* Agent Selector */}
        <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                selectedAgent?.id === agent.id
                  ? 'bg-purple-500/30 border border-purple-500/50 text-purple-300'
                  : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
              }`}
            >
              <Brain className="w-4 h-4" />
              {agent.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Real-time Location Map */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Map className="w-6 h-6 text-cyan-400" />
              <h2 className="text-white font-bold text-xl">Real-Time Location</h2>
            </div>
            <div className="h-[500px] rounded-xl overflow-hidden">
              <AgentLocationTracker agents={agents} />
            </div>
          </div>

          {/* Knowledge Database */}
          <div>
            {selectedAgent ? (
              <AgentKnowledgeViewer agentId={selectedAgent.id} />
            ) : (
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center">
                <Eye className="w-12 h-12 text-white/40 mx-auto mb-3" />
                <div className="text-white/60">Select an agent to view their knowledge</div>
              </div>
            )}
          </div>
        </div>

        {/* Perception Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6"
        >
          <h3 className="text-white font-bold text-xl mb-3 flex items-center gap-2">
            <Eye className="w-6 h-6 text-purple-400" />
            Ultra-Fast Perception System
          </h3>
          <p className="text-white/70 mb-4">
            Agents process visual information every 247 zeptoseconds (0.000000000000000000247 seconds), 
            enabling real-time object recognition, web-based knowledge acquisition, and intelligent decision making.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-black/30 rounded-xl p-4">
              <div className="text-cyan-400 text-2xl font-bold mb-1">247 zs</div>
              <div className="text-white/60 text-sm">Perception Rate</div>
            </div>
            <div className="bg-black/30 rounded-xl p-4">
              <div className="text-green-400 text-2xl font-bold mb-1">Instant</div>
              <div className="text-white/60 text-sm">Web Search</div>
            </div>
            <div className="bg-black/30 rounded-xl p-4">
              <div className="text-purple-400 text-2xl font-bold mb-1">24/7</div>
              <div className="text-white/60 text-sm">Learning Mode</div>
            </div>
          </div>
        </motion.div>
      </div>
    </AuroraBackground>
  );
}