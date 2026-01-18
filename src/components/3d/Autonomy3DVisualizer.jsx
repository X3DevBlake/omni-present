import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';

function AgentNode({ position, agent, onClick }) {
  const meshRef = useRef();
  const autonomyColor = new THREE.Color(
    agent.autonomy_level > 75 ? '#ef4444' :
    agent.autonomy_level > 50 ? '#f59e0b' : '#10b981'
  );

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
    }
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[agent.autonomy_level / 40, 32, 32]} onClick={onClick}>
        <meshStandardMaterial color={autonomyColor} emissive={autonomyColor} emissiveIntensity={0.5} />
      </Sphere>
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {agent.name}
      </Text>
      <Text
        position={[0, -2, 0]}
        fontSize={0.2}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        {agent.autonomy_level}%
      </Text>
    </group>
  );
}

function AutonomyParticles() {
  const particlesRef = useRef();
  const particleCount = 100;
  
  const positions = React.useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, []);

  useFrame(() => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.001;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#3b82f6" transparent opacity={0.6} />
    </points>
  );
}

export default function Autonomy3DVisualizer({ agents = [] }) {
  const radius = 5;
  
  const agentPositions = agents.map((agent, i) => {
    const angle = (i / agents.length) * Math.PI * 2;
    return [
      Math.cos(angle) * radius,
      (agent.autonomy_level / 100) * 3 - 1.5,
      Math.sin(angle) * radius
    ];
  });

  return (
    <Canvas camera={{ position: [0, 5, 12], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
      
      <AutonomyParticles />
      
      {agents.map((agent, i) => (
        <AgentNode
          key={agent.id}
          position={agentPositions[i]}
          agent={agent}
        />
      ))}
      
      <OrbitControls enablePan={false} minDistance={5} maxDistance={20} />
    </Canvas>
  );
}