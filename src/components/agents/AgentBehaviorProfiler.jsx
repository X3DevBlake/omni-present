import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { User, TrendingUp, GitCompare } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AgentBehaviorProfiler() {
  const [agents] = useState([
    { id: 1, name: 'Alpha', type: 'analyst' },
    { id: 2, name: 'Beta', type: 'explorer' },
    { id: 3, name: 'Gamma', type: 'coordinator' },
    { id: 4, name: 'Delta', type: 'executor' }
  ]);

  const [selectedAgents, setSelectedAgents] = useState([1, 2]);
  const [profiles, setProfiles] = useState({});
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    selectedAgents.forEach(id => {
      if (!profiles[id]) {
        generateProfile(id);
      }
    });
  }, [selectedAgents]);

  const generateProfile = async (agentId) => {
    const agent = agents.find(a => a.id === agentId);
    
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a behavioral profile for AI agent "${agent.name}" (${agent.type}). Include personality metrics, decision patterns, collaboration style, and unique traits.`,
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          metrics: {
            type: 'object',
            properties: {
              decision_speed: { type: 'number' },
              risk_tolerance: { type: 'number' },
              collaboration: { type: 'number' },
              innovation: { type: 'number' },
              consistency: { type: 'number' }
            }
          },
          patterns: { type: 'array', items: { type: 'string' } },
          anomalies: { type: 'array', items: { type: 'string' } },
          strengths: { type: 'array', items: { type: 'string' } },
          weaknesses: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    setProfiles(prev => ({ ...prev, [agentId]: response }));
  };

  const toggleAgent = (agentId) => {
    if (selectedAgents.includes(agentId)) {
      if (selectedAgents.length > 1) {
        setSelectedAgents(selectedAgents.filter(id => id !== agentId));
      }
    } else {
      setSelectedAgents([...selectedAgents, agentId]);
    }
  };

  const getRadarData = (profile) => {
    if (!profile?.metrics) return [];
    return Object.entries(profile.metrics).map(([key, value]) => ({
      metric: key.replace(/_/g, ' '),
      value: value * 100
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <h3 className="text-white font-bold text-xl mb-4">Agent Behavior Profiler</h3>

        {/* Agent Selection */}
        <div className="mb-6">
          <p className="text-white/60 text-sm mb-3">Select Agents to Profile:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {agents.map(agent => (
              <motion.button
                key={agent.id}
                whileHover={{ scale: 1.05 }}
                onClick={() => toggleAgent(agent.id)}
                className={`p-3 rounded-lg border transition-all ${
                  selectedAgents.includes(agent.id)
                    ? 'bg-purple-500/20 border-purple-500/50'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <User className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                <p className="text-white font-semibold text-sm">{agent.name}</p>
                <p className="text-white/60 text-xs">{agent.type}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Comparison Toggle */}
        <div className="mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setComparing(!comparing)}
            className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 font-semibold flex items-center gap-2"
          >
            <GitCompare className="w-4 h-4" />
            {comparing ? 'Individual View' : 'Compare Side-by-Side'}
          </motion.button>
        </div>

        {/* Profiles Display */}
        {comparing ? (
          <div className={`grid ${selectedAgents.length > 1 ? 'md:grid-cols-2' : ''} gap-6`}>
            {selectedAgents.map(agentId => {
              const agent = agents.find(a => a.id === agentId);
              const profile = profiles[agentId];
              if (!profile) return <div key={agentId} className="text-white/60">Loading...</div>;

              return (
                <div key={agentId} className="bg-gradient-to-br from-purple-500/10 to-cyan-500/5 border border-purple-500/30 rounded-xl p-5">
                  <h4 className="text-white font-bold mb-3">{agent.name}</h4>
                  
                  <div className="h-48 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={getRadarData(profile)}>
                        <PolarGrid stroke="#ffffff20" />
                        <PolarAngleAxis dataKey="metric" tick={{ fill: '#ffffff80', fontSize: 10 }} />
                        <Radar dataKey="value" stroke="#a855f7" fill="#a855f7" fillOpacity={0.6} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-white/60 text-xs mb-1">Strengths:</p>
                      {profile.strengths.map((s, idx) => (
                        <p key={idx} className="text-green-400">✓ {s}</p>
                      ))}
                    </div>
                    {profile.anomalies.length > 0 && (
                      <div>
                        <p className="text-white/60 text-xs mb-1">Anomalies:</p>
                        {profile.anomalies.map((a, idx) => (
                          <p key={idx} className="text-yellow-400">⚠ {a}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          selectedAgents.map(agentId => {
            const agent = agents.find(a => a.id === agentId);
            const profile = profiles[agentId];
            if (!profile) return null;

            return (
              <motion.div
                key={agentId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-purple-500/10 to-cyan-500/5 border border-purple-500/30 rounded-xl p-6 mb-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-white font-bold text-lg">{agent.name}</h4>
                    <p className="text-purple-400 text-sm capitalize">{agent.type}</p>
                  </div>
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>

                <p className="text-white/80 text-sm mb-4">{profile.summary}</p>

                <div className="grid md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <p className="text-white/60 text-xs mb-3">Behavioral Metrics</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <RadarChart data={getRadarData(profile)}>
                        <PolarGrid stroke="#ffffff20" />
                        <PolarAngleAxis dataKey="metric" tick={{ fill: '#ffffff80', fontSize: 10 }} />
                        <Radar dataKey="value" stroke="#00f5ff" fill="#00f5ff" fillOpacity={0.6} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-white/60 text-xs mb-2">Decision Patterns:</p>
                      {profile.patterns.map((pattern, idx) => (
                        <p key={idx} className="text-white text-sm mb-1">• {pattern}</p>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-green-400 font-semibold text-xs mb-2">Strengths</p>
                    {profile.strengths.map((s, idx) => (
                      <p key={idx} className="text-white/80 text-xs mb-1">✓ {s}</p>
                    ))}
                  </div>
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 font-semibold text-xs mb-2">Areas for Growth</p>
                    {profile.weaknesses.map((w, idx) => (
                      <p key={idx} className="text-white/80 text-xs mb-1">→ {w}</p>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}