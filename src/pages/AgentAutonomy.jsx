import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Activity, Settings } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import Agent3DViewer from '../components/agents/Agent3DViewer';
import AgentWorldSimulation from '../components/agents/AgentWorldSimulation';
import AgentDecisionTree from '../components/agents/AgentDecisionTree';
import AgentPersonalityConfig from '../components/agents/AgentPersonalityConfig';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AgentAutonomy() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [recentDecisions, setRecentDecisions] = useState([]);
  const [showPersonalityConfig, setShowPersonalityConfig] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Mock agents with 3D world positions
      const mockAgents = [
        {
          id: '1',
          name: 'Shopping Assistant',
          avatar: '🛒',
          personality: { curiosity: 60, risk_aversion: 70, frugality: 80, ambition: 50, sociability: 40 },
          skills: ['negotiation', 'price_analysis', 'product_research'],
          omni_budget: 100,
          omni_spent: 35.5,
          status: 'shopping',
          position: [-2, 0, 0],
          color: '#10b981',
          autonomy_level: 'high'
        },
        {
          id: '2',
          name: 'Research Agent',
          avatar: '📚',
          personality: { curiosity: 90, risk_aversion: 30, frugality: 60, ambition: 80, sociability: 50 },
          skills: ['data_analysis', 'research', 'learning'],
          omni_budget: 150,
          omni_spent: 78.2,
          status: 'working',
          position: [3, 0, -2],
          color: '#00f5ff',
          autonomy_level: 'full'
        },
        {
          id: '3',
          name: 'Travel Planner',
          avatar: '✈️',
          personality: { curiosity: 85, risk_aversion: 40, frugality: 50, ambition: 70, sociability: 90 },
          skills: ['planning', 'booking', 'optimization'],
          omni_budget: 300,
          omni_spent: 156.8,
          status: 'idle',
          position: [0, 0, 3],
          color: '#a855f7',
          autonomy_level: 'medium'
        },
      ];
      setAgents(mockAgents);
      setSelectedAgent(mockAgents[0]);

      // Mock recent decisions
      const mockDecisions = [
        {
          id: '1',
          agent_id: '1',
          decision_type: 'purchase',
          reasoning: 'User frequently uses wireless peripherals, current mouse showing wear. Found competitive price with good reviews.',
          confidence_score: 87,
          factors_considered: [
            { name: 'Price competitiveness', weight: 0.3 },
            { name: 'Product reviews', weight: 0.25 },
            { name: 'User need', weight: 0.25 },
            { name: 'Budget availability', weight: 0.2 }
          ],
          omni_cost: 25.5,
          outcome: 'Purchase completed successfully',
          success: true
        }
      ];
      setRecentDecisions(mockDecisions);
    } catch (err) {
      toast.error('Failed to load agent data');
    }
  };

  const handleSavePersonality = async (personality) => {
    toast.success('Personality updated!');
    setShowPersonalityConfig(false);
    setSelectedAgent({ ...selectedAgent, personality });
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
            Agent <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Autonomy</span>
          </h1>
          <p className="text-white/60 text-lg">Monitor AI agents making autonomous decisions with Omni</p>
        </motion.div>

        {/* 3D World Simulation */}
        <div className="mb-8">
          <h2 className="text-white font-bold text-2xl mb-4">Live World Simulation</h2>
          <AgentWorldSimulation agents={agents} height="500px" />
        </div>

        {/* Agent Selection & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedAgent(agent)}
              className={`cursor-pointer bg-black/40 backdrop-blur-xl border rounded-2xl p-6 transition-all ${
                selectedAgent?.id === agent.id
                  ? 'border-cyan-500 ring-2 ring-cyan-500/50'
                  : 'border-white/10 hover:border-cyan-500/30'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl">{agent.avatar}</div>
                <div>
                  <h3 className="text-white font-bold">{agent.name}</h3>
                  <div className="text-white/60 text-sm capitalize">{agent.status}</div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Budget</span>
                  <span className="text-cyan-400 font-bold">{agent.omni_budget} OMNI</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Spent</span>
                  <span className="text-red-400 font-bold">{agent.omni_spent} OMNI</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Autonomy</span>
                  <span className="text-purple-400 font-bold capitalize">{agent.autonomy_level}</span>
                </div>
              </div>

              <div className="bg-black/40 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                  style={{ width: `${(agent.omni_spent / agent.omni_budget) * 100}%` }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Selected Agent Details */}
        {selectedAgent && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Agent3DViewer agent={selectedAgent} showBudget={true} />

              <div className="flex gap-4">
                <button
                  onClick={() => setShowPersonalityConfig(!showPersonalityConfig)}
                  className="flex-1 py-3 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-xl hover:bg-purple-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <Settings className="w-5 h-5" />
                  Configure Personality
                </button>
                <button className="flex-1 py-3 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-xl hover:bg-cyan-500/30 transition-all flex items-center justify-center gap-2">
                  <Activity className="w-5 h-5" />
                  View Activity
                </button>
              </div>

              {showPersonalityConfig && (
                <AgentPersonalityConfig
                  agent={selectedAgent}
                  onSave={handleSavePersonality}
                />
              )}
            </div>

            <div>
              <h3 className="text-white font-bold text-xl mb-4">Recent Decisions</h3>
              {recentDecisions
                .filter(d => d.agent_id === selectedAgent.id)
                .map(decision => (
                  <AgentDecisionTree key={decision.id} decision={decision} />
                ))}
            </div>
          </div>
        )}
      </div>
    </AuroraBackground>
  );
}