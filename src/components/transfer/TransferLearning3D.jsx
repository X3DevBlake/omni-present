import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Cylinder, Line } from '@react-three/drei';
import * as THREE from 'three';

function DomainSphere({ position, label, isSource }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[1.5, 64, 64]}>
        <meshStandardMaterial 
          color={isSource ? '#3b82f6' : '#10b981'}
          emissive={isSource ? '#3b82f6' : '#10b981'}
          emissiveIntensity={0.6}
          metalness={0.7}
          roughness={0.3}
        />
      </Sphere>
      <Text position={[0, 2.2, 0]} fontSize={0.4} color="white" anchorX="center">
        {label}
      </Text>
      <Text position={[0, 1.7, 0]} fontSize={0.25} color="#a0a0a0" anchorX="center">
        {isSource ? 'Source' : 'Target'}
      </Text>
    </group>
  );
}

function TransferFlow({ start, end, efficiency }) {
  const lineRef = useRef();
  
  useFrame((state) => {
    if (lineRef.current) {
      const opacity = 0.4 + Math.sin(state.clock.elapsedTime * 2) * 0.3;
      lineRef.current.material.opacity = opacity;
    }
  });

  return (
    <Line
      ref={lineRef}
      points={[start, end]}
      color="#fbbf24"
      lineWidth={efficiency / 20}
      transparent
      opacity={0.6}
    />
  );
}

export default function TransferLearning3D({ task }) {
  const metrics = task?.transfer_metrics || {};

  return (
    <Canvas camera={{ position: [0, 5, 12], fov: 60 }} style={{ height: '700px' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[15, 15, 15]} intensity={1.5} />
      <pointLight position={[-15, 5, -15]} intensity={0.8} color="#fbbf24" />

      <Text position={[0, 5, 0]} fontSize={0.6} color="white" anchorX="center">
        Transfer Learning
      </Text>
      <Text position={[0, 4.3, 0]} fontSize={0.3} color="#fbbf24" anchorX="center">
        {task?.task_name || 'Knowledge Transfer'}
      </Text>

      {/* Source domain */}
      <DomainSphere 
        position={[-5, 0, 0]} 
        label={task?.source_domain || 'Source'} 
        isSource={true}
      />

      {/* Target domain */}
      <DomainSphere 
        position={[5, 0, 0]} 
        label={task?.target_domain || 'Target'} 
        isSource={false}
      />

      {/* Transfer flow */}
      <TransferFlow 
        start={[-5, 0, 0]} 
        end={[5, 0, 0]} 
        efficiency={task?.transfer_efficiency || 85}
      />

      {/* Knowledge transfer bridge */}
      <Cylinder args={[0.2, 0.2, 8, 16]} position={[0, 0, 0]} rotation={[0, 0, Math.PI/2]}>
        <meshStandardMaterial 
          color="#fbbf24" 
          emissive="#fbbf24"
          emissiveIntensity={0.4}
        />
      </Cylinder>

      {/* Metrics display */}
      <group position={[0, -3, 0]}>
        <Text fontSize={0.35} color="#10b981" anchorX="center">
          Accuracy: {((metrics.transfer_accuracy || 0.88) * 100).toFixed(0)}%
        </Text>
        <Text position={[0, -0.6, 0]} fontSize={0.3} color="#60a5fa" anchorX="center">
          Improvement: +{((metrics.improvement || 0.23) * 100).toFixed(1)}%
        </Text>
        <Text position={[0, -1.2, 0]} fontSize={0.3} color="#fbbf24" anchorX="center">
          {metrics.convergence_speed || 2.5}x Faster
        </Text>
      </group>

      <OrbitControls enableZoom={true} minDistance={8} maxDistance={20} />
    </Canvas>
  );
}