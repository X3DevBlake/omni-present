import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Float, MeshDistortMaterial, Text } from '@react-three/drei';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Trophy, Zap, Flame, Star } from 'lucide-react';

const FloatingIcon = ({ position, Icon, color }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime;
    }
  });
  
  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={1}>
        <Sphere ref={meshRef} args={[0.3, 32, 32]}>
          <meshPhysicalMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.5}
            metalness={0.9}
            roughness={0.1}
          />
        </Sphere>
      </Float>
    </group>
  );
};

export default function GamificationShowcase3D() {
  return (
    <Card className="bg-gradient-to-br from-purple-950/80 via-pink-950/80 to-amber-950/80 backdrop-blur-xl border-purple-500/40">
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-white font-bold text-2xl mb-2 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            Earn & Compete
          </h3>
          <p className="text-gray-400 text-sm">Level up through learning and collaboration</p>
        </div>
        
        <div className="h-[300px] bg-black/40 rounded-xl overflow-hidden mb-4 border border-purple-500/20">
          <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[5, 5, 5]} intensity={2} color="#8b5cf6" />
            
            <Float speed={1.5} rotationIntensity={0.5}>
              <Sphere args={[0.8, 64, 64]}>
                <MeshDistortMaterial
                  color="#ec4899"
                  distort={0.4}
                  speed={2}
                  roughness={0.1}
                  metalness={0.9}
                />
              </Sphere>
            </Float>

            <FloatingIcon position={[-2, 1, 0]} color="#fbbf24" />
            <FloatingIcon position={[2, 1, 0]} color="#8b5cf6" />
            <FloatingIcon position={[-2, -1, 0]} color="#f59e0b" />
            <FloatingIcon position={[2, -1, 0]} color="#3b82f6" />

            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
          </Canvas>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-purple-950/40 rounded-lg p-3 border border-purple-500/30 text-center">
            <Zap className="w-6 h-6 text-purple-400 mx-auto mb-1" />
            <div className="text-white font-bold">XP System</div>
            <div className="text-gray-400 text-xs">Level up</div>
          </div>
          <div className="bg-amber-950/40 rounded-lg p-3 border border-amber-500/30 text-center">
            <Trophy className="w-6 h-6 text-amber-400 mx-auto mb-1" />
            <div className="text-white font-bold">Achievements</div>
            <div className="text-gray-400 text-xs">Unlock</div>
          </div>
          <div className="bg-orange-950/40 rounded-lg p-3 border border-orange-500/30 text-center">
            <Flame className="w-6 h-6 text-orange-400 mx-auto mb-1" />
            <div className="text-white font-bold">Streaks</div>
            <div className="text-gray-400 text-xs">Daily bonus</div>
          </div>
          <div className="bg-blue-950/40 rounded-lg p-3 border border-blue-500/30 text-center">
            <Star className="w-6 h-6 text-blue-400 mx-auto mb-1" />
            <div className="text-white font-bold">Leaderboard</div>
            <div className="text-gray-400 text-xs">Compete</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}