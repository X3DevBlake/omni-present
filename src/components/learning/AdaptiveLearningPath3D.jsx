import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line, Cone } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Target, TrendingUp, Award, Zap } from 'lucide-react';
import * as THREE from 'three';

function LearningModule({ module, position, index }) {
  const meshRef = useRef();
  const glowRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current && glowRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime * 0.5;
      
      const pulse = Math.sin(clock.elapsedTime * 2 + index) * 0.1 + 1;
      glowRef.current.scale.setScalar(pulse);
    }
  });

  const statusColor = module.completion_status === 'completed' ? '#00ff00' :
                      module.completion_status === 'in_progress' ? '#ffaa00' :
                      '#0088ff';

  return (
    <group position={position}>
      <Sphere ref={glowRef} args={[0.5, 32, 32]}>
        <meshBasicMaterial color={statusColor} transparent opacity={0.15} />
      </Sphere>
      
      <Cone ref={meshRef} args={[0.3, 0.5, 4]}>
        <meshStandardMaterial
          color={statusColor}
          emissive={statusColor}
          emissiveIntensity={module.mastery_score || 0.5}
        />
      </Cone>

      <Text
        position={[0, 0.6, 0]}
        fontSize={0.1}
        color="white"
        anchorX="center"
      >
        {module.module_name}
      </Text>
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.08}
        color={statusColor}
        anchorX="center"
      >
        {((module.mastery_score || 0) * 100).toFixed(0)}%
      </Text>
    </group>
  );
}

function LearningPath({ modules }) {
  const pathPoints = useMemo(() => {
    return modules.map((_, idx) => {
      const t = idx / (modules.length - 1 || 1);
      const angle = t * Math.PI * 4;
      const radius = 5;
      const height = -4 + t * 8;
      
      return [
        Math.cos(angle) * radius * (1 - t * 0.5),
        height,
        Math.sin(angle) * radius * (1 - t * 0.5)
      ];
    });
  }, [modules]);

  return (
    <Line
      points={pathPoints}
      color="#00ffff"
      lineWidth={2}
      transparent
      opacity={0.5}
    />
  );
}

function AdaptiveLearningScene({ learningPath }) {
  const modules = learningPath?.learning_modules || [];
  
  const modulePositions = useMemo(() => {
    return modules.map((_, idx) => {
      const t = idx / (modules.length - 1 || 1);
      const angle = t * Math.PI * 4;
      const radius = 5;
      const height = -4 + t * 8;
      
      return [
        Math.cos(angle) * radius * (1 - t * 0.5),
        height,
        Math.sin(angle) * radius * (1 - t * 0.5)
      ];
    });
  }, [modules]);

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 10, 0]} intensity={2} color="#00ff88" />
      <pointLight position={[10, 0, 10]} intensity={1} color="#ff00ff" />
      <spotLight position={[0, 15, 0]} intensity={1.5} angle={0.4} color="#00ffff" />
      
      <Text
        position={[0, 6, 0]}
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
      >
        ADAPTIVE LEARNING PATH
      </Text>

      {/* Start Point */}
      <group position={modulePositions[0] || [0, -4, 0]}>
        <Sphere args={[0.4, 32, 32]}>
          <meshStandardMaterial color="#0088ff" emissive="#0088ff" emissiveIntensity={1} />
        </Sphere>
        <Text position={[0, -0.7, 0]} fontSize={0.12} color="#0088ff" anchorX="center">
          START
        </Text>
      </group>

      {/* Goal Point */}
      <group position={modulePositions[modulePositions.length - 1] || [0, 4, 0]}>
        <Sphere args={[0.5, 32, 32]}>
          <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={1.2} />
        </Sphere>
        <Text position={[0, 0.9, 0]} fontSize={0.15} color="#ffaa00" anchorX="center">
          GOAL
        </Text>
      </group>

      {/* Learning Path */}
      <LearningPath modules={modules} />

      {/* Learning Modules */}
      {modules.map((module, idx) => (
        <LearningModule
          key={idx}
          module={module}
          position={modulePositions[idx]}
          index={idx}
        />
      ))}

      <OrbitControls 
        enableZoom={true}
        enablePan={true}
        autoRotate
        autoRotateSpeed={0.8}
      />
    </>
  );
}

export default function AdaptiveLearningPath3D({ learningPath }) {
  const modules = learningPath?.learning_modules || [];
  const completed = modules.filter(m => m.completion_status === 'completed').length;
  const progress = learningPath?.progress_metrics?.completion_percent || 0;
  const efficiency = learningPath?.progress_metrics?.learning_efficiency || 0;

  return (
    <Card className="bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 border-indigo-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-2xl">
          <GraduationCap className="w-8 h-8 text-indigo-400 animate-pulse" />
          AI-Adaptive Learning Journey
          <Badge className="bg-indigo-500/30 text-indigo-300">
            PROGRESS: {progress.toFixed(0)}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-black/40 p-3 rounded-lg border border-indigo-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-indigo-400" />
              <span className="text-white/60 text-xs">Modules</span>
            </div>
            <div className="text-white text-lg font-bold">{modules.length}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-green-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-green-400" />
              <span className="text-white/60 text-xs">Completed</span>
            </div>
            <div className="text-white text-lg font-bold">{completed}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-purple-500/30">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-white/60 text-xs">Efficiency</span>
            </div>
            <div className="text-white text-lg font-bold">{(efficiency * 100).toFixed(0)}%</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-pink-500/30">
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="w-4 h-4 text-pink-400" />
              <span className="text-white/60 text-xs">Retention</span>
            </div>
            <div className="text-white text-lg font-bold">
              {((learningPath?.progress_metrics?.retention_rate || 0.85) * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        <div className="h-[600px] bg-black/20 rounded-lg overflow-hidden">
          <Canvas camera={{ position: [10, 6, 10], fov: 60 }}>
            <color attach="background" args={['#0a0020']} />
            <fog attach="fog" args={['#0a0020', 10, 45]} />
            <AdaptiveLearningScene learningPath={learningPath || {}} />
          </Canvas>
        </div>

        <div className="mt-4 flex gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-white/60">Completed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-white/60">In Progress</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-white/60">Not Started</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}