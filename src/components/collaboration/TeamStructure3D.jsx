import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

function TeamMemberNode({ member, position, index, totalMembers }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      meshRef.current.position.y = position[1] + Math.sin(time + index) * 0.1;
      meshRef.current.rotation.y += 0.02;
    }
  });
  
  const size = 0.2 + (member.contribution_percentage / 100) * 0.3;
  
  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[size, 32, 32]}>
        <meshStandardMaterial
          color="#00f5ff"
          emissive="#00f5ff"
          emissiveIntensity={0.4}
          metalness={0.6}
          roughness={0.3}
        />
      </Sphere>
      
      <Text
        position={[0, size + 0.5, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
      >
        {member.role}
      </Text>
      
      <Text
        position={[0, -size - 0.3, 0]}
        fontSize={0.1}
        color="#fbbf24"
        anchorX="center"
      >
        {member.contribution_percentage?.toFixed(0)}% workload
      </Text>
      
      {member.skills_brought?.slice(0, 3).map((skill, idx) => (
        <Text
          key={idx}
          position={[0, -size - 0.5 - idx * 0.15, 0]}
          fontSize={0.08}
          color="#a855f7"
          anchorX="center"
        >
          • {skill}
        </Text>
      ))}
    </group>
  );
}

export default function TeamStructure3D({ team }) {
  const positions = React.useMemo(() => {
    if (!team?.team_members) return [];
    
    return team.team_members.map((_, idx) => {
      const angle = (idx / team.team_members.length) * Math.PI * 2;
      const radius = 3;
      
      return [
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      ];
    });
  }, [team]);
  
  if (!team) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white">
        <p>No team data available</p>
      </div>
    );
  }
  
  return (
    <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#00f5ff" />
      
      {/* Central objective sphere */}
      <Sphere args={[0.5, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#a855f7"
          emissive="#a855f7"
          emissiveIntensity={0.5}
          wireframe
        />
      </Sphere>
      
      <Text
        position={[0, 0, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        maxWidth={1.5}
      >
        {team.task_objective?.substring(0, 30)}
      </Text>
      
      {/* Team members */}
      {team.team_members?.map((member, idx) => (
        <React.Fragment key={idx}>
          <TeamMemberNode
            member={member}
            position={positions[idx]}
            index={idx}
            totalMembers={team.team_members.length}
          />
          
          {/* Connection to center */}
          <Line
            points={[[0, 0, 0], positions[idx]]}
            color="#00f5ff"
            lineWidth={2}
            transparent
            opacity={0.4}
          />
        </React.Fragment>
      ))}
      
      <Text
        position={[0, 4, -5]}
        fontSize={0.5}
        color="white"
        anchorX="center"
      >
        Team Structure
      </Text>
      
      <Text
        position={[0, 3.3, -5]}
        fontSize={0.2}
        color="#10b981"
        anchorX="center"
      >
        Synergy: {team.team_synergy_score?.toFixed(0)}%
      </Text>
      
      <OrbitControls
        enableZoom={true}
        minDistance={3}
        maxDistance={20}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
}