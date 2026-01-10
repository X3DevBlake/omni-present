import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Cylinder, Text } from '@react-three/drei';

function SkillNode({ position, label, unlocked }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current && unlocked) {
      meshRef.current.rotation.y = state.clock.elapsedTime;
    }
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.3, 16, 16]}>
        <meshStandardMaterial 
          color={unlocked ? '#10b981' : '#4b5563'} 
          emissive={unlocked ? '#10b981' : '#000000'}
          emissiveIntensity={unlocked ? 0.5 : 0}
        />
      </Sphere>
      <Text position={[0, 0.5, 0]} fontSize={0.2} color={unlocked ? '#10b981' : '#9ca3af'}>
        {label}
      </Text>
    </group>
  );
}

function SkillConnection({ start, end, active }) {
  return (
    <Cylinder
      position={[
        (start[0] + end[0]) / 2,
        (start[1] + end[1]) / 2,
        (start[2] + end[2]) / 2
      ]}
      args={[0.05, 0.05, Math.sqrt(
        Math.pow(end[0] - start[0], 2) +
        Math.pow(end[1] - start[1], 2) +
        Math.pow(end[2] - start[2], 2)
      ), 8]}
      rotation={[
        Math.PI / 2,
        0,
        Math.atan2(end[2] - start[2], end[0] - start[0])
      ]}
    >
      <meshStandardMaterial 
        color={active ? '#00f5ff' : '#4b5563'}
        emissive={active ? '#00f5ff' : '#000000'}
        emissiveIntensity={active ? 0.3 : 0}
      />
    </Cylinder>
  );
}

export default function SkillProgression3DTree() {
  const skills = [
    { position: [0, 2, 0], label: 'Foundation', unlocked: true },
    { position: [-1.5, 0, 0], label: 'Analysis', unlocked: true },
    { position: [1.5, 0, 0], label: 'Social', unlocked: true },
    { position: [-2, -2, 0], label: 'Data', unlocked: false },
    { position: [-1, -2, 0], label: 'Pattern', unlocked: false },
    { position: [1, -2, 0], label: 'Comm', unlocked: false },
    { position: [2, -2, 0], label: 'Lead', unlocked: false },
  ];

  const connections = [
    { start: [0, 2, 0], end: [-1.5, 0, 0], active: true },
    { start: [0, 2, 0], end: [1.5, 0, 0], active: true },
    { start: [-1.5, 0, 0], end: [-2, -2, 0], active: false },
    { start: [-1.5, 0, 0], end: [-1, -2, 0], active: false },
    { start: [1.5, 0, 0], end: [1, -2, 0], active: false },
    { start: [1.5, 0, 0], end: [2, -2, 0], active: false },
  ];

  return (
    <div className="bg-black/40 rounded-xl border border-white/10 h-96 overflow-hidden">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />

        {connections.map((conn, i) => (
          <SkillConnection key={i} {...conn} />
        ))}

        {skills.map((skill, i) => (
          <SkillNode key={i} {...skill} />
        ))}

        <OrbitControls enableZoom autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}