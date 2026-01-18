import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, Points, PointMaterial } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import * as THREE from 'three';

function GlobePoints({ agents, interactions }) {
  const points = useRef();
  const [positions, setPositions] = useState(new Float32Array());
  const [colors, setColors] = useState(new Float32Array());

  useEffect(() => {
    if (!agents?.length) return;

    const pos = new Float32Array(agents.length * 3);
    const cols = new Float32Array(agents.length * 3);

    agents.forEach((agent, i) => {
      const lat = (Math.random() - 0.5) * Math.PI;
      const lng = Math.random() * Math.PI * 2;
      const radius = 2;

      pos[i * 3] = Math.cos(lat) * Math.cos(lng) * radius;
      pos[i * 3 + 1] = Math.sin(lat) * radius;
      pos[i * 3 + 2] = Math.cos(lat) * Math.sin(lng) * radius;

      const hue = (agent.hub?.charCodeAt(0) || 0) / 255;
      const color = new THREE.Color().setHSL(hue, 0.8, 0.6);
      cols[i * 3] = color.r;
      cols[i * 3 + 1] = color.g;
      cols[i * 3 + 2] = color.b;
    });

    setPositions(pos);
    setColors(cols);
  }, [agents]);

  return (
    <Points ref={points} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial sizeAttenuation size={0.15} color={0xffffff} />
    </Points>
  );
}

function GlobeScene({ agents, interactions, selectedAgent, onSelectAgent }) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <Sphere args={[2, 64, 64]} scale={1.002}>
        <meshPhongMaterial color="#1a1a2e" emissive="#0f3460" emissiveIntensity={0.3} />
      </Sphere>
      <GlobePoints agents={agents} interactions={interactions} />
      <OrbitControls autoRotate autoRotateSpeed={2} enableZoom enablePan />
    </Canvas>
  );
}

export default function RealtimeAgentActivityGlobe3D() {
  const [selectedAgent, setSelectedAgent] = useState(null);

  const { data: agents = [] } = useQuery({
    queryKey: ['homeGlobeAgents'],
    queryFn: () => base44.entities.Agent.filter({}).limit(100),
    refetchInterval: 5000
  });

  const { data: interactions = [] } = useQuery({
    queryKey: ['homeGlobeInteractions'],
    queryFn: () => base44.entities.AgentInteraction.filter({}).limit(50),
    refetchInterval: 3000
  });

  const activeAgents = agents.filter(a => a.is_active);
  const recentInteractions = interactions.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative w-full h-full rounded-xl overflow-hidden"
    >
      <GlobeScene
        agents={activeAgents}
        interactions={recentInteractions}
        selectedAgent={selectedAgent}
        onSelectAgent={setSelectedAgent}
      />

      {/* Live Metrics Overlay */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-6 left-6 bg-slate-900/80 backdrop-blur-lg p-4 rounded-lg border border-slate-700 max-w-xs"
      >
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Active Agents</span>
            <span className="text-lg font-bold text-blue-400">{activeAgents.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Live Interactions</span>
            <span className="text-lg font-bold text-green-400">{recentInteractions.length}</span>
          </div>
          <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden mt-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(activeAgents.length / 100) * 100}%` }}
              transition={{ duration: 0.6 }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            />
          </div>
        </div>
      </motion.div>

      {/* Interaction Feed */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-6 right-6 bg-slate-900/80 backdrop-blur-lg p-4 rounded-lg border border-slate-700 max-w-xs max-h-48 overflow-y-auto"
      >
        <h3 className="text-sm font-semibold text-white mb-3">Recent Activity</h3>
        <div className="space-y-2">
          {recentInteractions.map((interaction, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="text-xs text-slate-300 pb-2 border-b border-slate-700 last:border-0"
            >
              <p className="font-medium">Agent {interaction.id?.slice(0, 6)}</p>
              <p className="text-slate-500 text-xs">{interaction.type || 'Interaction'}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}