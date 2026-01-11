import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Activity, Zap, Brain, Heart } from 'lucide-react';

function Agent3DModel({ mood = 'analytical', energy = 75 }) {
  const groupRef = useRef();
  const moodColors = {
    analytical: '#3b82f6',
    confident: '#10b981',
    cautious: '#f59e0b',
    creative: '#a855f7',
    collaborative: '#ec4899',
    focused: '#00f5ff',
  };

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.003;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.3}>
      <group ref={groupRef}>
        {/* Core body */}
        <mesh position={[0, 0, 0]}>
          <octahedronGeometry args={[1.5, 3]} />
          <meshStandardMaterial
            color={moodColors[mood]}
            emissive={moodColors[mood]}
            emissiveIntensity={energy / 100}
            metalness={0.8}
            roughness={0.1}
          />
        </mesh>

        {/* Energy aura */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[2 + (energy / 100) * 0.5, 32, 32]} />
          <meshStandardMaterial
            color={moodColors[mood]}
            emissive={moodColors[mood]}
            emissiveIntensity={0.2 * (energy / 100)}
            transparent={true}
            opacity={0.15 * (energy / 100)}
          />
        </mesh>

        {/* Orbiting particles representing skills */}
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[Math.cos((i * Math.PI * 2) / 3) * 2.5, 0, Math.sin((i * Math.PI * 2) / 3) * 2.5]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial
              color={moodColors[mood]}
              emissive={moodColors[mood]}
              emissiveIntensity={0.8}
            />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

export default function HolographicAgentProfile({ agent }) {
  const [selectedMetric, setSelectedMetric] = useState('performance');

  if (!agent) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-white/50">No agent selected</p>
      </div>
    );
  }

  const metrics = {
    performance: { value: 87, icon: Activity, label: 'Performance' },
    energy: { value: agent.energy || 75, icon: Zap, label: 'Energy' },
    intelligence: { value: 92, icon: Brain, label: 'Intelligence' },
    collaboration: { value: 78, icon: Heart, label: 'Collaboration' },
  };

  return (
    <div className="w-full h-screen flex flex-col lg:flex-row gap-6 p-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* 3D Model */}
      <div className="flex-1 h-96 lg:h-full rounded-2xl overflow-hidden border border-cyan-500/20 bg-black/40">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <color attach="background" args={['#0a0a0f']} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={2} color="#00f5ff" />
          <pointLight position={[-10, -10, -10]} intensity={1} color={agent.mood ? '#a855f7' : '#3b82f6'} />
          
          <Agent3DModel mood={agent.mood || 'analytical'} energy={agent.energy || 75} />
          <OrbitControls enableZoom />
        </Canvas>
      </div>

      {/* Agent Info */}
      <div className="flex-1 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-2xl p-6"
        >
          <h2 className="text-3xl font-bold text-white mb-2">{agent.name || 'Unknown Agent'}</h2>
          <p className="text-white/60 mb-4">{agent.type || 'AI Agent'}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            {Object.entries(metrics).map(([key, data]) => {
              const Icon = data.icon;
              return (
                <motion.button
                  key={key}
                  onClick={() => setSelectedMetric(key)}
                  whileHover={{ scale: 1.05 }}
                  className={`p-4 rounded-lg border transition-all ${
                    selectedMetric === key
                      ? 'bg-cyan-500/20 border-cyan-500/50'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <Icon className="w-5 h-5 text-cyan-400 mb-2" />
                  <p className="text-xs text-white/60">{data.label}</p>
                  <p className="text-lg font-bold text-white">{data.value}%</p>
                </motion.button>
              );
            })}
          </div>

          {/* Detailed Metric */}
          <motion.div
            key={selectedMetric}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/5 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/70 text-sm">
                {metrics[selectedMetric].label}
              </span>
              <span className="text-cyan-400 font-bold">
                {metrics[selectedMetric].value}%
              </span>
            </div>
            <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metrics[selectedMetric].value}%` }}
                transition={{ duration: 1 }}
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Agent Status */}
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4">Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-sm">Current Task</span>
              <span className="text-cyan-400 text-sm font-semibold">Running Simulation</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-sm">Last Activity</span>
              <span className="text-white/50 text-sm">2 minutes ago</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-sm">Mood</span>
              <span className="px-2 py-1 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs rounded">
                {(agent.mood || 'analytical').charAt(0).toUpperCase() + (agent.mood || 'analytical').slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Control
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Analyze
          </motion.button>
        </div>
      </div>
    </div>
  );
}