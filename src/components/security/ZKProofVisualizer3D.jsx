import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Torus, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

function ProofRing({ radius, verified, label }) {
  const ringRef = useRef();
  
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.x += 0.005;
      ringRef.current.rotation.y += 0.003;
    }
  });

  return (
    <group>
      <Torus 
        ref={ringRef}
        args={[radius, 0.1, 16, 100]}
      >
        <meshStandardMaterial 
          color={verified ? '#10b981' : '#60a5fa'}
          emissive={verified ? '#10b981' : '#60a5fa'}
          emissiveIntensity={0.6}
          metalness={0.8}
          roughness={0.2}
        />
      </Torus>
      <Text
        position={[0, radius + 0.8, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
      >
        {label}
      </Text>
    </group>
  );
}

function DataParticle({ position, verified }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      meshRef.current.position.y += Math.sin(time * 2 + position[0]) * 0.01;
    }
  });

  return (
    <Sphere ref={meshRef} args={[0.1, 16, 16]} position={position}>
      <meshStandardMaterial 
        color={verified ? '#10b981' : '#8b5cf6'}
        emissive={verified ? '#10b981' : '#8b5cf6'}
        emissiveIntensity={0.8}
      />
    </Sphere>
  );
}

export default function ZKProofVisualizer3D({ proof }) {
  const particles = Array.from({ length: 20 }, (_, i) => {
    const angle = (i / 20) * Math.PI * 2;
    const radius = 4 + Math.random() * 2;
    return [
      Math.cos(angle) * radius,
      (Math.random() - 0.5) * 3,
      Math.sin(angle) * radius
    ];
  });

  return (
    <Canvas camera={{ position: [0, 5, 12], fov: 60 }} style={{ height: '600px' }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <pointLight position={[-10, 5, -10]} intensity={0.8} color="#8b5cf6" />

      {/* Central proof core */}
      <Sphere args={[1.2, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color={proof?.verified ? '#10b981' : '#8b5cf6'}
          emissive={proof?.verified ? '#10b981' : '#8b5cf6'}
          emissiveIntensity={0.7}
          metalness={0.9}
          roughness={0.1}
        />
      </Sphere>

      <Text position={[0, 2.5, 0]} fontSize={0.6} color="white" anchorX="center">
        Zero-Knowledge Proof
      </Text>
      <Text position={[0, 1.9, 0]} fontSize={0.3} color="#a78bfa" anchorX="center">
        {proof?.proof_type || 'zk-snark'}
      </Text>
      <Text position={[0, 1.4, 0]} fontSize={0.25} color={proof?.verified ? '#10b981' : '#fbbf24'} anchorX="center">
        {proof?.verified ? '✓ Verified' : '⏳ Pending Verification'}
      </Text>

      {/* Proof rings */}
      <ProofRing radius={2} verified={proof?.verified} label="Commitment" />
      <ProofRing radius={3} verified={proof?.verified} label="Challenge" />
      <ProofRing radius={4} verified={proof?.verified} label="Response" />

      {/* Privacy particles */}
      {particles.map((pos, i) => (
        <DataParticle key={i} position={pos} verified={proof?.verified} />
      ))}

      {/* Privacy level indicator */}
      <group position={[0, -3, 0]}>
        <Text fontSize={0.4} color="#ec4899" anchorX="center">
          Privacy: {proof?.privacy_level || 'complete'}
        </Text>
        <Text position={[0, -0.5, 0]} fontSize={0.25} color="white" anchorX="center">
          🔒 Zero knowledge revealed
        </Text>
      </group>

      <OrbitControls 
        enableZoom={true}
        autoRotate
        autoRotateSpeed={0.4}
        minDistance={8}
        maxDistance={20}
      />
    </Canvas>
  );
}