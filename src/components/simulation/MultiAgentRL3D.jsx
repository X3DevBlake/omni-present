import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

function TrainingAgent({ agentId, position, reward }) {
  const meshRef = useRef();
  const trailRef = useRef([]);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Random movement (simulating exploration)
      const speed = 0.02;
      meshRef.current.position.x += (Math.random() - 0.5) * speed;
      meshRef.current.position.z += (Math.random() - 0.5) * speed;
      
      // Keep within bounds
      meshRef.current.position.x = Math.max(-5, Math.min(5, meshRef.current.position.x));
      meshRef.current.position.z = Math.max(-5, Math.min(5, meshRef.current.position.z));
      
      // Rotation
      meshRef.current.rotation.y += 0.03;
      
      // Record trail
      trailRef.current.push(meshRef.current.position.clone());
      if (trailRef.current.length > 20) {
        trailRef.current.shift();
      }
    }
  });
  
  // Size and color based on reward
  const normalizedReward = Math.max(0, Math.min(1, (reward + 100) / 400));
  const color = new THREE.Color().setHSL(normalizedReward * 0.3, 0.8, 0.5);
  
  return (
    <group>
      <Sphere
        ref={meshRef}
        args={[0.2, 16, 16]}
        position={position}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
        />
      </Sphere>
      
      {/* Trail */}
      {trailRef.current.length > 1 && (
        <Line
          points={trailRef.current}
          color={color}
          lineWidth={2}
          transparent
          opacity={0.5}
        />
      )}
    </group>
  );
}

function RewardIndicator({ episodeRewards }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
    }
  });
  
  if (!episodeRewards || episodeRewards.length === 0) return null;
  
  const avgReward = episodeRewards.reduce((a, b) => a + b, 0) / episodeRewards.length;
  const maxReward = Math.max(...episodeRewards);
  
  return (
    <group position={[0, 3, -5]}>
      <mesh ref={meshRef}>
        <torusGeometry args={[1, 0.1, 16, 100]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={0.5}
        />
      </mesh>
      
      <Text
        position={[0, 0, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
      >
        Avg Reward: {avgReward.toFixed(0)}
      </Text>
    </group>
  );
}

export default function MultiAgentRL3D({ session }) {
  if (!session) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white">
        <p>No training session active</p>
      </div>
    );
  }
  
  const agents = [...Array(session.agent_count || 5)].map((_, idx) => ({
    id: `agent_${idx}`,
    reward: (session.metrics?.episode_rewards || [])[idx] || 0
  }));
  
  return (
    <Canvas camera={{ position: [0, 8, 12], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#a855f7" />
      
      {/* Training ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#1e293b" wireframe opacity={0.3} transparent />
      </mesh>
      
      {/* Training agents */}
      {agents.map((agent, idx) => {
        const angle = (idx / agents.length) * Math.PI * 2;
        const radius = 3;
        return (
          <TrainingAgent
            key={agent.id}
            agentId={agent.id}
            position={[Math.cos(angle) * radius, 0.5, Math.sin(angle) * radius]}
            reward={agent.reward}
          />
        );
      })}
      
      {/* Reward indicator */}
      <RewardIndicator episodeRewards={session.metrics?.episode_rewards} />
      
      <Text
        position={[0, 6, -6]}
        fontSize={0.4}
        color="white"
        anchorX="center"
      >
        Multi-Agent RL Training
      </Text>
      
      <Text
        position={[0, 5.5, -6]}
        fontSize={0.2}
        color="#00f5ff"
        anchorX="center"
      >
        Episode {session.current_episode}/{session.total_episodes}
      </Text>
      
      <OrbitControls
        enableZoom={true}
        minDistance={5}
        maxDistance={25}
      />
    </Canvas>
  );
}