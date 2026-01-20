import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function SkillNode({ position, skill, verified, proficiency, onClick }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  const color = verified ? '#10b981' : proficiency > 70 ? '#3b82f6' : '#6b7280';
  const scale = 0.5 + (proficiency / 100) * 0.5;

  return (
    <group position={position} onClick={onClick}>
      <Sphere ref={meshRef} args={[scale, 32, 32]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </Sphere>
      <Text
        position={[0, scale + 0.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {skill.skill_name}
      </Text>
      <Text
        position={[0, scale + 0.9, 0]}
        fontSize={0.2}
        color={verified ? '#10b981' : '#9ca3af'}
        anchorX="center"
        anchorY="middle"
      >
        {proficiency.toFixed(0)}% {verified ? '✓' : ''}
      </Text>
    </group>
  );
}

export default function SpecializationTreeVisualizer3D({ specializations, verifications, onSkillClick }) {
  const connections = useMemo(() => {
    const lines = [];
    specializations?.forEach((spec, i) => {
      if (i < specializations.length - 1) {
        const angle1 = (i / specializations.length) * Math.PI * 2;
        const angle2 = ((i + 1) / specializations.length) * Math.PI * 2;
        const radius = 5;
        lines.push([
          [Math.cos(angle1) * radius, 0, Math.sin(angle1) * radius],
          [Math.cos(angle2) * radius, 0, Math.sin(angle2) * radius]
        ]);
      }
    });
    return lines;
  }, [specializations]);

  return (
    <Canvas camera={{ position: [0, 5, 15], fov: 50 }} style={{ height: '600px' }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      {/* Central core */}
      <Sphere args={[1, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.5} />
      </Sphere>
      <Text position={[0, 1.5, 0]} fontSize={0.5} color="white">
        Agent Skills
      </Text>

      {/* Skill nodes in a circle */}
      {specializations?.map((spec, i) => {
        const angle = (i / specializations.length) * Math.PI * 2;
        const radius = 5;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = (spec.proficiency_level - 50) / 20;

        const verified = verifications?.some(v => 
          v.specialization_id === spec.id && v.status === 'verified'
        );

        return (
          <SkillNode
            key={spec.id}
            position={[x, y, z]}
            skill={spec}
            verified={verified}
            proficiency={spec.proficiency_level || 0}
            onClick={() => onSkillClick?.(spec)}
          />
        );
      })}

      {/* Connection lines */}
      {connections.map((points, i) => (
        <Line
          key={i}
          points={points}
          color="#6366f1"
          lineWidth={1}
          opacity={0.3}
          transparent
        />
      ))}

      <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  );
}