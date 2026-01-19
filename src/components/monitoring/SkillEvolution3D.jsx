import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Text, Line } from '@react-three/drei';

function SkillBar({ skill, position, index }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  const level = skill.proficiency_level || 50;
  const height = (level / 100) * 3;
  const color = skill.growth_rate > 0 ? '#00ff88' : '#ffaa00';

  return (
    <group position={position}>
      <Box ref={meshRef} args={[0.6, height, 0.6]} position={[0, height / 2, 0]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
        />
      </Box>

      <Text
        position={[0, height + 0.8, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
      >
        {skill.skill_name}
      </Text>

      <Text
        position={[0, -0.5, 0]}
        fontSize={0.12}
        color={color}
        anchorX="center"
      >
        {level.toFixed(0)}
      </Text>
    </group>
  );
}

export default function SkillEvolution3D({ metrics = [] }) {
  const allSkills = [];
  
  metrics.forEach(metric => {
    if (metric.skill_evolution) {
      metric.skill_evolution.forEach(skill => {
        allSkills.push({
          ...skill,
          agent_id: metric.agent_id
        });
      });
    }
  });

  const gridSize = Math.ceil(Math.sqrt(allSkills.length));
  
  const positions = allSkills.map((_, index) => {
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    return [
      (col - gridSize / 2) * 2,
      0,
      (row - gridSize / 2) * 2,
    ];
  });

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden bg-black/20">
      <Canvas camera={{ position: [10, 8, 10], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, 10, -10]} intensity={0.8} color="#00ff88" />

        {allSkills.map((skill, index) => (
          <SkillBar
            key={index}
            skill={skill}
            position={positions[index]}
            index={index}
          />
        ))}

        <OrbitControls enableZoom={true} />
        <gridHelper args={[20, 20, '#ffffff20', '#ffffff10']} />
      </Canvas>

      {allSkills.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white/60">No skill data available</p>
        </div>
      )}
    </div>
  );
}