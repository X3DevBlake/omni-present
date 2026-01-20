import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

function ProgressRing({ progress, label, position, color }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += 0.01;
    }
  });

  const progressAngle = (progress / 100) * Math.PI * 2;

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <torusGeometry args={[1, 0.15, 16, 100, progressAngle]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
        />
      </mesh>
      
      <mesh rotation={[0, 0, progressAngle]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.2}
        />
      </mesh>

      <Text position={[0, 0, 0]} fontSize={0.3} color="white">
        {progress}%
      </Text>
      <Text position={[0, -1.5, 0]} fontSize={0.15} color={color}>
        {label}
      </Text>
    </group>
  );
}

function AchievementBadge({ achievement, position }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <RoundedBox args={[0.6, 0.6, 0.1]} radius={0.1}>
          <meshStandardMaterial
            color="#ffaa00"
            emissive="#ffaa00"
            emissiveIntensity={0.6}
            metalness={0.8}
          />
        </RoundedBox>
      </mesh>
      <Text position={[0, -0.5, 0]} fontSize={0.08} color="white">
        {achievement.name}
      </Text>
    </group>
  );
}

export default function GamificationProgressRing3D({ progressData = {}, achievements = [] }) {
  const defaultProgress = [
    { label: 'Level Progress', progress: 67, color: '#00f5ff' },
    { label: 'Skills', progress: 85, color: '#a855f7' },
    { label: 'Challenges', progress: 43, color: '#44ff44' }
  ];

  return (
    <div className="w-full h-[500px] bg-black/20 rounded-xl overflow-hidden">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
        
        <Text position={[0, 4, 0]} fontSize={0.4} color="#ffaa00">
          Your Progress
        </Text>

        {defaultProgress.map((prog, i) => (
          <ProgressRing
            key={i}
            progress={prog.progress}
            label={prog.label}
            position={[i * 3 - 3, 0, 0]}
            color={prog.color}
          />
        ))}

        {achievements.slice(0, 5).map((achievement, i) => (
          <AchievementBadge
            key={i}
            achievement={achievement}
            position={[i * 1.5 - 3, -3, 0]}
          />
        ))}
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}