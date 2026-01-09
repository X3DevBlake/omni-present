import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sparkles, Text } from '@react-three/drei';
import { motion } from 'framer-motion';

function Badge3DModel({ badge }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.3;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={meshRef}>
        {/* Badge base */}
        <mesh>
          <cylinderGeometry args={[1, 1, 0.2, 32]} />
          <meshStandardMaterial
            color={badge.color || '#00f5ff'}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Badge top emblem */}
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.7, 0.7, 0.05, 32]} />
          <meshStandardMaterial
            color={badge.accentColor || '#a855f7'}
            metalness={0.8}
            roughness={0.2}
            emissive={badge.accentColor || '#a855f7'}
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Center gem */}
        <mesh position={[0, 0.25, 0]}>
          <octahedronGeometry args={[0.3, 0]} />
          <MeshDistortMaterial
            color="#ffffff"
            metalness={1}
            roughness={0}
            distort={0.2}
            speed={2}
          />
        </mesh>

        <Sparkles count={30} scale={2} size={1} speed={0.3} color={badge.color || '#00f5ff'} />
      </group>
    </Float>
  );
}

export default function BadgeShowcase3D({ badges }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {badges.map((badge, index) => (
        <motion.div
          key={badge.id}
          className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:scale-105 transition-all cursor-pointer"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="h-32 mb-3">
            <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[5, 5, 5]} intensity={1} />
              <pointLight position={[-5, -5, -5]} intensity={0.5} color="#a855f7" />
              <Badge3DModel badge={badge} />
            </Canvas>
          </div>
          
          <h4 className="text-white font-bold text-sm mb-1">{badge.name}</h4>
          <p className="text-white/60 text-xs mb-2">{badge.description}</p>
          
          {badge.rarity && (
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
              badge.rarity === 'legendary' ? 'bg-purple-500/20 text-purple-400' :
              badge.rarity === 'epic' ? 'bg-blue-500/20 text-blue-400' :
              badge.rarity === 'rare' ? 'bg-green-500/20 text-green-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {badge.rarity}
            </span>
          )}

          {badge.unlockedAt && (
            <div className="text-white/40 text-xs mt-2">
              {new Date(badge.unlockedAt).toLocaleDateString()}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}