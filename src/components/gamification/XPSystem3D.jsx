import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Html, Float, Ring } from '@react-three/drei';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, Trophy, Star } from 'lucide-react';
import * as THREE from 'three';

const XPOrb = ({ level, xp, maxXP }) => {
  const meshRef = useRef();
  const ringRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime;
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.scale.setScalar(1 + pulse);
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.5;
    }
  });

  const progress = (xp / maxXP) * 100;
  
  return (
    <group>
      <Float speed={2} rotationIntensity={0.5}>
        <Sphere ref={meshRef} args={[0.8, 64, 64]}>
          <meshPhysicalMaterial
            color="#fbbf24"
            emissive="#fbbf24"
            emissiveIntensity={1.5}
            metalness={0.9}
            roughness={0.1}
          />
        </Sphere>
        
        <Ring ref={ringRef} args={[1.2, 1.4, 64]} rotation={[Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color="#8b5cf6" transparent opacity={0.6} />
        </Ring>
        
        <Html distanceFactor={6}>
          <div className="bg-black/95 border-2 border-amber-400 rounded-xl p-4 min-w-[200px] backdrop-blur-xl pointer-events-none">
            <div className="text-center mb-3">
              <div className="text-amber-400 font-bold text-xl mb-1">Level {level}</div>
              <div className="text-white text-sm">{xp.toLocaleString()} / {maxXP.toLocaleString()} XP</div>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3 mb-2">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-purple-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-center text-cyan-400 text-xs">{progress.toFixed(0)}% to next level</div>
          </div>
        </Html>
      </Float>
    </group>
  );
};

export default function XPSystem3D({ userXP = 2450, userLevel = 12 }) {
  const maxXP = userLevel * 500;
  
  return (
    <Card className="bg-gradient-to-br from-amber-950/90 via-orange-950/90 to-yellow-950/90 backdrop-blur-xl border-amber-500/30">
      <CardContent className="p-4">
        <div className="h-[280px] bg-black/40 rounded-xl overflow-hidden">
          <Canvas camera={{ position: [0, 0, 4], fov: 60 }}>
            <ambientLight intensity={0.6} />
            <pointLight position={[5, 5, 5]} intensity={2} color="#fbbf24" />
            <XPOrb level={userLevel} xp={userXP} maxXP={maxXP} />
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
          </Canvas>
        </div>
      </CardContent>
    </Card>
  );
}