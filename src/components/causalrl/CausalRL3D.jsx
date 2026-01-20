import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';

function CausalNode({ position, label }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.008;
    }
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.4, 32, 32]}>
        <meshStandardMaterial 
          color="#ec4899"
          emissive="#ec4899"
          emissiveIntensity={0.6}
        />
      </Sphere>
      <Text position={[0, 0.8, 0]} fontSize={0.2} color="white" anchorX="center">
        {label}
      </Text>
    </group>
  );
}

export default function CausalRL3D({ agent }) {
  const nodes = [
    { position: [-3, 1, 0], label: 'State' },
    { position: [0, 1, 0], label: 'Action' },
    { position: [3, 1, 0], label: 'Reward' }
  ];

  return (
    <Canvas camera={{ position: [0, 5, 12], fov: 60 }} style={{ height: '700px' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[15, 15, 15]} intensity={1.5} />
      <pointLight position={[-15, 5, -15]} intensity={0.8} color="#ec4899" />

      <Sphere args={[1, 64, 64]} position={[0, -1.5, 0]}>
        <meshStandardMaterial 
          color="#3b82f6"
          emissive="#3b82f6"
          emissiveIntensity={0.7}
        />
      </Sphere>

      {nodes.map((node, i) => (
        <CausalNode key={i} {...node} />
      ))}

      <Line points={[[-3, 1, 0], [0, 1, 0]]} color="#ec4899" lineWidth={2} />
      <Line points={[[0, 1, 0], [3, 1, 0]]} color="#ec4899" lineWidth={2} />

      <Text position={[0, 4, 0]} fontSize={0.6} color="white" anchorX="center">
        Causal RL
      </Text>
      <Text position={[0, 3.3, 0]} fontSize={0.3} color="#ec4899" anchorX="center">
        {agent?.agent_name || 'Causal Agent'}
      </Text>
      <Text position={[0, 2.8, 0]} fontSize={0.25} color="#60a5fa" anchorX="center">
        {agent?.intervention_strategy || 'do_calculus'}
      </Text>

      <group position={[0, -3.5, 0]}>
        <Text fontSize={0.35} color="#10b981" anchorX="center">
          Efficiency: {agent?.exploration_efficiency?.toFixed(1) || '3.5'}x
        </Text>
        <Text position={[0, -0.6, 0]} fontSize={0.3} color="#ec4899" anchorX="center">
          Transfer: {((agent?.transfer_learning_score || 0.88) * 100).toFixed(0)}%
        </Text>
        <Text position={[0, -1.2, 0]} fontSize={0.25} color="#60a5fa" anchorX="center">
          Reward: {agent?.policy_performance?.average_reward || 245}
        </Text>
      </group>

      <OrbitControls enableZoom={true} minDistance={8} maxDistance={20} />
    </Canvas>
  );
}