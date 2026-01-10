import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';

function BehaviorNode({ position, label, color, connections = [] }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[1, 0.5, 0.2]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      <Text position={[0, 0, 0.2]} fontSize={0.15} color="white">
        {label}
      </Text>
    </group>
  );
}

export default function Interactive3DAgentBehaviorTree() {
  const nodes = [
    { position: [0, 2, 0], label: 'Root', color: '#00f5ff', connections: [[0, 1, 0], [0, 0.5, 0]] },
    { position: [-2, 0, 0], label: 'Selector', color: '#a855f7' },
    { position: [2, 0, 0], label: 'Sequence', color: '#10b981' },
    { position: [-3, -2, 0], label: 'Action A', color: '#f59e0b' },
    { position: [-1, -2, 0], label: 'Action B', color: '#f59e0b' },
    { position: [1, -2, 0], label: 'Condition', color: '#ec4899' },
    { position: [3, -2, 0], label: 'Action C', color: '#f59e0b' },
  ];

  const connections = [
    [[0, 2, 0], [-2, 0, 0]],
    [[0, 2, 0], [2, 0, 0]],
    [[-2, 0, 0], [-3, -2, 0]],
    [[-2, 0, 0], [-1, -2, 0]],
    [[2, 0, 0], [1, -2, 0]],
    [[2, 0, 0], [3, -2, 0]],
  ];

  return (
    <div className="bg-black/40 rounded-xl border border-white/10 h-96 overflow-hidden">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />

        {connections.map((conn, i) => (
          <Line
            key={i}
            points={conn}
            color="#00f5ff"
            lineWidth={2}
            opacity={0.5}
            transparent
          />
        ))}

        {nodes.map((node, i) => (
          <BehaviorNode key={i} {...node} />
        ))}

        <OrbitControls enableZoom autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}