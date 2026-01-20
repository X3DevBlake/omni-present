import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

function EvolvingAgent({ agent, position }) {
  const agentRef = useRef();
  const trailRef = useRef([]);

  useFrame((state) => {
    if (agentRef.current) {
      // Simulate movement
      const speed = 0.02;
      const direction = new THREE.Vector3(
        Math.sin(state.clock.elapsedTime * 0.5 + position[0]),
        0,
        Math.cos(state.clock.elapsedTime * 0.5 + position[2])
      ).normalize();

      agentRef.current.position.x += direction.x * speed;
      agentRef.current.position.z += direction.z * speed;

      // Keep within bounds
      const bounds = 5;
      if (Math.abs(agentRef.current.position.x) > bounds) {
        agentRef.current.position.x *= 0.9;
      }
      if (Math.abs(agentRef.current.position.z) > bounds) {
        agentRef.current.position.z *= 0.9;
      }

      agentRef.current.rotation.y += 0.02;
    }
  });

  const behaviorColor = agent.behavior_profile?.primary_behavior === 'cooperative' ? '#10b981' :
                        agent.behavior_profile?.primary_behavior === 'competitive' ? '#ef4444' :
                        agent.behavior_profile?.primary_behavior === 'exploratory' ? '#22d3ee' : '#8b5cf6';

  return (
    <group ref={agentRef} position={position}>
      <Sphere args={[0.2, 16, 16]}>
        <meshStandardMaterial
          color={behaviorColor}
          emissive={behaviorColor}
          emissiveIntensity={0.5}
          metalness={0.6}
          roughness={0.4}
        />
      </Sphere>
      
      {/* Direction Indicator */}
      <mesh position={[0, 0, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.1, 0.2, 8]} />
        <meshStandardMaterial color={behaviorColor} />
      </mesh>
    </group>
  );
}

function EnvironmentTerrain() {
  const terrainRef = useRef();

  useFrame((state) => {
    if (terrainRef.current) {
      // Subtle movement for dynamic feel
      terrainRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <group ref={terrainRef}>
      {/* Base Terrain */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[12, 0.2, 12]} />
        <meshStandardMaterial color="#1e293b" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Terrain Features */}
      {[...Array(15)].map((_, i) => {
        const x = (Math.random() - 0.5) * 10;
        const z = (Math.random() - 0.5) * 10;
        const height = Math.random() * 0.8;
        return (
          <RoundedBox
            key={i}
            args={[0.5, height, 0.5]}
            position={[x, height / 2 - 0.5, z]}
            radius={0.05}
          >
            <meshStandardMaterial color="#334155" metalness={0.4} roughness={0.6} />
          </RoundedBox>
        );
      })}
    </group>
  );
}

function EmergentBehaviorIndicator({ position, behavior }) {
  const indicatorRef = useRef();

  useFrame((state) => {
    if (indicatorRef.current) {
      indicatorRef.current.rotation.y += 0.03;
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.1;
      indicatorRef.current.scale.set(1 + pulse, 1 + pulse, 1 + pulse);
    }
  });

  return (
    <group position={position}>
      <Sphere ref={indicatorRef} args={[0.15, 16, 16]}>
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.6} />
      </Sphere>
      <Text position={[0, 0.4, 0]} fontSize={0.12} color="#fbbf24" anchorX="center">
        Emergent
      </Text>
    </group>
  );
}

export default function AIWorldEvolution3D({ agents, simulations, scenarios }) {
  const activeAgents = agents.filter(a => a.status === 'active');

  return (
    <Canvas camera={{ position: [0, 8, 12], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[0, 5, 0]} intensity={0.8} color="#8b5cf6" />

      <EnvironmentTerrain />

      {/* Evolving Agents */}
      {activeAgents.slice(0, 20).map((agent, idx) => {
        const angle = (idx / 20) * Math.PI * 2;
        const radius = 3;
        return (
          <EvolvingAgent
            key={agent.id}
            agent={agent}
            position={[
              Math.cos(angle) * radius,
              0,
              Math.sin(angle) * radius
            ]}
          />
        );
      })}

      {/* Emergent Behavior Indicators */}
      {[...Array(5)].map((_, i) => (
        <EmergentBehaviorIndicator
          key={i}
          position={[
            (Math.random() - 0.5) * 8,
            0.5,
            (Math.random() - 0.5) * 8
          ]}
          behavior="cooperative"
        />
      ))}

      {/* Title */}
      <Text
        position={[0, 4, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
      >
        AI World Evolution
      </Text>

      <Text
        position={[0, 3.4, 0]}
        fontSize={0.2}
        color="#94a3b8"
        anchorX="center"
      >
        {activeAgents.length} Active Agents
      </Text>

      <OrbitControls
        enableZoom={true}
        minDistance={8}
        maxDistance={25}
      />
    </Canvas>
  );
}