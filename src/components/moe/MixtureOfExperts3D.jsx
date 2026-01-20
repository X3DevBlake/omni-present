import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

function ExpertNode({ position, expert, index, active }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  const color = active ? '#10b981' : '#6b7280';

  return (
    <Sphere ref={meshRef} args={[0.6, 32, 32]} position={position}>
      <meshStandardMaterial 
        color={color}
        emissive={color}
        emissiveIntensity={active ? 0.7 : 0.3}
        transparent
        opacity={active ? 1 : 0.4}
      />
    </Sphere>
  );
}

export default function MixtureOfExperts3D({ moe }) {
  const numExperts = moe?.num_experts || 8;
  const topK = moe?.experts_per_token || 2;

  const experts = Array.from({ length: numExperts }, (_, i) => {
    const angle = (i / numExperts) * Math.PI * 2;
    const radius = 4;
    return {
      position: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius],
      expert: i,
      index: i,
      active: i < topK
    };
  });

  return (
    <Canvas camera={{ position: [0, 6, 12], fov: 60 }} style={{ height: '700px' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[15, 15, 15]} intensity={1.5} />
      <pointLight position={[-15, 5, -15]} intensity={0.8} color="#10b981" />

      <Sphere args={[1, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#fbbf24" 
          emissive="#fbbf24" 
          emissiveIntensity={0.7}
        />
      </Sphere>

      <Text position={[0, 3.5, 0]} fontSize={0.6} color="white" anchorX="center">
        Mixture of Experts
      </Text>
      <Text position={[0, 2.8, 0]} fontSize={0.3} color="#fbbf24" anchorX="center">
        {moe?.model_name || 'MoE Model'}
      </Text>
      <Text position={[0, 2.3, 0]} fontSize={0.25} color="#10b981" anchorX="center">
        {numExperts} experts • Top-{topK} active
      </Text>

      {experts.map((exp, i) => (
        <ExpertNode key={i} {...exp} />
      ))}

      {experts.filter(e => e.active).map((exp, i) => (
        <Line
          key={`line-${i}`}
          points={[[0, 0, 0], exp.position]}
          color="#10b981"
          lineWidth={2}
          transparent
          opacity={0.6}
        />
      ))}

      <group position={[0, -3.5, 0]}>
        <Text fontSize={0.35} color="#10b981" anchorX="center">
          Sparsity: {((moe?.sparsity_ratio || 0.25) * 100).toFixed(0)}%
        </Text>
        <Text position={[0, -0.6, 0]} fontSize={0.3} color="#60a5fa" anchorX="center">
          Efficiency: {moe?.performance_metrics?.efficiency_gain?.toFixed(1) || '3.2'}x
        </Text>
        <Text position={[0, -1.2, 0]} fontSize={0.25} color="#fbbf24" anchorX="center">
          Balance: {((moe?.load_balancing_score || 0.88) * 100).toFixed(0)}%
        </Text>
      </group>

      <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.4} minDistance={8} maxDistance={20} />
    </Canvas>
  );
}