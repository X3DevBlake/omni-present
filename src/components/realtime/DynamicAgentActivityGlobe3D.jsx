import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { Globe, Activity } from 'lucide-react';

function EarthSphere() {
  const ref = useRef();

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.0001;
    }
  });

  return (
    <Sphere ref={ref} args={[10, 64, 64]} position={[0, 0, 0]}>
      <meshPhongMaterial
        color="#1e3a8a"
        emissive="#1e40af"
        emissiveIntensity={0.2}
        wireframe={false}
      />
    </Sphere>
  );
}

function Agent({ position, name, active }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (ref.current) {
      const scale = active ? (1 + Math.sin(Date.now() * 0.003) * 0.1) : 1;
      ref.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group position={position} ref={ref}>
      <Sphere args={[0.5, 32, 32]}>
        <meshPhongMaterial
          color={active ? '#10b981' : '#f59e0b'}
          emissive={active ? '#10b981' : '#f59e0b'}
          emissiveIntensity={0.8}
        />
      </Sphere>
      <pointLight
        intensity={active ? 2 : 1}
        color={active ? '#10b981' : '#f59e0b'}
        distance={8}
      />
    </group>
  );
}

function GlobeScene({ agents = [] }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <EarthSphere />

      {agents.map((agent, idx) => {
        const lat = (Math.random() - 0.5) * Math.PI;
        const lon = (Math.random() - 0.5) * Math.PI * 2;
        const radius = 11;

        const x = radius * Math.cos(lat) * Math.cos(lon);
        const y = radius * Math.sin(lat);
        const z = radius * Math.cos(lat) * Math.sin(lon);

        return (
          <Agent
            key={idx}
            position={[x, y, z]}
            name={agent.name}
            active={agent.status === 'active'}
          />
        );
      })}

      <OrbitControls autoRotate autoRotateSpeed={0.5} enableZoom />
    </>
  );
}

export default function DynamicAgentActivityGlobe3D({ agents = [], loading = false }) {
  const activeCount = agents.filter(a => a.status === 'active').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyan-400" />
          <h3 className="text-white font-bold">Agent Activity Network</h3>
        </div>
        <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full">
          <Activity className="w-3 h-3 text-green-400" />
          <span className="text-xs text-white/70">{activeCount} Active</span>
        </div>
      </div>

      <div className="relative h-[500px] bg-gradient-to-br from-blue-900/20 to-black/40 border border-blue-500/20 rounded-xl overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white/60">Loading agent network...</div>
          </div>
        ) : (
          <Canvas>
            <GlobeScene agents={agents} />
          </Canvas>
        )}
      </div>

      {/* Agent Stats */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-green-500/10 border border-green-500/20 rounded p-2">
          <p className="text-green-400 font-bold">{activeCount}</p>
          <p className="text-white/60">Active</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-2">
          <p className="text-yellow-400 font-bold">{agents.length - activeCount}</p>
          <p className="text-white/60">Idle</p>
        </div>
      </div>
    </motion.div>
  );
}