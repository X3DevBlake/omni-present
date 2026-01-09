import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Settings, Brain, Zap, Network } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import AgentSimulation3DScene from '../components/simulation/AgentSimulation3DScene';
import AgentKnowledgeGraph from '../components/agents/AgentKnowledgeGraph';
import SimulationControls from '../components/simulation/SimulationControls';
import MultiAgentInteractions from '../components/simulation/MultiAgentInteractions';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function SimulationEnvironment() {
  const [isRunning, setIsRunning] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [agents, setAgents] = useState([]);
  const [worldState, setWorldState] = useState(null);
  const [knowledgeData, setKnowledgeData] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [viewMode, setViewMode] = useState('3d'); // '3d', 'graph', 'interactions'

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
    try {
      const [agentsData, worldData, knowledgeData] = await Promise.all([
        base44.entities.Agent.list(),
        base44.entities.WorldState.list(),
        base44.entities.AgentKnowledge.list()
      ]);
      
      setAgents(agentsData);
      setWorldState(worldData[0] || {});
      setKnowledgeData(knowledgeData);
      
      if (agentsData.length > 0 && !selectedAgent) {
        setSelectedAgent(agentsData[0]);
      }
    } catch (error) {
      console.error('Error loading simulation data:', error);
      toast.error('Failed to load simulation data');
    }
  };

  const updateSimulation = async () => {
    // Update agent positions and states
    for (const agent of agents) {
      const newLat = agent.latitude + (Math.random() - 0.5) * 0.001;
      const newLng = agent.longitude + (Math.random() - 0.5) * 0.001;
      
      await base44.entities.Agent.update(agent.id, {
        latitude: newLat,
        longitude: newLng,
        last_location_update: new Date().toISOString(),
        status: ['idle', 'working', 'learning', 'shopping'][Math.floor(Math.random() * 4)]
      });

      // Randomly learn new knowledge
      if (Math.random() > 0.95) {
        await base44.entities.AgentKnowledge.create({
          agent_id: agent.id,
          object_name: `Object_${Date.now()}`,
          description: `Learned through simulation at ${new Date().toISOString()}`,
          category: ['object', 'concept', 'skill'][Math.floor(Math.random() * 3)],
          confidence_score: Math.floor(Math.random() * 30) + 70,
          tags: ['simulation', 'auto-learned']
        });
      }
    }

    await loadSimulationData();
  };

  const resetSimulation = async () => {
    setIsRunning(false);
    await loadSimulationData();
    toast.success('Simulation reset');
  };

  return (
    <AuroraBackground className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Advanced <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Simulation</span>
          </h1>
          <p className="text-white/60 text-lg">Multi-agent environment with real-time learning and knowledge graph integration</p>
        </motion.div>

        {/* Simulation Controls */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  isRunning
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5 inline mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 inline mr-2" />
                    Start
                  </>
                )}
              </button>

              <button
                onClick={resetSimulation}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all"
              >
                <RotateCcw className="w-5 h-5 inline mr-2" />
                Reset
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-white/60 text-sm">
                Speed: {simulationSpeed}x
              </div>
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.5"
                value={simulationSpeed}
                onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
                className="w-32"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('3d')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    viewMode === '3d' ? 'bg-cyan-500 text-white' : 'bg-white/5 text-white/60'
                  }`}
                >
                  <Zap className="w-4 h-4 inline mr-1" />
                  3D View
                </button>
                <button
                  onClick={() => setViewMode('graph')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    viewMode === 'graph' ? 'bg-purple-500 text-white' : 'bg-white/5 text-white/60'
                  }`}
                >
                  <Network className="w-4 h-4 inline mr-1" />
                  Knowledge
                </button>
                <button
                  onClick={() => setViewMode('interactions')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    viewMode === 'interactions' ? 'bg-pink-500 text-white' : 'bg-white/5 text-white/60'
                  }`}
                >
                  <Brain className="w-4 h-4 inline mr-1" />
                  Interactions
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-cyan-400 text-2xl font-bold">{agents.length}</div>
              <div className="text-white/60 text-sm">Active Agents</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-green-400 text-2xl font-bold">{knowledgeData.length}</div>
              <div className="text-white/60 text-sm">Knowledge Items</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-purple-400 text-2xl font-bold">{isRunning ? 'Running' : 'Paused'}</div>
              <div className="text-white/60 text-sm">Status</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-pink-400 text-2xl font-bold">{simulationSpeed}x</div>
              <div className="text-white/60 text-sm">Speed</div>
            </div>
          </div>
        </div>

        {/* Main View */}
        {viewMode === '3d' && (
          <AgentSimulation3DScene 
            agents={agents} 
            worldState={worldState}
            isRunning={isRunning}
          />
        )}

        {viewMode === 'graph' && selectedAgent && (
          <AgentKnowledgeGraph
            knowledgeData={knowledgeData.filter(k => k.agent_id === selectedAgent.id)}
            agentName={selectedAgent.name}
          />
        )}

        {viewMode === 'interactions' && (
          <MultiAgentInteractions agents={agents} knowledgeData={knowledgeData} />
        )}

        {/* Agent Selector */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                selectedAgent?.id === agent.id
                  ? 'bg-purple-500/30 border border-purple-500/50 text-purple-300'
                  : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
              }`}
            >
              {agent.name}
            </button>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}