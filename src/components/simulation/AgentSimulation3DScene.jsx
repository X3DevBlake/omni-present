import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Text } from '@react-three/drei';
import { motion } from 'framer-motion';

function Agent3D({ agent, isActive }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current && isActive) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  const statusColors = {
    idle: '#00f5ff',
    working: '#10b981',
    learning: '#a855f7',
    shopping: '#ec4899'
  };

  return (
    <group position={[agent.position?.x || 0, 0, agent.position?.z || 0]}>
      <Sphere ref={meshRef} args={[0.5, 32, 32]}>
        <meshStandardMaterial
          color={statusColors[agent.status] || '#00f5ff'}
          emissive={statusColors[agent.status] || '#00f5ff'}
          emissiveIntensity={isActive ? 0.8 : 0.3}
        />
      </Sphere>
      <Text
        position={[0, 1, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {agent.name}
      </Text>
    </group>
  );
}

function Environment({ worldState }) {
  return (
    <>
      <Box args={[20, 0.1, 20]} position={[0, -0.5, 0]}>
        <meshStandardMaterial color="#1a1a2e" />
      </Box>
      <gridHelper args={[20, 20, '#00f5ff', '#1a1a2e']} />
    </>
  );
}

export default function AgentSimulation3DScene({ agents, worldState, isRunning }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden h-[600px]"
    >
      <Canvas camera={{ position: [10, 10, 10], fov: 60 }}>
        <color attach="background" args={['#000000']} />
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00f5ff" />
        <pointLight position={[-10, 10, -10]} intensity={0.5} color="#a855f7" />
        
        <Environment worldState={worldState} />
        
        {agents.map((agent, i) => (
          <Agent3D key={agent.id} agent={{ ...agent, position: { x: (i - agents.length / 2) * 2, z: 0 } }} isActive={isRunning} />
        ))}
        
        <OrbitControls enablePan enableZoom enableRotate />
      </Canvas>
    </motion.div>
  );
}