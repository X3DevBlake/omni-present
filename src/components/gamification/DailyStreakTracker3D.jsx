import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Html, Float } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Flame, Calendar, Zap, Trophy } from 'lucide-react';
import * as THREE from 'three';

const StreakFlame = ({ day, isCompleted, isCurrent }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current && isCompleted) {
      const flicker = Math.sin(state.clock.elapsedTime * 5 + day) * 0.1;
      meshRef.current.scale.setScalar(1 + flicker);
      meshRef.current.rotation.y = state.clock.elapsedTime * 2;
    }
  });
  
  const angle = (day / 7) * Math.PI * 2;
  const radius = 2;
  const position = [Math.cos(angle) * radius, Math.sin(angle) * radius, 0];
  
  return (
    <group position={position}>
      <Float speed={isCompleted ? 3 : 0.5} rotationIntensity={isCompleted ? 1 : 0}>
        <Sphere 
          ref={meshRef}
          args={[isCurrent ? 0.35 : 0.25, 32, 32]}
        >
          <meshPhysicalMaterial
            color={isCompleted ? '#f59e0b' : '#374151'}
            emissive={isCompleted ? '#f59e0b' : '#374151'}
            emissiveIntensity={isCompleted ? 2 : 0.3}
            metalness={0.9}
            roughness={0.1}
          />
        </Sphere>
        
        <Text position={[0, -0.5, 0]} fontSize={0.15} color="white" anchorX="center">
          {day}
        </Text>
      </Float>
    </group>
  );
};

export default function DailyStreakTracker3D({ currentStreak = 12, longestStreak = 28 }) {
  return (
    <Card className="bg-gradient-to-br from-orange-950/90 via-red-950/90 to-amber-950/90 backdrop-blur-xl border-orange-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <Flame className="w-7 h-7 text-orange-400" />
          Daily Login Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] bg-black/40 rounded-xl overflow-hidden mb-4 border border-orange-500/20">
          <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[5, 5, 5]} intensity={2} color="#f59e0b" />
            
            <Float speed={1.5} rotationIntensity={0.4}>
              <Sphere args={[0.4, 64, 64]} position={[0, 0, 0]}>
                <meshPhysicalMaterial
                  color="#dc2626"
                  emissive="#dc2626"
                  emissiveIntensity={1.5}
                  metalness={0.9}
                  roughness={0.1}
                />
              </Sphere>
              <Text position={[0, 0, 0]} fontSize={0.25} color="white" anchorX="center">
                {currentStreak}
              </Text>
            </Float>

            {Array(7).fill(0).map((_, idx) => (
              <StreakFlame
                key={idx}
                day={idx + 1}
                isCompleted={idx < currentStreak % 7 || currentStreak >= 7}
                isCurrent={idx === (currentStreak % 7) - 1}
              />
            ))}

            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
          </Canvas>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-orange-950/40 rounded-lg p-3 border border-orange-500/30">
            <Flame className="w-5 h-5 text-orange-400 mb-1" />
            <div className="text-white font-bold text-2xl">{currentStreak}</div>
            <div className="text-gray-400 text-xs">Current</div>
          </div>
          <div className="bg-amber-950/40 rounded-lg p-3 border border-amber-500/30">
            <Trophy className="w-5 h-5 text-amber-400 mb-1" />
            <div className="text-white font-bold text-2xl">{longestStreak}</div>
            <div className="text-gray-400 text-xs">Best</div>
          </div>
          <div className="bg-purple-950/40 rounded-lg p-3 border border-purple-500/30">
            <Zap className="w-5 h-5 text-purple-400 mb-1" />
            <div className="text-white font-bold text-2xl">{currentStreak * 10}</div>
            <div className="text-gray-400 text-xs">Bonus XP</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}