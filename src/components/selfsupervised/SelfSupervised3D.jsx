import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Box } from '@react-three/drei';
import * as THREE from 'three';

function DataSample({ position, index }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.008;
      const time = state.clock.elapsedTime;
      meshRef.current.position.y += Math.sin(time * 2 + index) * 0.01;
    }
  });

  return (
    <Box ref={meshRef} args={[0.4, 0.4, 0.4]} position={position}>
      <meshStandardMaterial 
        color="#10b981"
        emissive="#10b981"
        emissiveIntensity={0.4}
        transparent
        opacity={0.7}
      />
    </Box>
  );
}

export default function SelfSupervised3D({ task }) {
  const dataSize = Math.min((task?.training_data_size || 10000) / 200, 100);
  
  const samples = Array.from({ length: dataSize }, (_, i) => {
    const angle = (i / dataSize) * Math.PI * 4;
    const radius = 3 + (i / dataSize) * 3;
    const height = Math.sin(angle * 2) * 2;
    return {
      position: [Math.cos(angle) * radius, height, Math.sin(angle) * radius],
      index: i
    };
  });

  const quality = task?.learned_representations?.embedding_quality || 0.88;

  return (
    <Canvas camera={{ position: [0, 8, 15], fov: 60 }} style={{ height: '700px' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[15, 15, 15]} intensity={1.5} />
      <pointLight position={[-15, 5, -15]} intensity={0.8} color="#10b981" />

      <Sphere args={[1.5, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#a855f7" 
          emissive="#a855f7" 
          emissiveIntensity={0.8}
          metalness={0.9}
        />
      </Sphere>

      <Text position={[0, 3, 0]} fontSize={0.6} color="white" anchorX="center">
        Self-Supervised Learning
      </Text>
      <Text position={[0, 2.3, 0]} fontSize={0.3} color="#a855f7" anchorX="center">
        {task?.task_name || 'SSL Task'}
      </Text>
      <Text position={[0, 1.8, 0]} fontSize={0.25} color="#10b981" anchorX="center">
        {task?.pretext_task || 'contrastive'}
      </Text>

      {samples.map((sample, i) => (
        <DataSample key={i} {...sample} />
      ))}

      <group position={[0, -4, 0]}>
        <Text fontSize={0.35} color="#10b981" anchorX="center">
          Quality: {(quality * 100).toFixed(0)}%
        </Text>
        <Text position={[0, -0.6, 0]} fontSize={0.3} color="#60a5fa" anchorX="center">
          Label Efficiency: {((task?.label_efficiency || 0.92) * 100).toFixed(0)}%
        </Text>
        <Text position={[0, -1.2, 0]} fontSize={0.25} color="#fbbf24" anchorX="center">
          {task?.training_data_size?.toLocaleString() || '10,000'} unlabeled samples
        </Text>
      </group>

      <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.3} minDistance={10} maxDistance={25} />
    </Canvas>
  );
}