import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Sphere, Cylinder, Cone } from '@react-three/drei';
import { motion } from 'framer-motion';

function Agent({ position, color, label, isActive }) {
  const ref = useRef();
  
  useFrame((state) => {
    if (ref.current && isActive) {
      ref.current.position.x += Math.sin(state.clock.elapsedTime + position[0]) * 0.01;
      ref.current.position.z += Math.cos(state.clock.elapsedTime + position[2]) * 0.01;
    }
  });

  return (
    <group ref={ref} position={position}>
      <Sphere args={[0.3, 16, 16]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isActive ? 0.5 : 0.2}
        />
      </Sphere>
      {isActive && (
        <Sphere args={[0.4, 16, 16]}>
          <meshStandardMaterial
            color={color}
            transparent
            opacity={0.2}
            wireframe
          />
        </Sphere>
      )}
    </group>
  );
}

function Building({ position, height, color }) {
  return (
    <group position={position}>
      <Box args={[1, height, 1]} position={[0, height / 2, 0]}>
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.5} />
      </Box>
    </group>
  );
}

function Store({ position, name }) {
  return (
    <group position={position}>
      <Box args={[1.5, 1, 1.5]} position={[0, 0.5, 0]}>
        <meshStandardMaterial color="#10b981" />
      </Box>
      <Cone args={[1, 0.5, 4]} position={[0, 1.25, 0]}>
        <meshStandardMaterial color="#059669" />
      </Cone>
    </group>
  );
}

function WorldScene({ agents }) {
  return (
    <>
      {/* Ground */}
      <Box args={[20, 0.1, 20]} position={[0, -0.05, 0]}>
        <meshStandardMaterial color="#1a1a1f" />
      </Box>

      {/* Grid */}
      <gridHelper args={[20, 20, '#00f5ff', '#ffffff']} opacity={0.1} />

      {/* Buildings */}
      <Building position={[-5, 0, -5]} height={3} color="#2d3748" />
      <Building position={[5, 0, -5]} height={4} color="#374151" />
      <Building position={[-5, 0, 5]} height={2.5} color="#1f2937" />
      <Building position={[5, 0, 5]} height={3.5} color="#2d3748" />

      {/* Stores */}
      <Store position={[-2, 0, 0]} name="Electronics" />
      <Store position={[2, 0, 0]} name="Groceries" />
      <Store position={[0, 0, -3]} name="Bookstore" />

      {/* Agents */}
      {agents.map((agent, i) => (
        <Agent
          key={i}
          position={agent.position}
          color={agent.color}
          label={agent.name}
          isActive={agent.status === 'shopping' || agent.status === 'working'}
        />
      ))}

      {/* Lights */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00f5ff" />
      <pointLight position={[-10, 10, -10]} intensity={0.5} color="#a855f7" />
    </>
  );
}

export default function AgentWorldSimulation({ agents, height = '500px' }) {
  const [selectedAgent, setSelectedAgent] = useState(null);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-black/40 backdrop-blur-xl border border-white/10" style={{ height }}>
      <Canvas camera={{ position: [10, 10, 10], fov: 60 }}>
        <WorldScene agents={agents} />
        <OrbitControls />
      </Canvas>

      <div className="absolute top-4 left-4 z-10">
        <div className="bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-xl px-4 py-2">
          <div className="text-cyan-400 text-sm font-bold">Live Simulation</div>
          <div className="text-white/60 text-xs">{agents.length} Active Agents</div>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-10 space-y-2">
        {agents.map((agent, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-black/60 backdrop-blur-md border border-white/20 rounded-lg px-3 py-2 cursor-pointer hover:border-cyan-500/50 transition-all"
            onClick={() => setSelectedAgent(agent)}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: agent.color }}
              />
              <div>
                <div className="text-white text-xs font-medium">{agent.name}</div>
                <div className="text-white/60 text-[10px]">{agent.status}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}