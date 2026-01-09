import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function AchievementNode({ position, achievement, index }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime + index) * 0.005;
    }
  });

  const colors = {
    trading: '#00f5ff',
    staking: '#10b981',
    agent: '#a855f7',
    spending: '#f59e0b',
    savings: '#ec4899'
  };

  return (
    <group>
      <mesh ref={meshRef} position={position}>
        <icosahedronGeometry args={[0.8, 4]} />
        <meshPhongMaterial
          color={colors[achievement.category] || '#ffffff'}
          emissive={colors[achievement.category] || '#ffffff'}
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Unlocked badge */}
      {achievement.unlocked && (
        <mesh position={position}>
          <sphereGeometry args={[1.3, 32, 32]} />
          <meshBasicMaterial color={colors[achievement.category]} transparent opacity={0.1} />
        </mesh>
      )}

      {/* Achievement icon representation */}
      <mesh position={[position[0], position[1] + 1.2, position[2]]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshPhongMaterial color={colors[achievement.category]} emissive={colors[achievement.category]} emissiveIntensity={0.7} />
      </mesh>
    </group>
  );
}

export default function AchievementNetwork3D({ achievements = [] }) {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.z += 0.0002;
    }
  });

  const mockAchievements = achievements.length === 0 ? [
    { id: 1, name: 'First Trade', category: 'trading', unlocked: true },
    { id: 2, name: 'Diamond Staker', category: 'staking', unlocked: true },
    { id: 3, name: 'Agent Master', category: 'agent', unlocked: true },
    { id: 4, name: 'Smart Spender', category: 'spending', unlocked: true },
    { id: 5, name: 'Savings Goal', category: 'savings', unlocked: false },
    { id: 6, name: 'Expert Trader', category: 'trading', unlocked: false },
  ] : achievements;

  const positions = [
    [0, 0, 0],
    [4, 2, -3],
    [-4, 2, -3],
    [4, -2, 3],
    [-4, -2, 3],
    [0, -4, 0],
  ];

  return (
    <div className="space-y-4">
      <div className="bg-black/40 border border-purple-500/30 rounded-2xl overflow-hidden h-96">
        <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#a855f7" />
          <pointLight position={[-10, -10, 10]} intensity={0.8} color="#ec4899" />

          <group ref={groupRef}>
            {/* Central node */}
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[1, 32, 32]} />
              <meshPhongMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
            </mesh>

            {/* Achievement nodes */}
            {mockAchievements.map((achievement, idx) => (
              <AchievementNode
                key={achievement.id}
                achievement={achievement}
                position={positions[idx % positions.length]}
                index={idx}
              />
            ))}

            {/* Connection lines */}
            {mockAchievements.map((_, idx) => (
              <lineSegments key={`line-${idx}`}>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    count={2}
                    array={new Float32Array([0, 0, 0, ...positions[idx % positions.length]])}
                    itemSize={3}
                  />
                </bufferGeometry>
                <lineBasicMaterial color="#a855f7" transparent opacity={0.3} linewidth={2} />
              </lineSegments>
            ))}
          </group>

          <OrbitControls enableZoom autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {[
          { label: 'Trading', color: '#00f5ff' },
          { label: 'Staking', color: '#10b981' },
          { label: 'Agent', color: '#a855f7' },
          { label: 'Spending', color: '#f59e0b' },
          { label: 'Savings', color: '#ec4899' },
          { label: 'Unlocked', color: '#ffffff' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
            <p className="text-white/70 text-xs">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}