import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function DIDOrb({ reputation = 75 }) {
  const orbRef = useRef();
  const auraRef = useRef();
  
  // Color based on reputation
  const getReputationColor = (rep) => {
    if (rep > 80) return '#00ff88';
    if (rep > 60) return '#00f5ff';
    if (rep > 40) return '#a855f7';
    return '#ec4899';
  };

  useFrame((state) => {
    if (orbRef.current) {
      orbRef.current.rotation.y += 0.01;
      orbRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
    if (auraRef.current) {
      auraRef.current.rotation.y -= 0.005;
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      auraRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <group>
        {/* Outer Aura - Reputation Glow */}
        <mesh ref={auraRef}>
          <sphereGeometry args={[2.5, 32, 32]} />
          <meshBasicMaterial
            color={getReputationColor(reputation)}
            transparent
            opacity={0.15}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Main DID Orb */}
        <mesh ref={orbRef}>
          <Sphere args={[1.5, 64, 64]}>
            <MeshDistortMaterial
              color={getReputationColor(reputation)}
              emissive={getReputationColor(reputation)}
              emissiveIntensity={0.6}
              distort={0.3}
              speed={2}
              roughness={0.2}
              metalness={0.8}
            />
          </Sphere>
        </mesh>

        {/* Orbiting Credential Badges */}
        {[0, 1, 2, 3].map((i) => {
          const angle = (i / 4) * Math.PI * 2;
          const radius = 2.5;
          return (
            <Float key={i} speed={2 + i * 0.5} rotationIntensity={1}>
              <mesh position={[
                Math.cos(angle) * radius,
                Math.sin(angle * 2) * 0.5,
                Math.sin(angle) * radius
              ]}>
                <octahedronGeometry args={[0.2]} />
                <meshStandardMaterial
                  color="#ffffff"
                  emissive="#00f5ff"
                  emissiveIntensity={0.5}
                  metalness={1}
                />
              </mesh>
            </Float>
          );
        })}
      </group>
    </Float>
  );
}

export default function DIDAvatar3D() {
  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/30 rounded-2xl overflow-hidden" style={{ height: '500px' }}>
      <div className="p-4 border-b border-white/10">
        <h3 className="text-white font-bold text-xl">🆔 Your Decentralized Identity</h3>
        <p className="text-white/60 text-sm">Your DID avatar with orbiting verifiable credentials</p>
      </div>
      <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#00f5ff" />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#a855f7" />
        
        <DIDOrb reputation={85} />
        
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
      
      <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-3">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-white/60 text-xs">On-Chain Reputation</div>
            <div className="text-white font-bold text-lg">85/100</div>
          </div>
          <div className="flex gap-2">
            <div className="px-3 py-1 bg-green-500/20 border border-green-500/40 rounded text-green-400 text-xs">
              4 Credentials
            </div>
            <div className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/40 rounded text-cyan-400 text-xs">
              Verified
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}