import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

function MessageParticle({ from, to, color = "#00f5ff" }) {
  const meshRef = useRef();
  const progressRef = useRef(0);
  
  useFrame(() => {
    progressRef.current += 0.02;
    if (progressRef.current > 1) {
      progressRef.current = 0;
    }
    
    if (meshRef.current) {
      const t = progressRef.current;
      meshRef.current.position.lerp(
        new THREE.Vector3(
          from[0] + (to[0] - from[0]) * t,
          from[1] + (to[1] - from[1]) * t + Math.sin(t * Math.PI) * 0.5,
          from[2] + (to[2] - from[2]) * t
        ),
        1
      );
    }
  });
  
  return (
    <Sphere ref={meshRef} args={[0.05, 8, 8]}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.8}
      />
    </Sphere>
  );
}

export default function CommunicationFlow3D({ team, messages = [] }) {
  const memberPositions = React.useMemo(() => {
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
        <p>No team communication data</p>
      </div>
    );
  }
  
  return (
    <Canvas camera={{ position: [0, 6, 10], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#a855f7" />
      
      {/* Team member nodes */}
      {team.team_members?.map((member, idx) => (
        <group key={idx} position={memberPositions[idx]}>
          <Sphere args={[0.3, 32, 32]}>
            <meshStandardMaterial
              color="#6366f1"
              emissive="#6366f1"
              emissiveIntensity={0.4}
            />
          </Sphere>
          
          <Text
            position={[0, 0.6, 0]}
            fontSize={0.12}
            color="white"
            anchorX="center"
          >
            {member.role}
          </Text>
        </group>
      ))}
      
      {/* Communication lines */}
      {memberPositions.map((pos1, idx1) => 
        memberPositions.slice(idx1 + 1).map((pos2, idx2) => (
          <Line
            key={`${idx1}-${idx2}`}
            points={[pos1, pos2]}
            color="#00f5ff"
            lineWidth={1}
            transparent
            opacity={0.2}
          />
        ))
      )}
      
      {/* Message particles */}
      {memberPositions.length > 1 && [...Array(5)].map((_, idx) => {
        const fromIdx = Math.floor(Math.random() * memberPositions.length);
        let toIdx = Math.floor(Math.random() * memberPositions.length);
        while (toIdx === fromIdx) {
          toIdx = Math.floor(Math.random() * memberPositions.length);
        }
        
        return (
          <MessageParticle
            key={idx}
            from={memberPositions[fromIdx]}
            to={memberPositions[toIdx]}
          />
        );
      })}
      
      <Text
        position={[0, 4, -4]}
        fontSize={0.5}
        color="white"
        anchorX="center"
      >
        Communication Flow
      </Text>
      
      <Text
        position={[0, 3.3, -4]}
        fontSize={0.2}
        color="#00f5ff"
        anchorX="center"
      >
        Protocol: {team.communication_protocol}
      </Text>
      
      <OrbitControls
        enableZoom={true}
        minDistance={3}
        maxDistance={20}
        autoRotate
        autoRotateSpeed={1}
      />
    </Canvas>
  );
}