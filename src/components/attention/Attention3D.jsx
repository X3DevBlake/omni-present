import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';

function AttentionHead({ position, index }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      const pulse = Math.sin(state.clock.elapsedTime * 2 + index) * 0.1 + 0.9;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <Sphere ref={meshRef} args={[0.4, 32, 32]} position={position}>
      <meshStandardMaterial 
        color="#ec4899"
        emissive="#ec4899"
        emissiveIntensity={0.6}
      />
    </Sphere>
  );
}

export default function Attention3D({ mechanism }) {
  const numHeads = mechanism?.num_heads || 8;

  const heads = Array.from({ length: numHeads }, (_, i) => {
    const angle = (i / numHeads) * Math.PI * 2;
    const radius = 4;
    return {
      position: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius],
      index: i
    };
  });

  return (
    <Canvas camera={{ position: [0, 6, 12], fov: 60 }} style={{ height: '700px' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[15, 15, 15]} intensity={1.5} />
      <pointLight position={[-15, 5, -15]} intensity={0.8} color="#ec4899" />

      <Sphere args={[1, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#8b5cf6" 
          emissive="#8b5cf6" 
          emissiveIntensity={0.7}
        />
      </Sphere>

      <Text position={[0, 3, 0]} fontSize={0.6} color="white" anchorX="center">
        Attention Mechanism
      </Text>
      <Text position={[0, 2.3, 0]} fontSize={0.3} color="#ec4899" anchorX="center">
        {mechanism?.mechanism_name || 'Multi-Head'}
      </Text>
      <Text position={[0, 1.8, 0]} fontSize={0.25} color="#60a5fa" anchorX="center">
        {mechanism?.attention_type || 'self_attention'}
      </Text>

      {heads.map((head, i) => (
        <AttentionHead key={i} {...head} />
      ))}

      {heads.map((head, i) => (
        <Line
          key={`line-${i}`}
          points={[[0, 0, 0], head.position]}
          color="#ec4899"
          lineWidth={2}
          transparent
          opacity={0.4}
        />
      ))}

      <group position={[0, -3, 0]}>
        <Text fontSize={0.35} color="#10b981" anchorX="center">
          {numHeads} Heads × {mechanism?.head_dimension || 64}d
        </Text>
        <Text position={[0, -0.6, 0]} fontSize={0.3} color="#60a5fa" anchorX="center">
          Context: {mechanism?.context_length || 2048}
        </Text>
        <Text position={[0, -1.2, 0]} fontSize={0.25} color="#fbbf24" anchorX="center">
          {mechanism?.sparsity_pattern || 'dense'}
        </Text>
      </group>

      <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.5} minDistance={8} maxDistance={20} />
    </Canvas>
  );
}