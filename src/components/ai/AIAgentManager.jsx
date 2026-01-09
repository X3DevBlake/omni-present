import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Zap, Brain, Activity, Settings } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AIAgentManager() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    setIsLoading(true);
    try {
      const user = await base44.auth.me();
      const userAgents = await base44.entities.Agent.filter({ created_by: user.email });
      
      // Enrich agents with hub-specific data
      const enrichedAgents = userAgents.map(agent => ({
        ...agent,
        functions: getAgentFunctions(agent),
        status: agent.status || 'idle',
        lastAction: agent.last_location_update
      }));
      
      setAgents(enrichedAgents);
    } catch (error) {
      console.error('Error loading agents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAgentFunctions = (agent) => {
    const functions = {
      defi: ['trade_execution', 'risk_assessment', 'portfolio_optimization', 'arbitrage_detection'],
      labs: ['research', 'problem_solving', 'hypothesis_testing', 'knowledge_discovery'],
      simulation: ['environment_adaptation', 'adversarial_learning', 'behavior_emergence', 'coalition_formation'],
      devices: ['maintenance_prediction', 'resource_optimization', 'anomaly_detection', 'autonomous_operation']
    };
    
    // Assign functions based on agent skills
    if (agent.skills?.includes('trading')) return functions.defi;
    if (agent.skills?.includes('research')) return functions.labs;
    if (agent.skills?.includes('learning')) return functions.simulation;
    if (agent.skills?.includes('maintenance')) return functions.devices;
    return functions.defi; // default
  };

  const toggleAgentFunction = async (agentId, functionName, enabled) => {
    try {
      const agent = agents.find(a => a.id === agentId);
      const enabledFunctions = agent.enabledFunctions || [];
      
      const updated = enabled 
        ? [...enabledFunctions, functionName]
        : enabledFunctions.filter(f => f !== functionName);
      
      await base44.entities.Agent.update(agentId, {
        metadata: { enabledFunctions: updated }
      });
      
      await loadAgents();
    } catch (error) {
      console.error('Error updating agent:', error);
    }
  };

  const activateAgent = async (agentId) => {
    try {
      await base44.entities.Agent.update(agentId, { status: 'working' });
      await loadAgents();
    } catch (error) {
      console.error('Error activating agent:', error);
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bot className="w-6 h-6 text-cyan-400" />
          <div>
            <h3 className="text-white font-bold">AI Agent Management</h3>
            <p className="text-white/60 text-sm">Control autonomous agents across hubs</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded-full text-cyan-400 text-sm font-semibold">
          {agents.length} agents
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <AnimatePresence>
          {agents.map((agent, idx) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setSelectedAgent(selectedAgent?.id === agent.id ? null : agent)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedAgent?.id === agent.id
                  ? 'bg-cyan-500/20 border-cyan-500/50'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-white font-semibold">{agent.name}</h4>
                  <p className="text-white/60 text-xs">{agent.skills?.join(', ')}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  agent.status === 'working' ? 'bg-green-500/20 text-green-400' :
                  agent.status === 'learning' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {agent.status}
                </span>
              </div>

              {/* Status Bar */}
              <div className="mb-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-white/60">Budget</span>
                  <span className="text-white">${agent.omni_budget || 0}</span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                    style={{ width: `${Math.min((agent.omni_spent || 0) / (agent.omni_budget || 1) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  activateAgent(agent.id);
                }}
                className="w-full py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-cyan-400 text-xs font-semibold transition-colors"
              >
                {agent.status === 'idle' ? 'Activate' : 'Stop'} Agent
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Agent Details */}
      <AnimatePresence>
        {selectedAgent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-6 pt-6 border-t border-white/10"
          >
            <h4 className="text-white font-bold mb-4">{selectedAgent.name} - Available Functions</h4>
            <div className="grid grid-cols-2 gap-3">
              {selectedAgent.functions?.map((func) => (
                <label key={func} className="flex items-center gap-2 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    onChange={(e) => toggleAgentFunction(selectedAgent.id, func, e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-white text-sm font-semibold capitalize">
                    {func.replace(/_/g, ' ')}
                  </span>
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}