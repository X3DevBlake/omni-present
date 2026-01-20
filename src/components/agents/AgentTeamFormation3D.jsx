import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line, Html } from '@react-three/drei';
import * as THREE from 'three';

function TeamMemberNode({ member, position, teamColor, onSelect }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.15;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  const getRoleSize = () => {
    switch (member.role) {
      case 'leader': return 0.5;
      case 'specialist': return 0.35;
      case 'coordinator': return 0.4;
      default: return 0.3;
    }
  };

  const getRoleColor = () => {
    switch (member.role) {
      case 'leader': return '#ffaa00';
      case 'specialist': return '#00f5ff';
      case 'coordinator': return '#a855f7';
      default: return '#44ff44';
    }
  };

  return (
    <group position={position}>
      <Sphere
        ref={meshRef}
        args={[getRoleSize(), 32, 32]}
        onClick={() => onSelect?.(member)}
      >
        <meshStandardMaterial
          color={getRoleColor()}
          emissive={getRoleColor()}
          emissiveIntensity={0.8}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>

      <Html position={[0, 0.8, 0]} center>
        <div className="text-white text-xs font-medium bg-black/70 px-2 py-1 rounded whitespace-nowrap">
          {member.agent_name}
        </div>
      </Html>

      <Text position={[0, -0.7, 0]} fontSize={0.12} color={getRoleColor()}>
        {member.role}
      </Text>

      <Text position={[0, -1, 0]} fontSize={0.1} color="white">
        Score: {member.contribution_score?.toFixed(2)}
      </Text>
    </group>
  );
}

function CommunicationBeam({ from, to, sentiment, emotion }) {
  const lineRef = useRef();
  
  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.material.opacity = 0.4 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
    }
  });

  const getColor = () => {
    if (emotion === 'positive' || emotion === 'collaborative') return '#44ff44';
    if (emotion === 'negative' || emotion === 'competitive') return '#ff4444';
    return '#00f5ff';
  };

  return (
    <Line
      ref={lineRef}
      points={[new THREE.Vector3(...from), new THREE.Vector3(...to)]}
      color={getColor()}
      lineWidth={2 + sentiment * 2}
      transparent
      opacity={0.6}
    />
  );
}

function TeamCore({ teamName, healthScore }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.015;
    }
  });

  const getHealthColor = () => {
    if (healthScore > 0.8) return '#44ff44';
    if (healthScore > 0.6) return '#00f5ff';
    if (healthScore > 0.4) return '#ffaa00';
    return '#ff4444';
  };

  return (
    <group>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[0.8, 1]} />
        <meshStandardMaterial
          color={getHealthColor()}
          emissive={getHealthColor()}
          emissiveIntensity={0.8}
          wireframe
        />
      </mesh>
      <Text position={[0, 0, 0]} fontSize={0.2} color="white">
        {(healthScore * 100).toFixed(0)}%
      </Text>
    </group>
  );
}

export default function AgentTeamFormation3D({ teamData, onMemberSelect }) {
  if (!teamData || !teamData.members) return null;

  const memberPositions = teamData.members.map((member, i) => {
    const angle = (i / teamData.members.length) * Math.PI * 2;
    const radius = 3;
    return {
      member,
      position: [
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        (Math.random() - 0.5) * 1
      ]
    };
  });

  return (
    <div className="w-full h-[600px] bg-black/20 rounded-xl overflow-hidden">
      <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#a855f7" />
        
        <Text position={[0, 5, 0]} fontSize={0.5} color="#00f5ff">
          {teamData.team_name}
        </Text>

        <TeamCore teamName={teamData.team_name} healthScore={teamData.health_score || 0.75} />

        {memberPositions.map((item, i) => (
          <TeamMemberNode
            key={i}
            member={item.member}
            position={item.position}
            teamColor="#00f5ff"
            onSelect={onMemberSelect}
          />
        ))}

        {teamData.communication_flow?.map((comm, i) => {
          const fromPos = memberPositions.find(mp => mp.member.agent_id === comm.from)?.position;
          const toPos = memberPositions.find(mp => mp.member.agent_id === comm.to)?.position;
          
          if (!fromPos || !toPos) return null;
          
          return (
            <CommunicationBeam
              key={i}
              from={fromPos}
              to={toPos}
              sentiment={comm.sentiment}
              emotion={comm.emotion}
            />
          );
        })}

        <Text position={[0, -5, 0]} fontSize={0.25} color="white">
          {teamData.members?.length} Members • {teamData.communication_flow?.length || 0} Interactions
        </Text>
        
        <OrbitControls enableDamping dampingFactor={0.05} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}