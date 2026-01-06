import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Bot, Brain, TrendingUp, MapPin, Activity, Award, Users, Zap, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import AuroraBackground from '../components/omni/AuroraBackground';
import HolographicAIAgent from '../components/blueprint/HolographicAIAgent';
import Environment3DScene from '../components/blueprint/Environment3DScene';
import { TeamworkSkill } from '../components/blueprint/SkillSynergySystem';
import ReputationBadge from '../components/blueprint/ReputationBadge';

function AgentModel({ agent }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });

  return (
    <group ref={meshRef}>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.3, 2, 32]} />
        <meshStandardMaterial color={agent?.color || '#00f5ff'} emissive={agent?.color || '#00f5ff'} emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 1.3, 0]}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color={agent?.color || '#00f5ff'} emissive={agent?.color || '#00f5ff'} emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

export default function Agent() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [liveData, setLiveData] = useState({
    currentAction: 'Exploring',
    location: { x: 0, y: 0, z: 0 },
    energy: 85,
    mood: 'Curious',
    recentEvents: []
  });

  useEffect(() => {
    // Load agents from localStorage or create mock data
    const storedAgents = localStorage.getItem('holographicAgents');
    if (storedAgents) {
      const parsed = JSON.parse(storedAgents);
      setAgents(parsed);
      if (parsed.length > 0) {
        setSelectedAgent(parsed[0]);
      }
    } else {
      // Mock agent for demo
      const mockAgent = {
        id: 'demo_agent',
        name: 'Demo Agent',
        type: 'Explorer',
        color: '#00f5ff',
        skills: ['exploration', 'observation', 'gathering'],
        reputation: 75,
        experience: 450,
        skillPoints: 3,
        personality: ['curious', 'cautious'],
        behaviors: ['explore', 'gather'],
        hierarchyTier: 'beta',
        sentiment: { overall: 20 },
        teamworkLevel: 2
      };
      setAgents([mockAgent]);
      setSelectedAgent(mockAgent);
    }

    // Simulate live updates
    const interval = setInterval(() => {
      const actions = ['Exploring', 'Gathering Resources', 'Resting', 'Interacting', 'Learning', 'Observing'];
      const moods = ['Happy', 'Curious', 'Focused', 'Cautious', 'Excited'];
      
      setLiveData(prev => ({
        ...prev,
        currentAction: actions[Math.floor(Math.random() * actions.length)],
        location: {
          x: Math.random() * 20 - 10,
          y: 0,
          z: Math.random() * 20 - 10
        },
        energy: Math.max(20, Math.min(100, prev.energy + (Math.random() * 10 - 5))),
        mood: moods[Math.floor(Math.random() * moods.length)],
        recentEvents: [
          { time: Date.now(), event: prev.currentAction },
          ...prev.recentEvents.slice(0, 4)
        ]
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (!selectedAgent) {
    return (
      <AuroraBackground className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No Agents Found</h2>
          <p className="text-white/60 mb-6">Create an agent in the Blueprint page first</p>
          <Link to={createPageUrl('Blueprint')} className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:opacity-90">
            Go to Blueprint
          </Link>
        </div>
      </AuroraBackground>
    );
  }

  return (
    <AuroraBackground className="min-h-screen">
      <div className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          
          <Link to={createPageUrl('Blueprint')} className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Blueprint
          </Link>

          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Agent 3D View */}
            <div className="lg:col-span-1">
              <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-6 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{selectedAgent.name}</h3>
                  <ReputationBadge reputation={selectedAgent.reputation || 50} />
                </div>

                <div className="aspect-square bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl mb-4 overflow-hidden">
                  <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    <AgentModel agent={selectedAgent} />
                    <OrbitControls enableZoom={true} />
                  </Canvas>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Type</span>
                    <span className="text-white font-medium">{selectedAgent.type}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Hierarchy</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      selectedAgent.hierarchyTier === 'alpha' ? 'bg-yellow-500/20 text-yellow-300' :
                      selectedAgent.hierarchyTier === 'beta' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-gray-500/20 text-gray-300'
                    }`}>
                      {selectedAgent.hierarchyTier || 'omega'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Experience</span>
                    <span className="text-cyan-400 font-medium">{selectedAgent.experience || 0} XP</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Skill Points</span>
                    <span className="text-yellow-400 font-medium">{selectedAgent.skillPoints || 0}</span>
                  </div>
                </div>

                {selectedAgent.teamworkLevel && (
                  <div className="mt-4">
                    <TeamworkSkill agent={selectedAgent} level={selectedAgent.teamworkLevel} />
                  </div>
                )}
              </div>
            </div>

            {/* Live Status & Metrics */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Live Activity */}
              <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="w-6 h-6 text-green-400" />
                  <h3 className="text-xl font-bold text-white">Live Activity</h3>
                  <div className="ml-auto w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-4">
                    <div className="text-cyan-400 text-xs mb-1">Current Action</div>
                    <div className="text-white font-semibold">{liveData.currentAction}</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
                    <div className="text-purple-400 text-xs mb-1">Mood</div>
                    <div className="text-white font-semibold">{liveData.mood}</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4">
                    <div className="text-green-400 text-xs mb-1">Energy</div>
                    <div className="text-white font-semibold">{liveData.energy.toFixed(0)}%</div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-4">
                    <div className="text-orange-400 text-xs mb-1">Location</div>
                    <div className="text-white font-semibold text-xs">
                      ({liveData.location.x.toFixed(1)}, {liveData.location.z.toFixed(1)})
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="text-white font-semibold mb-3 text-sm">Recent Events</h4>
                  <div className="space-y-2">
                    {liveData.recentEvents.map((event, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-cyan-400" />
                        <span className="text-white/80">{event.event}</span>
                        <span className="text-white/40 text-xs ml-auto">
                          {Math.floor((Date.now() - event.time) / 1000)}s ago
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Skills & Traits */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Award className="w-6 h-6 text-purple-400" />
                    <h3 className="text-lg font-bold text-white">Skills</h3>
                  </div>
                  <div className="space-y-2">
                    {(selectedAgent.skills || []).map(skill => (
                      <div key={skill} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                        <span className="text-white capitalize">{skill.replace('_', ' ')}</span>
                        <Zap className="w-4 h-4 text-yellow-400" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Brain className="w-6 h-6 text-pink-400" />
                    <h3 className="text-lg font-bold text-white">Personality</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(selectedAgent.personality || []).map(trait => (
                      <div key={trait} className="px-3 py-1 bg-pink-500/20 border border-pink-500/40 text-pink-300 rounded-full text-sm capitalize">
                        {trait}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <div className="text-white/60 text-xs mb-2">Sentiment</div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${selectedAgent.sentiment?.overall > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.abs(selectedAgent.sentiment?.overall || 0)}%` }}
                        />
                      </div>
                      <span className={`text-sm font-medium ${selectedAgent.sentiment?.overall > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {selectedAgent.sentiment?.overall || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Behaviors */}
              <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                  <h3 className="text-lg font-bold text-white">Active Behaviors</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(selectedAgent.behaviors || []).map(behavior => (
                    <div key={behavior} className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-3 text-center">
                      <div className="text-white capitalize text-sm">{behavior.replace('_', ' ')}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Bars */}
              <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/70">Learning Progress</span>
                      <span className="text-cyan-400">{((selectedAgent.experience || 0) % 100)}%</span>
                    </div>
                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${(selectedAgent.experience || 0) % 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/70">Reputation</span>
                      <span className="text-yellow-400">{selectedAgent.reputation || 50}/100</span>
                    </div>
                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500" style={{ width: `${selectedAgent.reputation || 50}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/70">Energy Level</span>
                      <span className="text-green-400">{liveData.energy.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: `${liveData.energy}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}