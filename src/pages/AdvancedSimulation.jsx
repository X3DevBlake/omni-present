import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RefreshCw, Settings, Network, Cpu, Zap } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import AgentKnowledgeGraph from '../components/agents/AgentKnowledgeGraph';
import SimulationPhysicsEngine from '../components/simulation/SimulationPhysicsEngine';
import MultiAgentInteraction from '../components/simulation/MultiAgentInteraction';
import { base44 } from '@/api/base44Client';

export default function AdvancedSimulation() {
  const [isRunning, setIsRunning] = useState(false);
  const [agents, setAgents] = useState([]);
  const [knowledgeData, setKnowledgeData] = useState([]);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [selectedScenario, setSelectedScenario] = useState('open_world');

  useEffect(() => {
    loadSimulationData();
    const interval = setInterval(() => {
      if (isRunning) {
        updateSimulation();
      }
    }, 1000 / simulationSpeed);
    return () => clearInterval(interval);
  }, [isRunning, simulationSpeed]);

  const loadSimulationData = async () => {
    const user = await base44.auth.me();
    const userAgents = await base44.entities.Agent.filter({ created_by: user.email });
    setAgents(userAgents);
    
    if (userAgents.length > 0) {
      const allKnowledge = await base44.entities.AgentKnowledge.list();
      setKnowledgeData(allKnowledge);
    }
  };

  const updateSimulation = async () => {
    // Simulate agent learning and interactions
    for (const agent of agents) {
      // Random chance to learn something new
      if (Math.random() > 0.95) {
        const newKnowledge = {
          agent_id: agent.id,
          object_name: `Discovered Object ${Date.now()}`,
          description: `Agent learned through simulation at ${new Date().toISOString()}`,
          category: ['object', 'concept', 'skill'][Math.floor(Math.random() * 3)],
          confidence_score: Math.floor(Math.random() * 30) + 70,
          tags: ['simulation', 'automated', 'learning']
        };
        await base44.entities.AgentKnowledge.create(newKnowledge);
        
        // Update agent knowledge count
        await base44.entities.Agent.update(agent.id, {
          knowledge_count: (agent.knowledge_count || 0) + 1
        });
      }
    }
    await loadSimulationData();
  };

  const scenarios = [
    { id: 'open_world', name: 'Open World Exploration', description: 'Agents explore freely' },
    { id: 'resource_gathering', name: 'Resource Gathering', description: 'Competitive resource collection' },
    { id: 'collaborative', name: 'Collaborative Tasks', description: 'Agents work together' },
    { id: 'adversarial', name: 'Adversarial Training', description: 'Competitive agent training' }
  ];

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            Advanced <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Simulation</span>
          </h1>
          <p className="text-white/60 text-lg">Real-time multi-agent environment with adaptive learning</p>
        </motion.div>

        {/* Simulation Controls */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-3">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  isRunning 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {isRunning ? <><Pause className="w-5 h-5 inline mr-2" />Pause</> : <><Play className="w-5 h-5 inline mr-2" />Start</>}
              </button>
              <button
                onClick={loadSimulationData}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-semibold transition-all"
              >
                <RefreshCw className="w-5 h-5 inline mr-2" />
                Refresh
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-white/60 text-sm">Speed: {simulationSpeed}x</div>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.5"
                value={simulationSpeed}
                onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
                className="w-32"
              />
            </div>
          </div>

          {/* Scenario Selection */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {scenarios.map(scenario => (
              <button
                key={scenario.id}
                onClick={() => setSelectedScenario(scenario.id)}
                className={`p-3 rounded-xl transition-all ${
                  selectedScenario === scenario.id
                    ? 'bg-cyan-500/30 border border-cyan-500/50'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="text-white font-semibold text-sm">{scenario.name}</div>
                <div className="text-white/60 text-xs mt-1">{scenario.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <span className="text-white/60 text-sm">Active Agents</span>
            </div>
            <div className="text-3xl font-bold text-white">{agents.length}</div>
          </div>
          <div className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Network className="w-5 h-5 text-purple-400" />
              <span className="text-white/60 text-sm">Knowledge Items</span>
            </div>
            <div className="text-3xl font-bold text-white">{knowledgeData.length}</div>
          </div>
          <div className="bg-black/40 backdrop-blur-xl border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-green-400" />
              <span className="text-white/60 text-sm">Interactions</span>
            </div>
            <div className="text-3xl font-bold text-white">{isRunning ? Math.floor(Math.random() * 100) : 0}</div>
          </div>
          <div className="bg-black/40 backdrop-blur-xl border border-pink-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Settings className="w-5 h-5 text-pink-400" />
              <span className="text-white/60 text-sm">Simulation Time</span>
            </div>
            <div className="text-3xl font-bold text-white">{isRunning ? '∞' : '0'}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Physics Engine Visualization */}
          <SimulationPhysicsEngine 
            agents={agents} 
            isRunning={isRunning}
            scenario={selectedScenario}
          />

          {/* Knowledge Graph Integration */}
          <AgentKnowledgeGraph 
            knowledgeData={knowledgeData}
            agentName="Simulation Environment"
          />
        </div>

        {/* Multi-Agent Interactions */}
        <div className="mt-6">
          <MultiAgentInteraction 
            agents={agents}
            isRunning={isRunning}
          />
        </div>
      </div>
    </AuroraBackground>
  );
}