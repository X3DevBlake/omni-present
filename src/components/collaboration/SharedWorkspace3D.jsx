import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Text, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Users, MessageSquare, Share2 } from 'lucide-react';

function AgentNode({ position, name, color, data }) {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.008;
    }
  });

  return (
    <group position={position}>
      {/* Agent sphere */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[0.5, 4]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          wireframe={false}
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>

      {/* Data orbs */}
      {data?.map((item, i) => {
        const angle = (i / data.length) * Math.PI * 2;
        const distance = 1.2;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * distance,
              Math.sin(angle) * distance,
              0
            ]}
          >
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={0.8} />
          </mesh>
        );
      })}

      {/* Connection lines */}
      {data?.map((_, i) => {
        const angle = (i / data.length) * Math.PI * 2;
        const distance = 1.2;
        return (
          <line key={`line-${i}`}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([
                  0, 0, 0,
                  Math.cos(angle) * distance,
                  Math.sin(angle) * distance,
                  0
                ])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color={color} linewidth={2} transparent opacity={0.6} />
          </line>
        );
      })}
    </group>
  );
}

export default function SharedWorkspace3D() {
  const [agents, setAgents] = useState([
    { id: 1, name: 'Trading Bot', position: [-3, 2, 0], color: '#00f5ff', data: [1, 2, 3] },
    { id: 2, name: 'Analytics Bot', position: [0, 2, -3], color: '#a855f7', data: [1, 2] },
    { id: 3, name: 'Execution Bot', position: [3, 2, 0], color: '#ec4899', data: [1, 2, 3, 4] }
  ]);

  const [sharedData, setSharedData] = useState([
    { id: 1, title: 'Market Data', status: 'active', sender: 'Trading Bot', size: '2.4 MB' },
    { id: 2, title: 'Analysis Results', status: 'synced', sender: 'Analytics Bot', size: '1.1 MB' },
    { id: 3, title: 'Task Queue', status: 'active', sender: 'Execution Bot', size: '0.8 MB' }
  ]);

  return (
    <div className="space-y-6">
      {/* 3D Workspace */}
      <div className="bg-black/20 border border-cyan-500/30 rounded-2xl overflow-hidden h-96">
        <Canvas camera={{ position: [8, 6, 8], fov: 50 }}>
          <color attach="background" args={['#0a0a0f']} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#00f5ff" />
          <pointLight position={[-10, -10, -10]} intensity={1} color="#a855f7" />

          {agents.map(agent => (
            <AgentNode
              key={agent.id}
              position={agent.position}
              name={agent.name}
              color={agent.color}
              data={agent.data}
            />
          ))}

          <Environment preset="night" />
          <OrbitControls enableZoom autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      {/* Agents in Workspace */}
      <div className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          Agents in Workspace ({agents.length})
        </h3>

        <div className="space-y-3">
          {agents.map((agent, idx) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between group hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-3 flex-1">
                <div
                  className="w-4 h-4 rounded-full animate-pulse"
                  style={{ backgroundColor: agent.color }}
                />
                <div>
                  <p className="text-white font-semibold text-sm">{agent.name}</p>
                  <p className="text-white/50 text-xs">{agent.data?.length || 0} data items</p>
                </div>
              </div>
              <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded transition-all">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Shared Data */}
      <div className="bg-black/40 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Share2 className="w-5 h-5 text-green-400" />
          Shared Data ({sharedData.length})
        </h3>

        <div className="space-y-3">
          {sharedData.map((data, idx) => (
            <motion.div
              key={data.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between"
            >
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">{data.title}</p>
                <p className="text-white/50 text-xs">From: {data.sender} • {data.size}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                data.status === 'active'
                  ? 'bg-green-500/30 text-green-300 border border-green-500/50'
                  : 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
              }`}>
                {data.status === 'active' ? '🔴 Active' : '✓ Synced'}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}