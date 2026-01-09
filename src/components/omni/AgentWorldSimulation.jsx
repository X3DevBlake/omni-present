import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Text } from '@react-three/drei';
import { motion } from 'framer-motion';

function Agent({ position, name, color }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.002;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      <Text
        position={[0, 0.6, 0]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
    </group>
  );
}

function Platform() {
  return (
    <Box args={[8, 0.2, 8]} position={[0, -1, 0]}>
      <meshStandardMaterial color="#1a1a2e" opacity={0.3} transparent />
    </Box>
  );
}

export default function AgentWorldSimulation() {
  const agents = [
    { name: 'Shopping', position: [-2, 0, 0], color: '#10b981' },
    { name: 'Finance', position: [2, 0, 0], color: '#3b82f6' },
    { name: 'Travel', position: [0, 0, -2], color: '#a855f7' },
    { name: 'Research', position: [0, 0, 2], color: '#f59e0b' },
  ];

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden" style={{ height: '500px' }}>
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
        
        <Platform />
        {agents.map((agent, i) => (
          <Agent key={i} {...agent} />
        ))}
        
        <OrbitControls autoRotate autoRotateSpeed={1} />
      </Canvas>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl px-6 py-3">
        <div className="text-white/60 text-xs mb-1">Active AI Agents</div>
        <div className="text-cyan-400 text-xl font-bold">{agents.length} Online</div>
      </div>
    </div>
  );
}