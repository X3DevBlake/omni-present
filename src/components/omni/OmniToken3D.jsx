import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Text3D, Center, OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';

function OmniTokenModel() {
  const groupRef = useRef();
  const ringRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Core token sphere */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Sphere args={[2, 64, 64]}>
          <MeshDistortMaterial
            color="#00f5ff"
            attach="material"
            distort={0.3}
            speed={2}
            roughness={0}
            metalness={0.9}
          />
        </Sphere>
      </Float>

      {/* Energy rings */}
      <group ref={ringRef}>
        {[0, 60, 120].map((angle, i) => (
          <mesh key={i} rotation={[0, 0, (angle * Math.PI) / 180]}>
            <torusGeometry args={[3, 0.05, 16, 100]} />
            <meshStandardMaterial
              color={i === 0 ? '#00f5ff' : i === 1 ? '#a855f7' : '#ec4899'}
              emissive={i === 0 ? '#00f5ff' : i === 1 ? '#a855f7' : '#ec4899'}
              emissiveIntensity={0.5}
              metalness={0.8}
            />
          </mesh>
        ))}
      </group>

      {/* Orbiting particles */}
      {Array.from({ length: 50 }).map((_, i) => {
        const angle = (i / 50) * Math.PI * 2;
        const radius = 4 + Math.random() * 2;
        return (
          <Float key={i} speed={1 + Math.random()} rotationIntensity={0.5} floatIntensity={1}>
            <mesh position={[
              Math.cos(angle) * radius,
              (Math.random() - 0.5) * 4,
              Math.sin(angle) * radius
            ]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial
                color="#00f5ff"
                emissive="#00f5ff"
                emissiveIntensity={0.8}
              />
            </mesh>
          </Float>
        );
      })}

      {/* Lighting */}
      <pointLight position={[5, 5, 5]} intensity={1} color="#00f5ff" />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#a855f7" />
      <ambientLight intensity={0.3} />
    </group>
  );
}

export default function OmniToken3D({ height = '500px' }) {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-black/40 backdrop-blur-xl border border-white/10" style={{ height }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <OmniTokenModel />
        <OrbitControls enableZoom={false} />
      </Canvas>

      <div className="absolute top-4 left-4 z-10">
        <div className="bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-xl px-4 py-2">
          <div className="text-cyan-400 text-sm font-bold">OMNI Token</div>
          <div className="text-white/60 text-xs">Total Supply: 10B</div>
        </div>
      </div>
    </div>
  );
}