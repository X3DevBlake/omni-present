import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Sphere, Text } from '@react-three/drei';
import { Play, Square, BarChart3, Download, Settings } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import BackButton from '../components/navigation/BackButton';
import DynamicEventControls from '../components/simulation/DynamicEventControls';
import ContextKnowledgeRetrieval from '../components/knowledge/ContextKnowledgeRetrieval';
import { createPageUrl } from '../utils';
import { Link } from 'react-router-dom';

function SimAgent({ position, agent, speed }) {
  const meshRef = React.useRef();
  const [offset] = React.useState(Math.random() * Math.PI * 2);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.x = position[0] + Math.cos(state.clock.elapsedTime * speed + offset) * 2;
      meshRef.current.position.z = position[2] + Math.sin(state.clock.elapsedTime * speed + offset) * 2;
    }
  });

  return (
    <group>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color={agent.color} emissive={agent.color} emissiveIntensity={0.6} />
      </mesh>
      <Text position={[position[0], position[1] - 0.8, position[2]]} fontSize={0.15} color="white">
        {agent.name}
      </Text>
    </group>
  );
}

function SimEnvironment({ config, agents, isRunning }) {
  return (
    <group>
      {/* Ground */}
      <Box args={[20, 0.2, 20]} position={[0, -0.1, 0]}>
        <meshStandardMaterial color="#1a202c" />
      </Box>

      {/* Environment Elements */}
      {config.physics && (
        <Box args={[2, 2, 2]} position={[5, 1, 5]}>
          <meshStandardMaterial color="#4a5568" />
        </Box>
      )}
      
      {config.social && (
        <Sphere args={[1, 16, 16]} position={[-5, 1, -5]}>
          <meshStandardMaterial color="#805ad5" />
        </Sphere>
      )}

      {/* Agents */}
      {isRunning && agents.map((agent, idx) => (
        <SimAgent
          key={agent.id}
          position={[
            (idx % 4 - 1.5) * 4,
            1,
            (Math.floor(idx / 4) - 1) * 4
          ]}
          agent={agent}
          speed={0.3 + agent.personality.energy * 0.5}
        />
      ))}
    </group>
  );
}

