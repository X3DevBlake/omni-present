import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, Stars, Line } from '@react-three/drei';
import { Brain, Zap, Network, TrendingUp } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import BackButton from '../components/navigation/BackButton';
import { base44 } from '@/api/base44Client';

function BehaviorNode({ position, behavior, connections }) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <Float speed={2} floatIntensity={0.5}>
      <mesh 
        position={position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.3 : 1}
      >
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial 
          color={hovered ? '#00f5ff' : behavior.color}
          emissive={behavior.color}
          emissiveIntensity={hovered ? 1 : 0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      {connections.map((conn, i) => (
        <Line
          key={i}
          points={[position, conn]}
          color="#00f5ff"
          lineWidth={1}
          opacity={0.3}
        />
      ))}
    </Float>
  );
}

function BehaviorNetwork({ behaviors }) {
  return (
    <group>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      {behaviors.map((behavior, i) => {
        const angle = (i / behaviors.length) * Math.PI * 2;
        const radius = 5;
        const position = [
          Math.cos(angle) * radius,
          Math.sin(angle * 0.5) * 2,
          Math.sin(angle) * radius
        ];
        
        const connections = behaviors
          .filter((_, idx) => Math.abs(idx - i) <= 2 && idx !== i)
          .map((_, idx) => {
            const connAngle = ((i + idx) / behaviors.length) * Math.PI * 2;
            return [
              Math.cos(connAngle) * radius,
              Math.sin(connAngle * 0.5) * 2,
              Math.sin(connAngle) * radius
            ];
          });
        
        return (
          <BehaviorNode
            key={behavior.id}
            position={position}
            behavior={behavior}
            connections={connections}
          />
        );
      })}
    </group>
  );
}

export default function EmergentBehavior() {
  const [behaviors, setBehaviors] = useState([
    { id: 1, name: 'Collective Learning', type: 'emergent', color: '#00f5ff', strength: 87 },
    { id: 2, name: 'Resource Optimization', type: 'emergent', color: '#a855f7', strength: 92 },
    { id: 3, name: 'Social Clustering', type: 'emergent', color: '#ec4899', strength: 78 },
    { id: 4, name: 'Task Specialization', type: 'emergent', color: '#10b981', strength: 85 },
    { id: 5, name: 'Information Cascade', type: 'emergent', color: '#f59e0b', strength: 81 },
    { id: 6, name: 'Pattern Recognition', type: 'emergent', color: '#3b82f6', strength: 89 },
    { id: 7, name: 'Adaptive Cooperation', type: 'emergent', color: '#ef4444', strength: 76 },
    { id: 8, name: 'Swarm Intelligence', type: 'emergent', color: '#14b8a6', strength: 94 }
  ]);

  const [selectedBehavior, setSelectedBehavior] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [metrics, setMetrics] = useState({
    totalInteractions: 15847,
    emergenceScore: 87.3,
    complexityIndex: 92.1,
    adaptationRate: 78.5
  });

  useEffect(() => {
    if (simulating) {
      const interval = setInterval(() => {
        setMetrics(prev => ({
          totalInteractions: prev.totalInteractions + Math.floor(Math.random() * 50),
          emergenceScore: Math.min(100, prev.emergenceScore + (Math.random() - 0.5) * 2),
          complexityIndex: Math.min(100, prev.complexityIndex + (Math.random() - 0.5) * 3),
          adaptationRate: Math.min(100, prev.adaptationRate + (Math.random() - 0.5) * 2.5)
        }));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [simulating]);

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="mb-6">
          <BackButton />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Emergent <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Behavior</span> Analysis
          </h1>
          <p className="text-white/60 text-lg">Observe complex patterns emerging from simple agent interactions</p>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Interactions', value: metrics.totalInteractions.toLocaleString(), icon: Zap, color: '#00f5ff' },
            { label: 'Emergence Score', value: `${metrics.emergenceScore.toFixed(1)}%`, icon: Brain, color: '#a855f7' },
            { label: 'Complexity Index', value: `${metrics.complexityIndex.toFixed(1)}%`, icon: Network, color: '#ec4899' },
            { label: 'Adaptation Rate', value: `${metrics.adaptationRate.toFixed(1)}%`, icon: TrendingUp, color: '#10b981' }
          ].map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon size={24} style={{ color: metric.color }} />
                  <span className="text-2xl font-bold text-white">{metric.value}</span>
                </div>
                <p className="text-white/60 text-sm">{metric.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* 3D Behavior Network */}
        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-[600px]"
          >
            <h3 className="text-white font-bold text-lg mb-4">3D Behavior Network</h3>
            <div className="h-[520px] rounded-xl overflow-hidden bg-black/20">
              <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
                <ambientLight intensity={0.3} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00f5ff" />
                <BehaviorNetwork behaviors={behaviors} />
                <OrbitControls enableZoom autoRotate autoRotateSpeed={0.5} />
              </Canvas>
            </div>
          </motion.div>

          {/* Behavior List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg">Emergent Behaviors</h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSimulating(!simulating)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  simulating 
                    ? 'bg-red-500/20 border border-red-500/50 text-red-400'
                    : 'bg-green-500/20 border border-green-500/50 text-green-400'
                }`}
              >
                {simulating ? '⏸ Pause' : '▶ Simulate'}
              </motion.button>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {behaviors.map((behavior) => (
                <motion.div
                  key={behavior.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedBehavior(behavior)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedBehavior?.id === behavior.id
                      ? 'bg-white/10 border-white/30'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: behavior.color, boxShadow: `0 0 10px ${behavior.color}` }}
                      />
                      <p className="text-white font-semibold">{behavior.name}</p>
                    </div>
                    <span className="text-cyan-400 font-bold text-sm">{behavior.strength}%</span>
                  </div>
                  <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full"
                      style={{ backgroundColor: behavior.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${behavior.strength}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Selected Behavior Details */}
        {selectedBehavior && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-white font-bold text-lg mb-4">Behavior Analysis: {selectedBehavior.name}</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <p className="text-white/60 text-sm mb-2">Contributing Agents</p>
                <p className="text-white font-bold text-2xl">{Math.floor(Math.random() * 30 + 15)}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <p className="text-white/60 text-sm mb-2">Interaction Frequency</p>
                <p className="text-white font-bold text-2xl">{Math.floor(Math.random() * 500 + 200)}/min</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <p className="text-white/60 text-sm mb-2">Evolution Rate</p>
                <p className="text-white font-bold text-2xl">{(Math.random() * 5 + 2).toFixed(2)}x</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </AuroraBackground>
  );
}