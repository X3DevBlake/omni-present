import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';

function AgentNode({ position, index, role }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  const colors = ['#10b981', '#3b82f6', '#a855f7', '#f59e0b', '#ec4899'];
  const color = colors[index % colors.length];

  return (
    <Sphere ref={meshRef} args={[0.5, 32, 32]} position={position}>
      <meshStandardMaterial 
        color={color}
        emissive={color}
        emissiveIntensity={0.6}
      />
    </Sphere>
  );
}

export default function MultiAgent3D({ system }) {
  const numAgents = system?.num_agents || 5;

  const agents = Array.from({ length: numAgents }, (_, i) => {
    const angle = (i / numAgents) * Math.PI * 2;
    const radius = 4;
    return {
      position: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius],
      index: i,
      role: system?.agent_roles?.[i]?.role || `Agent ${i + 1}`
    };
  });

  return (
    <Canvas camera={{ position: [0, 6, 12], fov: 60 }} style={{ height: '700px' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[15, 15, 15]} intensity={1.5} />
      <pointLight position={[-15, 5, -15]} intensity={0.8} color="#10b981" />

      <Sphere args={[0.8, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={0.7}
        />
      </Sphere>

      {agents.map((agent, i) => (
        <AgentNode key={i} {...agent} />
      ))}

      {agents.map((agent, i) => (
        <Line
          key={`line-${i}`}
          points={[[0, 0, 0], agent.position]}
          color="#6b7280"
          lineWidth={1}
          transparent
          opacity={0.3}
        />
      ))}

      <Text position={[0, 4, 0]} fontSize={0.6} color="white" anchorX="center">
        Multi-Agent System
      </Text>
      <Text position={[0, 3.3, 0]} fontSize={0.3} color="#fbbf24" anchorX="center">
        {system?.system_name || 'Collaborative AI'}
      </Text>
      <Text position={[0, 2.8, 0]} fontSize={0.25} color="#10b981" anchorX="center">
        {numAgents} agents • {system?.coordination_protocol || 'decentralized'}
      </Text>

      <group position={[0, -3.5, 0]}>
        <Text fontSize={0.35} color="#10b981" anchorX="center">
          Efficiency: {((system?.system_performance?.collaboration_efficiency || 0.87) * 100).toFixed(0)}%
        </Text>
        <Text position={[0, -0.6, 0]} fontSize={0.3} color="#60a5fa" anchorX="center">
          Completion: {((system?.system_performance?.task_completion_rate || 0.93) * 100).toFixed(0)}%
        </Text>
        <Text position={[0, -1.2, 0]} fontSize={0.25} color="#fbbf24" anchorX="center">
          Emergent: {system?.emergent_behaviors?.length || 0} behaviors
        </Text>
      </group>

      <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.4} minDistance={8} maxDistance={20} />
    </Canvas>
  );
}