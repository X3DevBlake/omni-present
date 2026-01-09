import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text3D, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award } from 'lucide-react';

function Achievement3DModel({ achievement, isUnlocked }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group ref={meshRef}>
        {/* Main trophy/badge shape */}
        <mesh position={[0, 0, 0]}>
          <dodecahedronGeometry args={[1, 0]} />
          <MeshDistortMaterial
            color={isUnlocked ? achievement.color : '#333333'}
            attach="material"
            distort={0.3}
            speed={2}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
        
        {/* Inner glow */}
        <mesh position={[0, 0, 0]} scale={0.8}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial color={isUnlocked ? achievement.color : '#666666'} transparent opacity={0.3} />
        </mesh>

        {/* Sparkles for unlocked achievements */}
        {isUnlocked && (
          <Sparkles count={50} scale={3} size={2} speed={0.3} color={achievement.color} />
        )}
      </group>
    </Float>
  );
}

export default function Achievement3DCard({ achievement, isUnlocked, onClose, showModal = false }) {
  if (showModal) {
    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
          <motion.div
            className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-2xl w-full"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10">
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="h-64 mb-6">
              <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />
                <Achievement3DModel achievement={achievement} isUnlocked={isUnlocked} />
              </Canvas>
            </div>

            <div className="text-center">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${
                isUnlocked ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/40' : 'bg-white/5 border border-white/10'
              }`}>
                <Award className={`w-5 h-5 ${isUnlocked ? 'text-yellow-400' : 'text-white/40'}`} />
                <span className={isUnlocked ? 'text-yellow-400 font-semibold' : 'text-white/60'}>
                  {isUnlocked ? 'Unlocked!' : 'Locked'}
                </span>
              </div>

              <h2 className="text-3xl font-bold text-white mb-2">{achievement.name}</h2>
              <p className="text-white/70 mb-4">{achievement.description}</p>
              
              {achievement.xpReward && (
                <div className="text-cyan-400 font-semibold">+{achievement.xpReward} XP</div>
              )}

              {achievement.rarity && (
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-3 ${
                  achievement.rarity === 'legendary' ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400' :
                  achievement.rarity === 'epic' ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-400' :
                  achievement.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {achievement.rarity.toUpperCase()}
                </div>
              )}

              {isUnlocked && achievement.unlockedAt && (
                <div className="text-white/40 text-sm mt-4">
                  Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:scale-105 transition-all cursor-pointer">
      <div className="h-32 mb-3">
        <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[5, 5, 5]} />
          <Achievement3DModel achievement={achievement} isUnlocked={isUnlocked} />
        </Canvas>
      </div>
      <h4 className={`font-bold mb-1 ${isUnlocked ? 'text-white' : 'text-white/40'}`}>
        {achievement.name}
      </h4>
      <p className={`text-xs ${isUnlocked ? 'text-white/60' : 'text-white/30'}`}>
        {achievement.description}
      </p>
    </div>
  );
}