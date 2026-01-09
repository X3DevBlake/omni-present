import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Plus, Zap, Brain, Settings, Trash2, Play, Pause, Activity, TrendingUp } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import BackButton from '../components/navigation/BackButton';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';

function Agent3DIcon() {
  return (
    <Float speed={2} floatIntensity={0.5}>
      <mesh>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.5} />
      </mesh>
    </Float>
  );
}

export default function AgentManagement() {
  const [agents, setAgents] = useState([
    { id: 1, name: 'Explorer-Alpha', type: 'Scout', status: 'active', experience: 450, performance: 92 },
    { id: 2, name: 'Guardian-Beta', type: 'Defense', status: 'training', experience: 320, performance: 78 },
    { id: 3, name: 'Strategist-Gamma', type: 'Planning', status: 'active', experience: 580, performance: 95 },
    { id: 4, name: 'Innovator-Delta', type: 'Creative', status: 'idle', experience: 210, performance: 65 }
  ]);

  const [stats, setStats] = useState({
    totalAgents: 4,
    activeAgents: 2,
    avgPerformance: 82.5,
    totalTasks: 1247
  });

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-6">
          <BackButton />
        </div>
        <motion.div className="flex justify-between items-center mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Agent Management</h1>
            <p className="text-white/60">Create, train, and deploy your AI agent fleet</p>
          </div>
          <Link to={createPageUrl('AgentAudio')}>
            <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Agent
            </button>
          </Link>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Agents', value: stats.totalAgents, icon: Users, color: '#00f5ff' },
            { label: 'Active Now', value: stats.activeAgents, icon: Activity, color: '#10b981' },
            { label: 'Avg Performance', value: `${stats.avgPerformance}%`, icon: TrendingUp, color: '#a855f7' },
            { label: 'Total Tasks', value: stats.totalTasks, icon: Target, color: '#f59e0b' }
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon size={24} style={{ color: stat.color }} />
                </div>
                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-white/60 text-sm">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* 3D Agent Visualization */}
        <div className="mb-8 h-64 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
          <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[5, 5, 5]} intensity={1} />
            {agents.map((agent, idx) => {
              const angle = (idx / agents.length) * Math.PI * 2;
              return (
                <Float key={agent.id} speed={2 + idx * 0.5} floatIntensity={0.5}>
                  <mesh position={[Math.cos(angle) * 3, 0, Math.sin(angle) * 3]}>
                    <octahedronGeometry args={[0.5, 0]} />
                    <meshStandardMaterial 
                      color={agent.status === 'active' ? '#10b981' : agent.status === 'training' ? '#3b82f6' : '#6b7280'}
                      emissive={agent.status === 'active' ? '#10b981' : '#6b7280'}
                      emissiveIntensity={0.5}
                    />
                  </mesh>
                </Float>
              );
            })}
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
          </Canvas>
        </div>

        <div className="grid gap-4">
          {agents.map((agent, i) => (
            <motion.div
              key={agent.id}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-black/50 transition-all"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <Bot className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{agent.name}</h3>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-white/60">{agent.type}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        agent.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        agent.status === 'training' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {agent.status}
                      </span>
                      <span className="text-yellow-400">{agent.experience} XP</span>
                      <span className="text-cyan-400">{agent.performance}% Performance</span>
                    </div>
                    {/* Performance Bar */}
                    <div className="w-48 h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-400 to-purple-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${agent.performance}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 bg-blue-500/20 rounded-lg hover:bg-blue-500/30">
                    {agent.status === 'active' ? <Pause className="w-5 h-5 text-blue-400" /> : <Play className="w-5 h-5 text-blue-400" />}
                  </button>
                  <button className="p-2 bg-purple-500/20 rounded-lg hover:bg-purple-500/30">
                    <Brain className="w-5 h-5 text-purple-400" />
                  </button>
                  <button className="p-2 bg-gray-500/20 rounded-lg hover:bg-gray-500/30">
                    <Settings className="w-5 h-5 text-gray-400" />
                  </button>
                  <button className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30">
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}