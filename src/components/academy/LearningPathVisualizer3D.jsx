import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Sphere } from '@react-three/drei';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import * as THREE from 'three';

const PathNode = ({ position, stage, isActive, isCurrent }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      if (isCurrent) {
        meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
      }
    }
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.5, 32, 32]}>
        <meshStandardMaterial
          color={stage.completed ? '#10b981' : isCurrent ? '#3b82f6' : '#6b7280'}
          emissive={stage.completed ? '#10b981' : isCurrent ? '#3b82f6' : '#000000'}
          emissiveIntensity={isCurrent ? 0.8 : 0.3}
        />
      </Sphere>
      <Text
        position={[0, -1, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {stage.stage_name}
      </Text>
    </group>
  );
};

export default function LearningPathVisualizer3D({ userId }) {
  const { data: learningPaths = [] } = useQuery({
    queryKey: ['learning-paths', userId],
    queryFn: () => base44.entities.LearningPath.filter({ user_id: userId }),
    enabled: !!userId
  });

  const activePath = learningPaths[0];
  const stages = activePath?.path_stages || [];

  const positions = stages.map((_, index) => {
    const angle = (index / stages.length) * Math.PI * 2;
    const radius = 5;
    return [Math.cos(angle) * radius, Math.sin(angle) * radius, 0];
  });

  return (
    <div className="w-full h-[600px] relative">
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        {stages.map((stage, index) => (
          <React.Fragment key={index}>
            <PathNode
              position={positions[index]}
              stage={stage}
              isActive={true}
              isCurrent={index === activePath?.current_stage}
            />
            {index < stages.length - 1 && (
              <Line
                points={[positions[index], positions[index + 1]]}
                color={stage.completed ? '#10b981' : '#6b7280'}
                lineWidth={2}
              />
            )}
          </React.Fragment>
        ))}
        
        <OrbitControls enableZoom enablePan />
      </Canvas>

      {activePath && (
        <div className="absolute bottom-6 left-6 right-6">
          <Card className="bg-black/60 backdrop-blur-xl border-white/20 p-6 text-white">
            <h3 className="text-xl font-bold mb-2">{activePath.path_name}</h3>
            <p className="text-gray-300 text-sm mb-4">{activePath.goal}</p>
            <div className="flex items-center gap-4">
              <Badge className="bg-blue-500">
                Progress: {activePath.progress_percentage?.toFixed(0)}%
              </Badge>
              <Badge className="bg-green-500">
                Stage {(activePath.current_stage || 0) + 1} of {stages.length}
              </Badge>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}