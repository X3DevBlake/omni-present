import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

function TeamCluster({ team, position }) {
  const groupRef = useRef();
  const memberCount = team.team_agents?.length || 0;
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  const memberPositions = Array.from({ length: memberCount }, (_, i) => {
    const angle = (i / memberCount) * Math.PI * 2;
    const r = 0.5;
    return [Math.cos(angle) * r, 0, Math.sin(angle) * r];
  });

  return (
    <group ref={groupRef} position={position}>
      <Sphere args={[0.4, 32, 32]}>
        <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.3} transparent opacity={0.7} />
      </Sphere>
      
      {memberPositions.map((pos, i) => (
        <Sphere key={i} position={pos} args={[0.1, 16, 16]}>
          <meshStandardMaterial color="#3b82f6" />
        </Sphere>
      ))}
      
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.12}
        color="white"
        anchorX="center"
      >
        {team.name?.substring(0, 20)}
      </Text>
      <Text
        position={[0, -1, 0]}
        fontSize={0.1}
        color="#94a3b8"
        anchorX="center"
      >
        {memberCount} agents
      </Text>
    </group>
  );
}

export default function SubTeamVisualizer3D({ teams = [] }) {
  const positions = teams.map((_, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    return [col * 2.5 - 2.5, row * 2 - 2, 0];
  });

  return (
    <Canvas camera={{ position: [0, 2, 6], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
      
      {teams.map((team, i) => (
        <TeamCluster
          key={team.id}
          team={team}
          position={positions[i]}
        />
      ))}
      
      <OrbitControls enablePan={false} />
    </Canvas>
  );
}