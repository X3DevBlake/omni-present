import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

function DataPoint({ position, quality, index }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      meshRef.current.position.y += Math.sin(time * 2 + index) * 0.005;
      meshRef.current.rotation.y += 0.01;
    }
  });

  const qualityColor = new THREE.Color().lerpColors(
    new THREE.Color('#ef4444'),
    new THREE.Color('#10b981'),
    quality
  );

  return (
    <Sphere ref={meshRef} args={[0.15, 16, 16]} position={position}>
      <meshStandardMaterial 
        color={qualityColor}
        emissive={qualityColor}
        emissiveIntensity={0.5}
      />
    </Sphere>
  );
}

function QualityMetricBar({ position, label, value, color }) {
  return (
    <group position={position}>
      <mesh position={[0, value * 2, 0]}>
        <boxGeometry args={[0.4, value * 4, 0.4]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      <Text position={[0, -0.8, 0]} fontSize={0.25} color="white" anchorX="center">
        {label}
      </Text>
      <Text position={[0, -1.2, 0]} fontSize={0.2} color={color} anchorX="center">
        {(value * 100).toFixed(0)}%
      </Text>
    </group>
  );
}

export default function SyntheticData3D({ dataset }) {
  const sampleCount = Math.min(dataset?.sample_count || 100, 200);
  const quality = dataset?.quality_metrics || {};

  const dataPoints = Array.from({ length: sampleCount }, (_, i) => {
    const angle = (i / sampleCount) * Math.PI * 4;
    const radius = 4 + Math.random() * 2;
    const height = (Math.random() - 0.5) * 4;
    return {
      position: [
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      ],
      quality: Math.random() * 0.3 + 0.7,
      index: i
    };
  });

  const qualityMetrics = [
    { label: 'Fidelity', value: quality.fidelity_score || 0.85, color: '#60a5fa', position: [-6, 0, 0] },
    { label: 'Diversity', value: quality.diversity_score || 0.90, color: '#10b981', position: [-2, 0, 0] },
    { label: 'Privacy', value: quality.privacy_score || 1.0, color: '#a855f7', position: [2, 0, 0] },
    { label: 'Realism', value: quality.realism_score || 0.88, color: '#f59e0b', position: [6, 0, 0] }
  ];

  return (
    <Canvas camera={{ position: [0, 8, 18], fov: 60 }} style={{ height: '700px' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[15, 15, 15]} intensity={1.5} />
      <pointLight position={[-15, 5, -15]} intensity={0.8} color="#10b981" />

      {/* Central generator core */}
      <Sphere args={[1.5, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#10b981" 
          emissive="#10b981" 
          emissiveIntensity={0.7}
          metalness={0.9}
          roughness={0.1}
        />
      </Sphere>

      <Text position={[0, 3, 0]} fontSize={0.6} color="white" anchorX="center">
        Synthetic Data Engine
      </Text>
      <Text position={[0, 2.3, 0]} fontSize={0.3} color="#10b981" anchorX="center">
        {dataset?.dataset_name || 'AI Generator'}
      </Text>
      <Text position={[0, 1.8, 0]} fontSize={0.25} color="#60a5fa" anchorX="center">
        Method: {dataset?.generation_method || 'GAN'}
      </Text>
      <Text position={[0, 1.3, 0]} fontSize={0.22} color="#a78bfa" anchorX="center">
        {sampleCount} samples generated
      </Text>

      {/* Synthetic data points */}
      {dataPoints.map((point, i) => (
        <DataPoint key={i} {...point} />
      ))}

      {/* Quality metrics */}
      <group position={[0, -5, 0]}>
        {qualityMetrics.map((metric, i) => (
          <QualityMetricBar key={i} {...metric} />
        ))}
      </group>

      {/* Privacy guarantee */}
      {quality.privacy_score === 1.0 && (
        <group position={[0, -8, 0]}>
          <Text fontSize={0.35} color="#a855f7" anchorX="center">
            🔒 100% Privacy Preserved
          </Text>
        </group>
      )}

      <OrbitControls 
        enableZoom={true}
        autoRotate
        autoRotateSpeed={0.5}
        minDistance={12}
        maxDistance={35}
      />
    </Canvas>
  );
}