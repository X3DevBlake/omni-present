import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial, Environment } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

function CardMesh({ tier }) {
  const meshRef = useRef();
  const particlesRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  const tierColors = {
    pioneer: { primary: '#3b82f6', glow: '#60a5fa' },
    explorer: { primary: '#10b981', glow: '#34d399' },
    voyager: { primary: '#a855f7', glow: '#c084fc' },
    ascendant: { primary: '#f59e0b', glow: '#fbbf24' },
    sovereign: { primary: '#ec4899', glow: '#f472b6' }
  };

  const colors = tierColors[tier] || tierColors.pioneer;

  return (
    <>
      {/* Main Card */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh ref={meshRef} castShadow>
          <boxGeometry args={[3, 1.8, 0.1]} />
          <meshStandardMaterial
            color={colors.primary}
            emissive={colors.primary}
            emissiveIntensity={0.5}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Card Holographic Layer */}
        <mesh position={[0, 0, 0.06]}>
          <planeGeometry args={[2.8, 1.6]} />
          <MeshDistortMaterial
            color={colors.glow}
            emissive={colors.glow}
            emissiveIntensity={0.4}
            distort={0.2}
            speed={2}
            transparent
            opacity={0.6}
          />
        </mesh>
      </Float>

      {/* Orbiting Particles */}
      <group ref={particlesRef}>
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const radius = 2.5;
          return (
            <mesh
              key={i}
              position={[
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                Math.sin(i) * 0.5
              ]}
            >
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshBasicMaterial color={colors.glow} />
            </mesh>
          );
        })}
      </group>

      {/* Energy Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2, 0.03, 16, 100]} />
        <meshBasicMaterial color={colors.primary} transparent opacity={0.5} />
      </mesh>
    </>
  );
}

export default function Enhanced3DCardTier({ tier, name, benefits }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-6 overflow-hidden group"
    >
      {/* 3D Card Visualization */}
      <div className="h-64 mb-4 relative">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <color attach="background" args={['#000000']} />
          <ambientLight intensity={0.3} />
          <pointLight position={[5, 5, 5]} intensity={1.5} />
          <pointLight position={[-5, -5, 5]} intensity={1} color="#a855f7" />
          <CardMesh tier={tier} />
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
        </Canvas>
        
        {/* Sci-fi Overlay */}
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-cyan-400/30">
          <span className="text-cyan-400 text-xs font-bold uppercase">{tier}</span>
        </div>
      </div>

      {/* Card Info */}
      <div className="relative z-10">
        <h3 className="text-white font-bold text-xl mb-3">{name}</h3>
        <div className="space-y-2">
          {benefits.map((benefit, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center gap-2 text-white/70 text-sm"
            >
              <div className="w-5 h-5 rounded-full bg-cyan-400/20 border border-cyan-400/50 flex items-center justify-center flex-shrink-0">
                <span className="text-cyan-400 text-xs">✓</span>
              </div>
              {benefit}
            </motion.div>
          ))}
        </div>

        {/* Sci-fi Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-4 py-3 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 border border-cyan-500/50 rounded-lg text-cyan-400 font-bold relative overflow-hidden group"
        >
          <span className="relative z-10">SELECT TIER</span>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/20 to-cyan-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        </motion.button>
      </div>
    </motion.div>
  );
}