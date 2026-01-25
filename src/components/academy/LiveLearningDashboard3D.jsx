import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Html, Float, Trail, MeshDistortMaterial } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Trophy, TrendingUp, BookOpen, Clock, Target, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import * as THREE from 'three';

const SkillNode = ({ skill, position, onClick, isSelected }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      const scale = isSelected ? 1.4 : hovered ? 1.2 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.15);
      meshRef.current.rotation.y = state.clock.elapsedTime * (isSelected ? 2 : 0.5);
    }
  });

  const levelColors = ['#6b7280', '#3b82f6', '#8b5cf6', '#ec4899', '#fbbf24'];
  const color = levelColors[Math.min(skill.level, 4)] || '#8b5cf6';
  
  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.8}>
        <Sphere 
          ref={meshRef}
          args={[0.25, 32, 32]}
          onClick={(e) => {
            e.stopPropagation();
            onClick(skill);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={() => setHovered(false)}
        >
          <meshPhysicalMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isSelected ? 2 : hovered ? 1.5 : 0.9}
            metalness={0.9}
            roughness={0.1}
          />
        </Sphere>

        {(hovered || isSelected) && (
          <Html distanceFactor={8}>
            <div className="bg-black/95 border-2 border-purple-400 rounded-xl p-4 min-w-[220px] backdrop-blur-xl">
              <div className="text-purple-400 font-bold text-sm mb-2">{skill.name}</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-800 rounded-full h-2">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      style={{ width: `${skill.mastery}%` }}
                    />
                  </div>
                  <span className="text-white text-xs font-bold">{skill.mastery}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Level {skill.level}</span>
                  <span className="text-cyan-400">{skill.xp} XP</span>
                </div>
              </div>
            </div>
          </Html>
        )}
      </Float>
      
      <Text position={[0, -0.45, 0]} fontSize={0.1} color="white" anchorX="center">
        {skill.name}
      </Text>
    </group>
  );
};

export default function LiveLearningDashboard3D() {
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: progress = [] } = useQuery({
    queryKey: ['learningProgress', user?.email],
    queryFn: async () => {
      const data = await base44.entities.TrainingProgress.filter({ user_email: user?.email });
      return data;
    },
    enabled: !!user
  });

  const skills = progress.length > 0 ? progress : [
    { id: 1, name: 'Deep Learning', level: 4, mastery: 87, xp: 2400 },
    { id: 2, name: 'Quantum Algorithms', level: 3, mastery: 65, xp: 1800 },
    { id: 3, name: 'Consciousness Theory', level: 5, mastery: 95, xp: 3200 },
    { id: 4, name: 'BCI Engineering', level: 2, mastery: 43, xp: 950 },
    { id: 5, name: 'Holographic Physics', level: 3, mastery: 71, xp: 2100 },
    { id: 6, name: 'Active Inference', level: 4, mastery: 82, xp: 2650 }
  ];

  const skillPositions = skills.map((skill, idx) => {
    const angle = (idx / skills.length) * Math.PI * 2;
    const radius = 3.5;
    return {
      skill,
      position: [Math.cos(angle) * radius, Math.sin(angle) * 1.5, Math.sin(angle) * radius]
    };
  });

  return (
    <Card className="bg-gradient-to-br from-purple-950/90 via-indigo-950/90 to-blue-950/90 backdrop-blur-xl border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <Target className="w-7 h-7 text-purple-400" />
          Live Learning Progress
        </CardTitle>
        <p className="text-gray-300 text-sm mt-2">Interactive skill tree with real-time XP tracking</p>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] bg-black/40 rounded-xl overflow-hidden mb-4 border border-purple-500/20">
          <Canvas camera={{ position: [0, 2, 8], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={2} color="#8b5cf6" />
            <pointLight position={[-10, -10, -10]} intensity={1} color="#3b82f6" />

            {/* Central learner core */}
            <Float speed={1} rotationIntensity={0.3}>
              <Sphere args={[0.5, 64, 64]} position={[0, 0, 0]}>
                <MeshDistortMaterial
                  color="#ec4899"
                  distort={0.4}
                  speed={2}
                  roughness={0.1}
                  metalness={0.9}
                />
              </Sphere>
              <Text position={[0, 0.8, 0]} fontSize={0.18} color="#ec4899" anchorX="center">
                Your Brain
              </Text>
            </Float>

            {skillPositions.map(({ skill, position }) => (
              <SkillNode
                key={skill.id}
                skill={skill}
                position={position}
                onClick={setSelectedSkill}
                isSelected={selectedSkill?.id === skill.id}
              />
            ))}

            <OrbitControls enableZoom autoRotate autoRotateSpeed={0.6} />
          </Canvas>
        </div>

        <AnimatePresence>
          {selectedSkill && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-purple-950/40 border border-purple-500/40 rounded-xl p-6 backdrop-blur-xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-bold text-2xl mb-1">{selectedSkill.name}</h3>
                  <Badge className="bg-purple-600">Level {selectedSkill.level}</Badge>
                </div>
                <button onClick={() => setSelectedSkill(null)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Mastery Progress</span>
                    <span className="text-white font-bold">{selectedSkill.mastery}%</span>
                  </div>
                  <Progress value={selectedSkill.mastery} className="h-3" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/40 rounded-lg p-3">
                    <Zap className="w-5 h-5 text-amber-400 mb-1" />
                    <div className="text-white font-bold text-lg">{selectedSkill.xp}</div>
                    <div className="text-gray-400 text-xs">Total XP</div>
                  </div>
                  <div className="bg-black/40 rounded-lg p-3">
                    <Trophy className="w-5 h-5 text-purple-400 mb-1" />
                    <div className="text-white font-bold text-lg">{selectedSkill.level}</div>
                    <div className="text-gray-400 text-xs">Current Level</div>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                <BookOpen className="w-4 h-4 mr-2" />
                Continue Learning
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}