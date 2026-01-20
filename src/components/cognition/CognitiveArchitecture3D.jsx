import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Box, Torus } from '@react-three/drei';
import * as THREE from 'three';

function MemoryModule({ position, type, active }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += active ? 0.01 : 0.002;
      if (active) {
        const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.1 + 0.9;
        meshRef.current.scale.setScalar(pulse);
      }
    }
  });

  const colors = {
    'working': '#60a5fa',
    'episodic': '#10b981',
    'semantic': '#f59e0b',
    'procedural': '#a855f7'
  };

  return (
    <group position={position}>
      <Box ref={meshRef} args={[1, 1, 1]}>
        <meshStandardMaterial 
          color={colors[type] || '#6b7280'}
          emissive={colors[type] || '#6b7280'}
          emissiveIntensity={active ? 0.6 : 0.3}
          transparent
          opacity={active ? 0.9 : 0.6}
        />
      </Box>
      <Text position={[0, 0.8, 0]} fontSize={0.25} color="white" anchorX="center">
        {type.toUpperCase()}
      </Text>
    </group>
  );
}

function ReasoningModule({ position, module, index }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current && module.active) {
      const time = state.clock.elapsedTime;
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.z += 0.008;
    }
  });

  return (
    <group position={position}>
      <Torus ref={meshRef} args={[0.5, 0.15, 16, 32]}>
        <meshStandardMaterial 
          color={module.active ? '#ec4899' : '#6b7280'}
          emissive={module.active ? '#ec4899' : '#6b7280'}
          emissiveIntensity={module.active ? 0.6 : 0.2}
        />
      </Torus>
      <Text position={[0, -1, 0]} fontSize={0.2} color="white" anchorX="center">
        {module.module_name}
      </Text>
    </group>
  );
}

export default function CognitiveArchitecture3D({ architecture }) {
  const workingMemory = architecture?.working_memory;
  const reasoning = architecture?.reasoning_modules || [];
  const metacog = architecture?.metacognition;

  const memoryTypes = ['working', 'episodic', 'semantic', 'procedural'];
  const memoryPositions = memoryTypes.map((type, i) => ({
    position: [-4 + i * 2.5, 3, 0],
    type,
    active: type === 'working' && (architecture?.cognitive_load || 0) > 0.3
  }));

  const reasoningPositions = reasoning.slice(0, 5).map((module, i) => {
    const angle = (i / 5) * Math.PI * 2;
    const radius = 4;
    return {
      module,
      position: [Math.cos(angle) * radius, -2, Math.sin(angle) * radius],
      index: i
    };
  });

  return (
    <Canvas camera={{ position: [0, 2, 12], fov: 60 }} style={{ height: '700px' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <pointLight position={[-10, 5, -10]} intensity={0.8} color="#ec4899" />

      {/* Central cognitive core */}
      <Sphere args={[1.2, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#ec4899" 
          emissive="#ec4899" 
          emissiveIntensity={0.8}
          metalness={0.9}
          roughness={0.1}
        />
      </Sphere>

      <Text position={[0, 6, 0]} fontSize={0.6} color="white" anchorX="center">
        Cognitive Architecture
      </Text>
      <Text position={[0, 5.3, 0]} fontSize={0.3} color="#ec4899" anchorX="center">
        {architecture?.architecture_name || 'AI Mind'}
      </Text>
      <Text position={[0, 4.8, 0]} fontSize={0.25} color="#60a5fa" anchorX="center">
        Load: {((architecture?.cognitive_load || 0.3) * 100).toFixed(0)}%
      </Text>

      {/* Memory modules */}
      {memoryPositions.map((mem, i) => (
        <MemoryModule key={i} {...mem} />
      ))}

      {/* Reasoning modules */}
      {reasoningPositions.map((reas, i) => (
        <ReasoningModule key={i} {...reas} />
      ))}

      {/* Metacognition indicator */}
      <group position={[0, -5, 0]}>
        <Text fontSize={0.4} color="#a855f7" anchorX="center">
          Self-Awareness: {((metacog?.self_awareness_level || 0.7) * 100).toFixed(0)}%
        </Text>
        <Text position={[0, -0.6, 0]} fontSize={0.25} color="white" anchorX="center">
          Strategy: {metacog?.strategy_selection || 'adaptive'}
        </Text>
      </group>

      <OrbitControls 
        enableZoom={true}
        minDistance={8}
        maxDistance={20}
      />
    </Canvas>
  );
}