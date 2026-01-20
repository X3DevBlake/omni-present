import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Box, Torus } from '@react-three/drei';

function NeuralModule({ position }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[1.2, 64, 64]}>
        <meshStandardMaterial 
          color="#3b82f6"
          emissive="#3b82f6"
          emissiveIntensity={0.6}
          metalness={0.8}
        />
      </Sphere>
      <Text position={[0, 1.8, 0]} fontSize={0.3} color="white" anchorX="center">
        NEURAL
      </Text>
    </group>
  );
}

function SymbolicModule({ position }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.z += 0.008;
    }
  });

  return (
    <group position={position}>
      <Box ref={meshRef} args={[2, 2, 2]}>
        <meshStandardMaterial 
          color="#10b981"
          emissive="#10b981"
          emissiveIntensity={0.6}
          wireframe
        />
      </Box>
      <Text position={[0, 1.8, 0]} fontSize={0.3} color="white" anchorX="center">
        SYMBOLIC
      </Text>
    </group>
  );
}

export default function NeuroSymbolic3D({ system }) {
  return (
    <Canvas camera={{ position: [0, 3, 12], fov: 60 }} style={{ height: '700px' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[15, 15, 15]} intensity={1.5} />
      <pointLight position={[-15, 5, -15]} intensity={0.8} color="#10b981" />

      <Text position={[0, 5, 0]} fontSize={0.6} color="white" anchorX="center">
        Neuro-Symbolic AI
      </Text>
      <Text position={[0, 4.3, 0]} fontSize={0.3} color="#8b5cf6" anchorX="center">
        {system?.system_name || 'Hybrid Intelligence'}
      </Text>

      <NeuralModule position={[-3.5, 0, 0]} />
      <SymbolicModule position={[3.5, 0, 0]} />

      <Torus args={[0.3, 0.1, 16, 32]} position={[0, 0, 0]} rotation={[0, Math.PI/2, 0]}>
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.7} />
      </Torus>

      <group position={[0, -3, 0]}>
        <Text fontSize={0.35} color="#10b981" anchorX="center">
          Performance: {((system?.hybrid_performance || 0.91) * 100).toFixed(0)}%
        </Text>
        <Text position={[0, -0.6, 0]} fontSize={0.3} color="#60a5fa" anchorX="center">
          Rules: {system?.symbolic_component?.rule_count || 150}
        </Text>
        <Text position={[0, -1.2, 0]} fontSize={0.3} color="#a855f7" anchorX="center">
          Explainability: {((system?.reasoning_capabilities?.explainability || 0.95) * 100).toFixed(0)}%
        </Text>
      </group>

      <OrbitControls enableZoom={true} minDistance={8} maxDistance={20} />
    </Canvas>
  );
}