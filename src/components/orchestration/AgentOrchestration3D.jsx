import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';

function OrchestratedAgent({ position, agent, index }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  const colors = ['#10b981', '#3b82f6', '#a855f7', '#f59e0b', '#ec4899'];
  const color = colors[index % colors.length];
  const size = 0.3 + (agent.workload || 0.5) * 0.5;

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[size, 32, 32]}>
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.7}
        />
      </Sphere>
      <Text position={[0, size + 0.6, 0]} fontSize={0.2} color="white" anchorX="center">
        {agent.role}
      </Text>
    </group>
  );
}

export default function AgentOrchestration3D({ orchestration }) {
  const agents = orchestration?.participating_agents || [];
  const collaborations = orchestration?.collaboration_graph || [];

  const agentNodes = agents.map((agent, i) => {
    const angle = (i / agents.length) * Math.PI * 2;
    const radius = 4;
    return {
      position: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius],
      agent,
      index: i
    };
  });

  return (
    <Canvas camera={{ position: [0, 6, 12], fov: 60 }} style={{ height: '600px' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[15, 15, 15]} intensity={1.5} />
      <pointLight position={[-15, 5, -15]} intensity={0.8} color="#10b981" />

      <Sphere args={[1, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={0.8}
        />
      </Sphere>

      <Text position={[0, 3.5, 0]} fontSize={0.5} color="white" anchorX="center">
        Agent Orchestration
      </Text>

      {agentNodes.map((node, i) => (
        <React.Fragment key={i}>
          <OrchestratedAgent {...node} />
          <Line
            points={[[0, 0, 0], node.position]}
            color="#6b7280"
            lineWidth={1}
            transparent
            opacity={0.3}
          />
        </React.Fragment>
      ))}

      <group position={[0, -3, 0]}>
        <Text fontSize={0.35} color="#10b981" anchorX="center">
          {agents.length} Agents Active
        </Text>
        <Text position={[0, -0.6, 0]} fontSize={0.3} color="#60a5fa" anchorX="center">
          Efficiency: {((orchestration?.orchestration_metrics?.collaboration_efficiency || 0.85) * 100).toFixed(0)}%
        </Text>
        <Text position={[0, -1.2, 0]} fontSize={0.25} color="#fbbf24" anchorX="center">
          {orchestration?.task_queue?.length || 0} Tasks Queued
        </Text>
      </group>

      <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.3} minDistance={8} maxDistance={20} />
    </Canvas>
  );
}