import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';

function ThoughtNode({ position, step, index }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.008;
    }
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.5, 32, 32]}>
        <meshStandardMaterial 
          color="#a855f7"
          emissive="#a855f7"
          emissiveIntensity={0.6}
        />
      </Sphere>
      <Text position={[0, 0.9, 0]} fontSize={0.25} color="white" anchorX="center">
        Step {step}
      </Text>
    </group>
  );
}

export default function ChainOfThought3D({ reasoning }) {
  const steps = reasoning?.reasoning_steps?.length || 4;
  const improvement = reasoning?.accuracy_improvement || 23;

  const thoughtNodes = Array.from({ length: steps }, (_, i) => ({
    position: [i * 2.5 - (steps - 1) * 1.25, 0, 0],
    step: i + 1,
    index: i
  }));

  return (
    <Canvas camera={{ position: [0, 5, 12], fov: 60 }} style={{ height: '700px' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[15, 15, 15]} intensity={1.5} />
      <pointLight position={[-15, 5, -15]} intensity={0.8} color="#a855f7" />

      <Text position={[0, 4, 0]} fontSize={0.6} color="white" anchorX="center">
        Chain-of-Thought
      </Text>
      <Text position={[0, 3.3, 0]} fontSize={0.3} color="#a855f7" anchorX="center">
        {reasoning?.reasoning_name || 'Step-by-Step Reasoning'}
      </Text>
      <Text position={[0, 2.8, 0]} fontSize={0.25} color="#60a5fa" anchorX="center">
        {reasoning?.reasoning_strategy || 'self_consistency'}
      </Text>

      {thoughtNodes.map((node, i) => (
        <ThoughtNode key={i} {...node} />
      ))}

      {thoughtNodes.slice(0, -1).map((node, i) => (
        <Line
          key={`line-${i}`}
          points={[node.position, thoughtNodes[i + 1].position]}
          color="#a855f7"
          lineWidth={3}
          transparent
          opacity={0.6}
        />
      ))}

      <group position={[0, -3, 0]}>
        <Text fontSize={0.35} color="#10b981" anchorX="center">
          +{improvement}% Accuracy
        </Text>
        <Text position={[0, -0.6, 0]} fontSize={0.3} color="#a855f7" anchorX="center">
          Coherence: {((reasoning?.reasoning_quality?.logical_coherence || 0.92) * 100).toFixed(0)}%
        </Text>
        <Text position={[0, -1.2, 0]} fontSize={0.25} color="#60a5fa" anchorX="center">
          {reasoning?.self_verification ? 'Self-Verified ✓' : 'No Verification'}
        </Text>
      </group>

      <OrbitControls enableZoom={true} minDistance={8} maxDistance={20} />
    </Canvas>
  );
}