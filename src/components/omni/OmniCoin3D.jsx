import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Center, Environment } from '@react-three/drei';

function CoinMesh() {
  const coinRef = useRef();

  useFrame(() => {
    if (coinRef.current) {
      coinRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.3} floatIntensity={0.2}>
      <mesh ref={coinRef}>
        {/* Main coin cylinder */}
        <cylinderGeometry args={[2, 2, 0.3, 64]} />
        <meshStandardMaterial
          color="#00f5ff"
          emissive="#00f5ff"
          emissiveIntensity={0.4}
          metalness={0.95}
          roughness={0.1}
        />
      </mesh>
      
      {/* Coin rim */}
      <mesh position={[0, 0, 0.15]}>
        <torusGeometry args={[2, 0.15, 32, 8]} />
        <meshStandardMaterial
          color="#0a8fa0"
          emissive="#00f5ff"
          emissiveIntensity={0.3}
          metalness={0.9}
          roughness={0.15}
        />
      </mesh>

      {/* Coin rim back */}
      <mesh position={[0, 0, -0.15]}>
        <torusGeometry args={[2, 0.15, 32, 8]} />
        <meshStandardMaterial
          color="#0a8fa0"
          emissive="#00f5ff"
          emissiveIntensity={0.3}
          metalness={0.9}
          roughness={0.15}
        />
      </mesh>

      {/* Torus knot logo on coin front */}
      <mesh position={[0, 0, 0.2]}>
        <torusKnotGeometry args={[0.6, 0.15, 100, 12]} />
        <meshStandardMaterial
          color="#a855f7"
          emissive="#a855f7"
          emissiveIntensity={0.6}
          metalness={0.85}
          roughness={0.2}
        />
      </mesh>

      {/* Omni text on coin back */}
      <mesh position={[0, 0, -0.2]} rotation={[0, Math.PI, 0]}>
        <torusKnotGeometry args={[0.6, 0.15, 100, 12]} />
        <meshStandardMaterial
          color="#a855f7"
          emissive="#a855f7"
          emissiveIntensity={0.6}
          metalness={0.85}
          roughness={0.2}
        />
      </mesh>
    </Float>
  );
}

function GlowEffect() {
  const glowRef = useRef();

  useFrame(() => {
    if (glowRef.current) {
      glowRef.current.rotation.x += 0.002;
      glowRef.current.rotation.z += 0.001;
    }
  });

  return (
    <mesh ref={glowRef}>
      <sphereGeometry args={[2.5, 32, 32]} />
      <meshBasicMaterial
        color="#00f5ff"
        transparent
        opacity={0.05}
        wireframe={false}
      />
    </mesh>
  );
}

export default function OmniCoin3D() {
  return (
    <div className="w-full h-full rounded-2xl overflow-hidden bg-black/40">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }} gl={{ antialias: true }}>
        <color attach="background" args={['#0a0a0f']} />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1.5} color="#00f5ff" />
        <pointLight position={[-5, -5, 5]} intensity={1} color="#a855f7" />
        <pointLight position={[0, 0, 3]} intensity={0.8} color="#00f5ff" />
        
        {/* 3D Objects */}
        <CoinMesh />
        <GlowEffect />
        
        {/* Controls only - removed Environment to avoid texture issues */}
        <OrbitControls 
          enableZoom={false} 
          enableRotate={false}
          enablePan={false}
        />
      </Canvas>
    </div>
  );
}