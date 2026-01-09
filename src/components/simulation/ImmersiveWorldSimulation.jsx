import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment, Float } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Play, Pause, Zap, Eye } from 'lucide-react';

function SimulationEnvironment() {
  return (
    <group>
      {/* Terrain */}
      <mesh position={[0, -2, 0]}>
        <planeGeometry args={[30, 30, 50, 50]} />
        <meshStandardMaterial color="#1a3a3a" emissive="#00f5ff" emissiveIntensity={0.1} />
      </mesh>

      {/* Agent Nodes */}
      {Array.from({ length: 15 }).map((_, i) => {
        const angle = (i / 15) * Math.PI * 2;
        const radius = 8;
        const colors = ['#00f5ff', '#10b981', '#a855f7', '#ec4899'];
        const color = colors[i % colors.length];

        return (
          <Float key={i} speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
            <mesh position={[Math.cos(angle) * radius, Math.sin(i * 0.5), Math.sin(angle) * radius]}>
              <sphereGeometry args={[0.3, 32, 32]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} metalness={0.8} roughness={0.2} />
            </mesh>
          </Float>
        );
      })}

      {/* Connection Lines */}
      {Array.from({ length: 15 }).map((_, i) => {
        const nextI = (i + 1) % 15;
        const angle = (i / 15) * Math.PI * 2;
        const nextAngle = (nextI / 15) * Math.PI * 2;
        const radius = 8;

        return (
          <line key={`line-${i}`}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([
                  Math.cos(angle) * radius,
                  Math.sin(i * 0.5),
                  Math.sin(angle) * radius,
                  Math.cos(nextAngle) * radius,
                  Math.sin(nextI * 0.5),
                  Math.sin(nextAngle) * radius
                ])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#00f5ff" transparent opacity={0.3} linewidth={1} />
          </line>
        );
      })}

      {/* Central Hub */}
      <mesh position={[0, 0, 0]}>
        <octahedronGeometry args={[0.5, 1]} />
        <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={1} metalness={0.9} roughness={0.05} wireframe />
      </mesh>
    </group>
  );
}

export default function ImmersiveWorldSimulation() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simData, setSimData] = useState({
    activeAgents: 12,
    interactions: 348,
    resources: 94.2,
    efficiency: 87.5
  });

  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setSimData(prev => ({
        activeAgents: Math.min(prev.activeAgents + Math.random() * 2 - 0.5, 15),
        interactions: prev.interactions + Math.floor(Math.random() * 10),
        resources: Math.max(prev.resources - Math.random() * 2 + 0.5, 0),
        efficiency: Math.min(prev.efficiency + Math.random() * 1 - 0.3, 100)
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl overflow-hidden"
    >
      {/* Controls */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-b border-white/10 p-4 flex gap-3 items-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => setIsSimulating(!isSimulating)}
          className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
            isSimulating
              ? 'bg-red-500/20 border border-red-500/50 text-red-400'
              : 'bg-green-500/20 border border-green-500/50 text-green-400'
          }`}
        >
          {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isSimulating ? 'Pause' : 'Start'} Simulation
        </motion.button>
        <div className="flex-1" />
        <div className="flex gap-4 text-sm">
          <span className="text-white/70">Agents: <span className="text-cyan-400 font-bold">{Math.floor(simData.activeAgents)}</span></span>
          <span className="text-white/70">Interactions: <span className="text-green-400 font-bold">{simData.interactions}</span></span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 p-6">
        {/* 3D Simulation */}
        <div className="lg:col-span-2 h-[500px] bg-black/20 rounded-xl overflow-hidden">
          <Canvas camera={{ position: [0, 12, 15], fov: 60 }}>
            <color attach="background" args={['#000000']} />
            <fog attach="fog" args={['#000000', 5, 50]} />
            <ambientLight intensity={0.3} />
            <pointLight position={[20, 20, 20]} intensity={2} color="#00f5ff" />
            <pointLight position={[-20, -20, -20]} intensity={1} color="#a855f7" />
            <Stars radius={100} depth={50} count={2000} factor={4} fade />
            <SimulationEnvironment />
            <Environment preset="night" />
            <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.5} />
          </Canvas>
        </div>

        {/* Stats Panel */}
        <div className="space-y-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-white/70 text-xs mb-2">ACTIVE AGENTS</p>
            <div className="text-3xl font-bold text-cyan-400 mb-2">{Math.floor(simData.activeAgents)}</div>
            <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-cyan-500 to-purple-500 h-full"
                animate={{ width: `${(simData.activeAgents / 15) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-white/70 text-xs mb-2">RESOURCE USAGE</p>
            <div className="text-3xl font-bold text-green-400 mb-2">{simData.resources.toFixed(1)}%</div>
            <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-full"
                animate={{ width: `${simData.resources}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-white/70 text-xs mb-2">SYSTEM EFFICIENCY</p>
            <div className="text-3xl font-bold text-purple-400 mb-2">{simData.efficiency.toFixed(1)}%</div>
            <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full"
                animate={{ width: `${simData.efficiency}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Eye className="w-4 h-4" />
            View Details
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}