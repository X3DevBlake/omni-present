import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Cylinder, Text } from '@react-three/drei';

function DecisionNode({ position, label, depth }) {
  const colors = ['#00f5ff', '#a855f7', '#10b981', '#f59e0b'];
  return (
    <group position={position}>
      <Sphere args={[0.3, 16, 16]}>
        <meshStandardMaterial 
          color={colors[depth]} 
          emissive={colors[depth]} 
          emissiveIntensity={0.4} 
        />
      </Sphere>
      <Text position={[0, 0.5, 0]} fontSize={0.2} color="white">
        {label}
      </Text>
    </group>
  );
}

export default function AgentDecisionTree3D() {
  const decisions = [
    { pos: [0, 2, 0], label: 'Goal', depth: 0 },
    { pos: [-2, 0, 0], label: 'Option A', depth: 1 },
    { pos: [2, 0, 0], label: 'Option B', depth: 1 },
    { pos: [-3, -2, 0], label: 'A1', depth: 2 },
    { pos: [-1, -2, 0], label: 'A2', depth: 2 },
    { pos: [1, -2, 0], label: 'B1', depth: 2 },
    { pos: [3, -2, 0], label: 'B2', depth: 2 },
  ];

  return (
    <div className="bg-black/40 rounded-xl border border-white/10 h-96 overflow-hidden">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />

        {decisions.map((dec, i) => (
          <DecisionNode key={i} position={dec.pos} label={dec.label} depth={dec.depth} />
        ))}

        <OrbitControls enableZoom autoRotate autoRotateSpeed={0.3} />
      </Canvas>
    </div>
  );
}