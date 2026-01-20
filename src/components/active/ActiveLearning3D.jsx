import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

function LabeledSample({ position, index }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Sphere ref={meshRef} args={[0.2, 16, 16]} position={position}>
      <meshStandardMaterial 
        color="#10b981"
        emissive="#10b981"
        emissiveIntensity={0.6}
      />
    </Sphere>
  );
}

function UnlabeledSample({ position, index }) {
  return (
    <Sphere args={[0.1, 8, 8]} position={position}>
      <meshStandardMaterial 
        color="#6b7280"
        transparent
        opacity={0.3}
      />
    </Sphere>
  );
}

export default function ActiveLearning3D({ learner }) {
  const labeled = learner?.labeled_pool_size || 100;
  const unlabeled = learner?.unlabeled_pool_size || 1000;

  const labeledSamples = Array.from({ length: Math.min(labeled, 40) }, (_, i) => {
    const angle = (i / 40) * Math.PI * 2;
    const radius = 3;
    return {
      position: [Math.cos(angle) * radius, Math.sin(angle * 2), Math.sin(angle) * radius],
      index: i
    };
  });

  const unlabeledSamples = Array.from({ length: Math.min(unlabeled / 25, 60) }, (_, i) => {
    const angle = (i / 60) * Math.PI * 4;
    const radius = 5 + Math.random();
    return {
      position: [Math.cos(angle) * radius, (Math.random() - 0.5) * 4, Math.sin(angle) * radius],
      index: i
    };
  });

  return (
    <Canvas camera={{ position: [0, 5, 12], fov: 60 }} style={{ height: '700px' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[15, 15, 15]} intensity={1.5} />
      <pointLight position={[-15, 5, -15]} intensity={0.8} color="#10b981" />

      <Sphere args={[1.2, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#60a5fa" 
          emissive="#60a5fa" 
          emissiveIntensity={0.7}
        />
      </Sphere>

      <Text position={[0, 3, 0]} fontSize={0.6} color="white" anchorX="center">
        Active Learning
      </Text>
      <Text position={[0, 2.3, 0]} fontSize={0.3} color="#60a5fa" anchorX="center">
        {learner?.learner_name || 'Query Strategy'}
      </Text>
      <Text position={[0, 1.8, 0]} fontSize={0.25} color="#10b981" anchorX="center">
        {learner?.query_strategy || 'uncertainty'}
      </Text>

      {labeledSamples.map((s, i) => (
        <LabeledSample key={`labeled-${i}`} {...s} />
      ))}

      {unlabeledSamples.map((s, i) => (
        <UnlabeledSample key={`unlabeled-${i}`} {...s} />
      ))}

      <group position={[0, -4, 0]}>
        <Text fontSize={0.35} color="#10b981" anchorX="center">
          Labeled: {labeled}
        </Text>
        <Text position={[0, -0.6, 0]} fontSize={0.3} color="#6b7280" anchorX="center">
          Unlabeled: {unlabeled}
        </Text>
        <Text position={[0, -1.2, 0]} fontSize={0.3} color="#fbbf24" anchorX="center">
          Efficiency: {learner?.label_efficiency_gain?.toFixed(1) || '2.5'}x
        </Text>
      </group>

      <OrbitControls enableZoom={true} minDistance={8} maxDistance={20} />
    </Canvas>
  );
}