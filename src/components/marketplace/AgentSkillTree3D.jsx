import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function SkillNode({ skill, position, level }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      
      // Pulsing based on proficiency
      const pulseIntensity = skill.proficiency_level / 100;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1 * pulseIntensity;
      meshRef.current.scale.setScalar(scale);
    }
  });
  
  // Size based on proficiency
  const size = 0.2 + (skill.proficiency_level / 100) * 0.3;
  
  // Color based on category
  const categoryColors = {
    technical: '#00f5ff',
    communication: '#a855f7',
    analytical: '#ec4899',
    creative: '#fbbf24',
    leadership: '#10b981'
  };
  
  const color = categoryColors[skill.skill_category] || '#ffffff';
  
  // Glow intensity based on market demand
  const glowIntensity = (skill.market_demand || 50) / 100;
  
  return (
    <group position={position}>
      <Sphere
        ref={meshRef}
        args={[size, 32, 32]}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={glowIntensity}
          metalness={0.5}
          roughness={0.3}
        />
      </Sphere>
      
      {/* Skill name */}
      <Text
        position={[0, size + 0.4, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {skill.skill_name}
      </Text>
      
      {/* Proficiency */}
      <Text
        position={[0, -size - 0.3, 0]}
        fontSize={0.12}
        color="#ffd700"
        anchorX="center"
        anchorY="middle"
      >
        {skill.proficiency_level}%
      </Text>
      
      {/* Verified badge */}
      {skill.verified && (
        <Sphere args={[0.08, 16, 16]} position={[size * 0.8, size * 0.8, 0]}>
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.8} />
        </Sphere>
      )}
    </group>
  );
}

function SkillBranches({ skills }) {
  // Group skills by category to create branches
  const categories = [...new Set(skills.map(s => s.skill_category))];
  
  return categories.map((category, catIdx) => {
    const categorySkills = skills.filter(s => s.skill_category === category);
    const angle = (catIdx / categories.length) * Math.PI * 2;
    const baseRadius = 3;
    
    return categorySkills.map((skill, skillIdx) => {
      const radius = baseRadius + skillIdx * 1.5;
      const pos = [
        Math.cos(angle) * radius,
        skillIdx * 1.2,
        Math.sin(angle) * radius
      ];
      
      // Line from center to skill
      const centerPos = [0, 0, 0];
      
      return (
        <React.Fragment key={skill.skill_name}>
          <Line
            points={[centerPos, pos]}
            color="#00f5ff"
            lineWidth={2}
            opacity={0.4}
            transparent
          />
          <SkillNode
            skill={skill}
            position={pos}
            level={skillIdx}
          />
        </React.Fragment>
      );
    });
  });
}

export default function AgentSkillTree3D({ skills }) {
  if (!skills || skills.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white">
        <p>No skills data available</p>
      </div>
    );
  }
  
  return (
    <Canvas camera={{ position: [0, 5, 12], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#a855f7" />
      
      {/* Central trunk */}
      <group>
        <Line
          points={[[0, -2, 0], [0, 2, 0]]}
          color="#8b4513"
          lineWidth={5}
        />
        
        {/* Root sphere */}
        <Sphere args={[0.4, 32, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#6366f1"
            emissive="#6366f1"
            emissiveIntensity={0.3}
          />
        </Sphere>
      </group>
      
      {/* Skill branches */}
      <SkillBranches skills={skills} />
      
      <OrbitControls
        enableZoom={true}
        minDistance={5}
        maxDistance={25}
        autoRotate
        autoRotateSpeed={0.3}
      />
    </Canvas>
  );
}