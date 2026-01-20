import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function TeamMember({ member, position }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      const scale = 1 + member.performance_score * 0.3;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <dodecahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial
          color="#00f5ff"
          emissive="#00f5ff"
          emissiveIntensity={member.performance_score}
        />
      </mesh>
      <Text position={[0, -0.6, 0]} fontSize={0.1} color="white">
        {member.assigned_role}
      </Text>
      <Text position={[0, 0.6, 0]} fontSize={0.08} color="#44ff44">
        {(member.performance_score * 100).toFixed(0)}%
      </Text>
    </group>
  );
}

function CollaborationEdges({ graph, members }) {
  return (
    <>
      {graph?.map((edge, i) => {
        const memberAIndex = members?.findIndex(m => m.member_id === edge.member_a);
        const memberBIndex = members?.findIndex(m => m.member_id === edge.member_b);
        
        if (memberAIndex === -1 || memberBIndex === -1) return null;
        
        const angle1 = (memberAIndex / members.length) * Math.PI * 2;
        const angle2 = (memberBIndex / members.length) * Math.PI * 2;
        
        const points = [
          new THREE.Vector3(Math.cos(angle1) * 3, Math.sin(angle1) * 2, 0),
          new THREE.Vector3(Math.cos(angle2) * 3, Math.sin(angle2) * 2, 0)
        ];
        
        return (
          <Line
            key={i}
            points={points}
            color="#a855f7"
            lineWidth={edge.collaboration_strength * 5}
            opacity={edge.collaboration_strength}
            transparent
          />
        );
      })}
    </>
  );
}

function SynergyIndicator({ score }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += 0.02;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <mesh ref={meshRef}>
        <torusGeometry args={[1, 0.15, 16, 100]} />
        <meshStandardMaterial
          color="#44ff44"
          emissive="#44ff44"
          emissiveIntensity={score}
        />
      </mesh>
      <Text position={[0, 0, 0]} fontSize={0.4} color="#44ff44">
        {(score * 100).toFixed(0)}%
      </Text>
    </group>
  );
}

export default function DynamicTeam3D({ team }) {
  return (
    <div className="w-full h-[600px] bg-black/20 rounded-lg">
      <Canvas camera={{ position: [0, 2, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
        
        {team && (
          <>
            <Text position={[0, 4.5, 0]} fontSize={0.4} color="#00f5ff">
              {team.team_name}
            </Text>
            <Text position={[0, 3.8, 0]} fontSize={0.2} color="#ffffff">
              {team.formation_algorithm.replace('_', ' ').toUpperCase()}
            </Text>
            <Text position={[0, 3.3, 0]} fontSize={0.18} color={team.autonomously_formed ? '#a855f7' : '#ffffff'}>
              {team.autonomously_formed ? '🤖 Auto-Formed' : 'Manual Formation'}
            </Text>

            <SynergyIndicator score={team.team_synergy_score || 0.8} />
            <CollaborationEdges graph={team.collaboration_graph} members={team.team_members} />

            {team.team_members?.map((member, i) => {
              const angle = (i / team.team_members.length) * Math.PI * 2;
              return (
                <TeamMember
                  key={i}
                  member={member}
                  position={[Math.cos(angle) * 3, Math.sin(angle) * 2, 0]}
                />
              );
            })}

            <group position={[0, -3.5, 0]}>
              <Text fontSize={0.15} color="#44ff44">
                Completion Rate: {(team.performance_metrics?.task_completion_rate * 100).toFixed(0)}%
              </Text>
              <Text position={[0, -0.4, 0]} fontSize={0.12} color="#ffffff">
                Members: {team.team_members?.length} | Status: {team.team_status}
              </Text>
            </group>
          </>
        )}
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}