export default function SimulationHub() {
  const [simConfig, setSimConfig] = useState({
    physics: true,
    social: true,
    economic: false,
    gravity: 9.8,
    friction: 0.5
  });

  const [agents, setAgents] = useState([
    { id: 1, name: 'Explorer', personality: { curiosity: 85, energy: 0.7 }, mood: 80, stress: 20, color: '#00f5ff' },
    { id: 2, name: 'Analyst', personality: { curiosity: 60, energy: 0.4 }, mood: 70, stress: 30, color: '#a855f7' },
    { id: 3, name: 'Builder', personality: { curiosity: 50, energy: 0.8 }, mood: 90, stress: 10, color: '#10b981' },
    { id: 4, name: 'Mediator', personality: { curiosity: 70, energy: 0.5 }, mood: 75, stress: 25, color: '#f59e0b' }
  ]);
  
  const [savedStates, setSavedStates] = useState([]);

  const [isRunning, setIsRunning] = useState(false);
  const [simResults, setSimResults] = useState(null);

  const startSimulation = () => {
    setIsRunning(true);
    setSimResults(null);

    setTimeout(() => {
      setSimResults({
        duration: '5m 32s',
        interactions: 147,
        emergentBehaviors: [
          'Agents formed two collaborative clusters',
          'Explorer initiated 63% of new interactions',
          'Resource pooling behavior emerged at t=2:15'
        ],
        goalAchievement: 87,
        collaborationScore: 92
      });
    }, 10000);
  };

  const stopSimulation = () => {
    setIsRunning(false);
  };

  const saveSimulationState = () => {
    const state = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      config: simConfig,
      agents: agents,
      results: simResults
    };
    setSavedStates([...savedStates, state]);
    alert('Simulation state saved!');
  };

  const loadSimulationState = (state) => {
    setSimConfig(state.config);
    setAgents(state.agents);
    setSimResults(state.results);
    alert('Simulation state loaded!');
  };

  const handleEventTrigger = (event) => {
    setAgents(prev => prev.map(agent => ({
      ...agent,
      stress: Math.min(100, agent.stress + event.severity * 0.3),
      mood: Math.max(0, agent.mood - event.severity * 0.2)
    })));
  };

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <BackButton to={createPageUrl('AILab')} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            AI Agent <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Simulation Hub</span>
          </h1>
          <p className="text-white/60 text-lg">Configure, deploy, and analyze multi-agent simulations in real-time 3D</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-cyan-400" />
                Environment Config
              </h3>
              
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">Realistic Physics</span>
                  <input
                    type="checkbox"
                    checked={simConfig.physics}
                    onChange={(e) => setSimConfig({ ...simConfig, physics: e.target.checked })}
                    className="w-5 h-5"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">Social Interactions</span>
                  <input
                    type="checkbox"
                    checked={simConfig.social}
                    onChange={(e) => setSimConfig({ ...simConfig, social: e.target.checked })}
                    className="w-5 h-5"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">Economic Model</span>
                  <input
                    type="checkbox"
                    checked={simConfig.economic}
                    onChange={(e) => setSimConfig({ ...simConfig, economic: e.target.checked })}
                    className="w-5 h-5"
                  />
                </label>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-white/70 text-sm">Gravity</span>
                    <span className="text-cyan-400 text-sm">{simConfig.gravity}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="0.1"
                    value={simConfig.gravity}
                    onChange={(e) => setSimConfig({ ...simConfig, gravity: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-white/70 text-sm">Friction</span>
                    <span className="text-cyan-400 text-sm">{simConfig.friction}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={simConfig.friction}
                    onChange={(e) => setSimConfig({ ...simConfig, friction: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <h3 className="text-white font-bold mb-4">Deployed Agents</h3>
              <div className="space-y-2 mb-4">
                {agents.map(agent => (
                  <div key={agent.id} className="p-3 bg-white/5 border border-white/10 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: agent.color }} />
                      <span className="text-white font-semibold text-sm">{agent.name}</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-white/60">Mood</span>
                        <span className={agent.mood > 60 ? 'text-green-400' : 'text-yellow-400'}>{agent.mood}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Stress</span>
                        <span className={agent.stress > 60 ? 'text-red-400' : 'text-cyan-400'}>{agent.stress}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <DynamicEventControls onEventTrigger={handleEventTrigger} />
            </div>
            
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <h3 className="text-white font-bold mb-3 text-sm">Saved States</h3>
              {savedStates.length === 0 ? (
                <p className="text-white/60 text-xs">No saved states</p>
              ) : (
                <div className="space-y-2">
                  {savedStates.map(state => (
                    <div key={state.id} className="p-2 bg-white/5 border border-white/10 rounded flex items-center justify-between">
                      <span className="text-white text-xs">{new Date(state.timestamp).toLocaleString()}</span>
                      <button
                        onClick={() => loadSimulationState(state)}
                        className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs hover:bg-cyan-500/30"
                      >
                        Load
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <ContextKnowledgeRetrieval context="AI agent simulation with multi-agent interactions and emergent behaviors" />
          </div>

          {/* 3D Simulation View */}
          <div className="lg:col-span-2 space-y-4">
            <div className="h-96 bg-black/20 rounded-xl overflow-hidden border border-white/10">
              <Canvas camera={{ position: [15, 10, 15], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, 10, -10]} intensity={0.5} />
                <SimEnvironment config={simConfig} agents={agents} isRunning={isRunning} />
                <OrbitControls />
                <gridHelper args={[20, 20, '#ffffff20', '#ffffff10']} />
              </Canvas>
            </div>

            <div className="flex gap-3">
              {!isRunning ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={startSimulation}
                  className="px-6 py-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 font-bold flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Start Simulation
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={stopSimulation}
                  className="px-6 py-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 font-bold flex items-center gap-2"
                >
                  <Square className="w-5 h-5" />
                  Stop Simulation
                </motion.button>
              )}
              {simResults && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={saveSimulationState}
                  className="px-6 py-3 bg-purple-500/20 border border-purple-500/50 rounded-lg text-purple-400 font-bold flex items-center gap-2"
                >
                  Save State
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* Post-Simulation Analysis */}
        {simResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-green-400 font-bold text-xl flex items-center gap-2">
                <BarChart3 className="w-6 h-6" />
                Simulation Results
              </h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 font-semibold flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Report
              </motion.button>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="bg-black/20 rounded-lg p-4 text-center">
                <p className="text-white/60 text-sm mb-1">Duration</p>
                <p className="text-white font-bold text-xl">{simResults.duration}</p>
              </div>
              <div className="bg-black/20 rounded-lg p-4 text-center">
                <p className="text-white/60 text-sm mb-1">Interactions</p>
                <p className="text-cyan-400 font-bold text-xl">{simResults.interactions}</p>
              </div>
              <div className="bg-black/20 rounded-lg p-4 text-center">
                <p className="text-white/60 text-sm mb-1">Goal Achievement</p>
                <p className="text-green-400 font-bold text-xl">{simResults.goalAchievement}%</p>
              </div>
              <div className="bg-black/20 rounded-lg p-4 text-center">
                <p className="text-white/60 text-sm mb-1">Collaboration</p>
                <p className="text-purple-400 font-bold text-xl">{simResults.collaborationScore}%</p>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3">Emergent Behaviors</h4>
              {simResults.emergentBehaviors.map((behavior, idx) => (
                <p key={idx} className="text-white/80 text-sm mb-2">• {behavior}</p>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </AuroraBackground>
  );
}