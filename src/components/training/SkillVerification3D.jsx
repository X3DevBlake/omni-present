import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { motion } from 'framer-motion';

function SkillNode({ position, skill, verified }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.3, 32, 32]}>
        <meshStandardMaterial 
          color={verified ? '#10b981' : '#ef4444'} 
          emissive={verified ? '#10b981' : '#ef4444'}
          emissiveIntensity={0.3}
        />
      </Sphere>
      <Text
        position={[0, -0.6, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {skill.skill_name}
      </Text>
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.1}
        color={verified ? '#10b981' : '#fbbf24'}
        anchorX="center"
        anchorY="middle"
      >
        {skill.proficiency_level}% | {skill.status}
      </Text>
    </group>
  );
}

export default function SkillVerification3D({ verifications = [] }) {
  const verifiedSkills = verifications.filter(v => v.status === 'verified');
  const pendingSkills = verifications.filter(v => v.status === 'pending');

  return (
    <div className="w-full h-[500px] bg-black/20 rounded-xl overflow-hidden">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />

        {/* Verified skills ring */}
        {verifiedSkills.map((skill, i) => {
          const angle = (i / verifiedSkills.length) * Math.PI * 2;
          const radius = 2;
          return (
            <SkillNode
              key={skill.id}
              position={[
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                0
              ]}
              skill={skill}
              verified={true}
            />
          );
        })}

        {/* Pending skills ring */}
        {pendingSkills.map((skill, i) => {
          const angle = (i / pendingSkills.length) * Math.PI * 2;
          const radius = 3.5;
          return (
            <SkillNode
              key={skill.id}
              position={[
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                0
              ]}
              skill={skill}
              verified={false}
            />
          );
        })}

        {/* Center verification badge */}
        <Sphere args={[0.5, 32, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.5} />
        </Sphere>
        <Text position={[0, 0, 0.6]} fontSize={0.2} color="white">
          {verifiedSkills.length}/{verifications.length}
        </Text>
        <Text position={[0, 0, 0.4]} fontSize={0.1} color="#a855f7">
          Verified
        </Text>

        <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.5} />
      </Canvas>

      <div className="absolute bottom-4 left-4 bg-black/60 p-3 rounded-lg backdrop-blur-sm">
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-green-400">Verified: {verifiedSkills.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-red-400">Pending: {pendingSkills.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}