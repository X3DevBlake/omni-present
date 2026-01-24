import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import * as THREE from 'three';

const SkillNode = ({ position, skill, isAcquired, isCurrent }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      if (isCurrent) {
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
        meshRef.current.scale.setScalar(pulse);
      }
    }
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.4, 32, 32]}>
        <meshStandardMaterial
          color={isAcquired ? '#10b981' : isCurrent ? '#3b82f6' : '#6b7280'}
          emissive={isAcquired ? '#10b981' : isCurrent ? '#3b82f6' : '#000000'}
          emissiveIntensity={isAcquired ? 0.7 : isCurrent ? 0.9 : 0.2}
        />
      </Sphere>
      <Text position={[0, -0.7, 0]} fontSize={0.15} color="white" anchorX="center">
        {skill.name}
      </Text>
      {isAcquired && (
        <Text position={[0, 0.7, 0]} fontSize={0.12} color="#10b981" anchorX="center">
          ✓ Mastered
        </Text>
      )}
    </group>
  );
};

export default function SkillTreeVisualizer3D({ userId }) {
  const { data: learningPaths = [] } = useQuery({
    queryKey: ['learning-paths', userId],
    queryFn: () => base44.entities.LearningPath.filter({ user_id: userId }),
    enabled: !!userId
  });

  const activePath = learningPaths[0];
  const skillTargets = activePath?.skill_targets || [];

  // Create tree layout
  const treeDepth = 3;
  const positions = skillTargets.map((skill, index) => {
    const level = Math.floor(index / 3);
    const posInLevel = index % 3;
    const x = (posInLevel - 1) * 3;
    const y = -level * 2;
    const z = 0;
    return [x, y, z];
  });

  return (
    <Card className="bg-white/10 backdrop-blur-xl border-white/20 h-[500px]">
      <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />

        {/* Root Node */}
        <Sphere args={[0.6, 32, 32]} position={[0, 2, 0]}>
          <meshStandardMaterial
            color="#8b5cf6"
            emissive="#8b5cf6"
            emissiveIntensity={0.8}
          />
        </Sphere>
        <Text position={[0, 3, 0]} fontSize={0.3} color="white" anchorX="center">
          {activePath?.path_name || 'Skills'}
        </Text>

        {/* Skill Nodes */}
        {skillTargets.map((skill, index) => {
          const acquired = skill.current_level >= skill.target_level;
          const isCurrent = Math.abs(skill.current_level - skill.target_level) < 0.3 && !acquired;
          
          return (
            <React.Fragment key={index}>
              <SkillNode
                position={positions[index]}
                skill={skill}
                isAcquired={acquired}
                isCurrent={isCurrent}
              />
              
              {/* Connection to parent */}
              {index > 0 && (
                <Line
                  points={[
                    new THREE.Vector3(...positions[Math.floor(index / 3)]),
                    new THREE.Vector3(...positions[index])
                  ]}
                  color={acquired ? '#10b981' : '#6b7280'}
                  lineWidth={1}
                />
              )}
            </React.Fragment>
          );
        })}

        <OrbitControls enableZoom />
      </Canvas>
    </Card>
  );
}