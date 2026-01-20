import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Torus, Line } from '@react-three/drei';
import * as THREE from 'three';

function ModalityNode({ position, modality, performance }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  const colors = {
    vision: '#3b82f6',
    text: '#10b981',
    audio: '#f59e0b',
    video: '#ec4899',
    sensor: '#8b5cf6'
  };

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.8, 32, 32]}>
        <meshStandardMaterial 
          color={colors[modality] || '#6b7280'}
          emissive={colors[modality] || '#6b7280'}
          emissiveIntensity={0.6}
        />
      </Sphere>
      <Text position={[0, 1.2, 0]} fontSize={0.3} color="white" anchorX="center">
        {modality.toUpperCase()}
      </Text>
      <Text position={[0, 0.8, 0]} fontSize={0.2} color={colors[modality]} anchorX="center">
        {(performance * 100).toFixed(0)}%
      </Text>
    </group>
  );
}

export default function MultiModal3D({ model }) {
  const modalities = model?.modalities || [];
  const performance = model?.performance_by_modality || {};

  const modalityPositions = modalities.map((mod, i) => {
    const angle = (i / modalities.length) * Math.PI * 2;
    const radius = 5;
    return {
      modality: mod,
      position: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius],
      performance: performance[mod] || 0.9
    };
  });

  return (
    <Canvas camera={{ position: [0, 8, 15], fov: 60 }} style={{ height: '700px' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[15, 15, 15]} intensity={1.5} />
      <pointLight position={[-15, 5, -15]} intensity={0.8} color="#8b5cf6" />

      <Torus args={[2, 0.6, 32, 64]} position={[0, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
        <meshStandardMaterial 
          color="#8b5cf6" 
          emissive="#8b5cf6" 
          emissiveIntensity={0.7}
          metalness={0.8}
        />
      </Torus>

      <Text position={[0, 4, 0]} fontSize={0.6} color="white" anchorX="center">
        Multi-Modal AI
      </Text>
      <Text position={[0, 3.3, 0]} fontSize={0.3} color="#8b5cf6" anchorX="center">
        {model?.model_name || 'Unified Model'}
      </Text>
      <Text position={[0, 2.8, 0]} fontSize={0.25} color="#60a5fa" anchorX="center">
        {model?.fusion_strategy || 'attention_fusion'}
      </Text>

      {modalityPositions.map((pos, i) => (
        <ModalityNode key={i} {...pos} />
      ))}

      {modalityPositions.map((pos, i) => (
        <Line
          key={`line-${i}`}
          points={[[0, 0, 0], pos.position]}
          color="#8b5cf6"
          lineWidth={2}
          transparent
          opacity={0.4}
        />
      ))}

      <group position={[0, -4, 0]}>
        <Text fontSize={0.35} color="#10b981" anchorX="center">
          Alignment: {((model?.cross_modal_alignment?.alignment_score || 0.85) * 100).toFixed(0)}%
        </Text>
        <Text position={[0, -0.6, 0]} fontSize={0.3} color="#60a5fa" anchorX="center">
          Zero-Shot: {((model?.zero_shot_capabilities?.cross_modal_retrieval || 0.78) * 100).toFixed(0)}%
        </Text>
      </group>

      <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.5} minDistance={10} maxDistance={25} />
    </Canvas>
  );
}