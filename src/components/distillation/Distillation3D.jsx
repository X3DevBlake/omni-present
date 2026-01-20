import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';

function ModelNode({ position, label, size, color }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.008;
    }
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[size, 64, 64]}>
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          metalness={0.7}
        />
      </Sphere>
      <Text position={[0, size + 1, 0]} fontSize={0.4} color="white" anchorX="center">
        {label}
      </Text>
    </group>
  );
}

export default function Distillation3D({ distillation }) {
  const compression = distillation?.compression_ratio || 10;
  const retention = distillation?.performance_retention || 0.95;

  return (
    <Canvas camera={{ position: [0, 3, 12], fov: 60 }} style={{ height: '700px' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[15, 15, 15]} intensity={1.5} />
      <pointLight position={[-15, 5, -15]} intensity={0.8} color="#fbbf24" />

      <Text position={[0, 5, 0]} fontSize={0.6} color="white" anchorX="center">
        Knowledge Distillation
      </Text>
      <Text position={[0, 4.3, 0]} fontSize={0.3} color="#fbbf24" anchorX="center">
        {distillation?.distillation_name || 'Compression'}
      </Text>

      <ModelNode 
        position={[-4, 0, 0]} 
        label="Teacher" 
        size={2} 
        color="#3b82f6"
      />

      <ModelNode 
        position={[4, 0, 0]} 
        label="Student" 
        size={2 / Math.sqrt(compression)} 
        color="#10b981"
      />

      <Line
        points={[[-4, 0, 0], [4, 0, 0]]}
        color="#fbbf24"
        lineWidth={3}
        transparent
        opacity={0.6}
      />

      <group position={[0, -3, 0]}>
        <Text fontSize={0.35} color="#10b981" anchorX="center">
          {compression}x Compression
        </Text>
        <Text position={[0, -0.6, 0]} fontSize={0.3} color="#60a5fa" anchorX="center">
          {(retention * 100).toFixed(0)}% Retained
        </Text>
        <Text position={[0, -1.2, 0]} fontSize={0.3} color="#fbbf24" anchorX="center">
          {distillation?.speedup_factor?.toFixed(1) || '5.2'}x Faster
        </Text>
      </group>

      <OrbitControls enableZoom={true} minDistance={8} maxDistance={18} />
    </Canvas>
  );
}