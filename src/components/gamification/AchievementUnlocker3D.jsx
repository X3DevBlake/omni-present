import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Html, Float } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Lock, Star, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import * as THREE from 'three';

const AchievementOrb = ({ achievement, position, onClick, isUnlocked }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      const scale = hovered ? 1.3 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.15);
      if (isUnlocked) {
        meshRef.current.rotation.y = state.clock.elapsedTime * 1.5;
      }
    }
  });
  
  return (
    <group position={position}>
      <Float speed={isUnlocked ? 2 : 0.5} rotationIntensity={isUnlocked ? 0.8 : 0.2}>
        <Sphere 
          ref={meshRef}
          args={[0.3, 32, 32]}
          onClick={(e) => {
            e.stopPropagation();
            onClick(achievement);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={() => setHovered(false)}
        >
          <meshPhysicalMaterial
            color={isUnlocked ? '#fbbf24' : '#374151'}
            emissive={isUnlocked ? '#fbbf24' : '#374151'}
            emissiveIntensity={isUnlocked ? 1.5 : 0.3}
            metalness={0.9}
            roughness={0.1}
          />
        </Sphere>
        
        {(hovered || isUnlocked) && (
          <Html distanceFactor={8}>
            <div className={`bg-black/95 border-2 rounded-xl p-3 min-w-[200px] backdrop-blur-xl ${
              isUnlocked ? 'border-amber-400' : 'border-gray-600'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {isUnlocked ? <Trophy className="w-4 h-4 text-amber-400" /> : <Lock className="w-4 h-4 text-gray-400" />}
                <div className={`font-bold text-xs ${isUnlocked ? 'text-amber-400' : 'text-gray-400'}`}>
                  {achievement.name}
                </div>
              </div>
              <div className="text-white text-xs mb-2">{achievement.description}</div>
              {isUnlocked && (
                <Badge className="bg-amber-600">+{achievement.xp} XP</Badge>
              )}
            </div>
          </Html>
        )}
      </Float>
    </group>
  );
};

export default function AchievementUnlocker3D({ userEmail }) {
  const [selectedAchievement, setSelectedAchievement] = useState(null);

  const { data: userAchievements = [] } = useQuery({
    queryKey: ['achievements', userEmail],
    queryFn: async () => {
      const data = await base44.entities.OmniAchievement.filter({ user_email: userEmail });
      return data;
    },
    enabled: !!userEmail
  });

  const achievements = [
    { id: 1, name: 'First Steps', description: 'Complete your first course', xp: 100, unlocked: true },
    { id: 2, name: 'Quick Learner', description: 'Complete 5 courses', xp: 250, unlocked: true },
    { id: 3, name: 'Scholar', description: 'Complete 10 courses', xp: 500, unlocked: false },
    { id: 4, name: 'Research Pioneer', description: 'Start a research project', xp: 200, unlocked: true },
    { id: 5, name: 'Collaborator', description: 'Join 3 study groups', xp: 150, unlocked: false },
    { id: 6, name: 'Streak Master', description: '30 day login streak', xp: 300, unlocked: false },
    { id: 7, name: 'Expert', description: 'Reach level 20', xp: 1000, unlocked: false },
    { id: 8, name: 'Mentor', description: 'Help 10 peers', xp: 400, unlocked: false }
  ];

  const achievementPositions = achievements.map((achievement, idx) => {
    const angle = (idx / achievements.length) * Math.PI * 2;
    const radius = 3;
    return {
      achievement,
      position: [Math.cos(angle) * radius, Math.sin(angle) * radius, 0]
    };
  });

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <Card className="bg-gradient-to-br from-amber-950/90 via-yellow-950/90 to-orange-950/90 backdrop-blur-xl border-amber-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <Trophy className="w-7 h-7 text-amber-400" />
          Achievement Galaxy
        </CardTitle>
        <p className="text-gray-300 text-sm mt-2">
          {unlockedCount}/{achievements.length} unlocked
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] bg-black/40 rounded-xl overflow-hidden mb-4 border border-amber-500/20">
          <Canvas camera={{ position: [0, 0, 7], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={2} color="#fbbf24" />
            
            <Float speed={1} rotationIntensity={0.3}>
              <Sphere args={[0.5, 64, 64]} position={[0, 0, 0]}>
                <meshPhysicalMaterial
                  color="#ec4899"
                  emissive="#ec4899"
                  emissiveIntensity={1.3}
                  metalness={0.9}
                  roughness={0.1}
                />
              </Sphere>
            </Float>

            {achievementPositions.map(({ achievement, position }) => (
              <AchievementOrb
                key={achievement.id}
                achievement={achievement}
                position={position}
                onClick={setSelectedAchievement}
                isUnlocked={achievement.unlocked}
              />
            ))}

            <OrbitControls enableZoom autoRotate autoRotateSpeed={0.5} />
          </Canvas>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-amber-950/40 rounded-lg p-3 border border-amber-500/30">
            <Trophy className="w-5 h-5 text-amber-400 mb-1" />
            <div className="text-white font-bold text-xl">{unlockedCount}</div>
            <div className="text-gray-400 text-xs">Unlocked</div>
          </div>
          <div className="bg-purple-950/40 rounded-lg p-3 border border-purple-500/30">
            <Zap className="w-5 h-5 text-purple-400 mb-1" />
            <div className="text-white font-bold text-xl">
              {achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.xp, 0)}
            </div>
            <div className="text-gray-400 text-xs">Total XP</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}