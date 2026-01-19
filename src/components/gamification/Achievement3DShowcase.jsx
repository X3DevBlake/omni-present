import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, RoundedBox, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function AchievementBadge({ achievement, position, index }) {
  const meshRef = useRef();
  const glowRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      
      // Floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + index) * 0.1;
    }
    
    if (glowRef.current && achievement.is_unlocked) {
      glowRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.1);
    }
  });
  
  // Rarity colors
  const rarityColors = {
    common: '#94a3b8',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#fbbf24'
  };
  
  const color = rarityColors[achievement.rarity] || '#94a3b8';
  const unlocked = achievement.is_unlocked;
  
  return (
    <group position={position}>
      {/* Glow effect for unlocked achievements */}
      {unlocked && (
        <mesh ref={glowRef}>
          <sphereGeometry args={[0.7, 32, 32]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={0.2}
            emissive={color}
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
      
      {/* Badge */}
      <RoundedBox
        ref={meshRef}
        args={[0.5, 0.5, 0.1]}
        radius={0.05}
      >
        {unlocked ? (
          <MeshDistortMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.4}
            metalness={0.8}
            roughness={0.2}
            distort={0.2}
            speed={2}
          />
        ) : (
          <meshStandardMaterial
            color="#1e293b"
            metalness={0.3}
            roughness={0.7}
          />
        )}
      </RoundedBox>
      
      {/* Achievement name */}
      <Text
        position={[0, 0.7, 0]}
        fontSize={0.12}
        color={unlocked ? 'white' : '#64748b'}
        anchorX="center"
        maxWidth={1.5}
      >
        {achievement.achievement_name}
      </Text>
      
      {/* XP reward */}
      {unlocked && (
        <Text
          position={[0, -0.7, 0]}
          fontSize={0.1}
          color="#fbbf24"
          anchorX="center"
        >
          +{achievement.xp_reward} XP
        </Text>
      )}
      
      {/* Progress bar for locked achievements */}
      {!unlocked && achievement.progress < 100 && (
        <>
          <RoundedBox
            args={[0.6, 0.05, 0.05]}
            position={[0, -0.7, 0]}
            radius={0.02}
          >
            <meshStandardMaterial color="#1e293b" />
          </RoundedBox>
          
          <RoundedBox
            args={[(achievement.progress / 100) * 0.6, 0.05, 0.05]}
            position={[-(0.6 - (achievement.progress / 100) * 0.6) / 2, -0.7, 0.06]}
            radius={0.02}
          >
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
          </RoundedBox>
          
          <Text
            position={[0, -0.9, 0]}
            fontSize={0.08}
            color="#64748b"
            anchorX="center"
          >
            {achievement.progress.toFixed(0)}%
          </Text>
        </>
      )}
    </group>
  );
}

export default function Achievement3DShowcase({ achievements }) {
  const positions = React.useMemo(() => {
    if (!achievements || achievements.length === 0) return [];
    
    const cols = 5;
    return achievements.map((_, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      
      return [
        (col - cols / 2) * 1.5,
        (row - Math.floor(achievements.length / cols) / 2) * 1.5,
        0
      ];
    });
  }, [achievements]);
  
  if (!achievements || achievements.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white">
        <p>No achievements available</p>
      </div>
    );
  }
  
  const unlockedCount = achievements.filter(a => a.is_unlocked).length;
  const totalXP = achievements
    .filter(a => a.is_unlocked)
    .reduce((sum, a) => sum + (a.xp_reward || 0), 0);
  
  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#a855f7" />
      
      {/* Achievement badges */}
      {achievements.map((achievement, idx) => (
        <AchievementBadge
          key={achievement.id || idx}
          achievement={achievement}
          position={positions[idx]}
          index={idx}
        />
      ))}
      
      {/* Summary text */}
      <Text
        position={[0, 5, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
      >
        Achievements
      </Text>
      
      <Text
        position={[0, 4.3, 0]}
        fontSize={0.25}
        color="#00f5ff"
        anchorX="center"
      >
        {unlockedCount} / {achievements.length} Unlocked • {totalXP.toLocaleString()} XP
      </Text>
      
      <OrbitControls
        enableZoom={true}
        minDistance={5}
        maxDistance={20}
      />
    </Canvas>
  );
}