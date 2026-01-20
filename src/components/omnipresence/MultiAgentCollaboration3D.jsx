import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

function CollaborativeAgent({ agent, position, color }) {
  const agentRef = useRef();

  useFrame((state) => {
    if (agentRef.current) {
      agentRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
    }
  });

  return (
    <group ref={agentRef} position={position}>
      <Sphere args={[0.2, 16, 16]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.7}
        />
      </Sphere>
      
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
      >
        {agent.role}
      </Text>
    </group>
  );
}

function KnowledgeLink({ start, end }) {
  const points = [
    new THREE.Vector3(...start),
    new THREE.Vector3(...end)
  ];

  return (
    <Line
      points={points}
      color="#00ff88"
      lineWidth={2}
      transparent
      opacity={0.4}
    />
  );
}

function TaskNode({ task, position }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={0.3}
        />
      </mesh>
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.12}
        color="white"
        anchorX="center"
        maxWidth={1.5}
      >
        {task.subtask?.slice(0, 20)}
      </Text>
    </group>
  );
}

export default function MultiAgentCollaboration3D({ collaborativeTask }) {
  if (!collaborativeTask) return null;

  const agents = collaborativeTask.participating_agents || [];
  const tasks = collaborativeTask.task_decomposition || [];

  const agentColors = ['#00f5ff', '#a855f7', '#f59e0b', '#10b981', '#ec4899'];

  return (
    <Canvas camera={{ position: [5, 3, 5], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#a855f7" />

      <Text
        position={[0, 3, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
      >
        {collaborativeTask.task_name}
      </Text>

      {/* Agents */}
      {agents.map((agent, idx) => {
        const angle = (idx / agents.length) * Math.PI * 2;
        const radius = 2;
        return (
          <CollaborativeAgent
            key={agent.agent_id}
            agent={agent}
            position={[
              Math.cos(angle) * radius,
              0,
              Math.sin(angle) * radius
            ]}
            color={agentColors[idx % agentColors.length]}
          />
        );
      })}

      {/* Knowledge sharing links */}
      {agents.map((agent1, i) => 
        agents.slice(i + 1).map((agent2, j) => {
          const angle1 = (i / agents.length) * Math.PI * 2;
          const angle2 = ((i + j + 1) / agents.length) * Math.PI * 2;
          const radius = 2;
          return (
            <KnowledgeLink
              key={`${i}-${j}`}
              start={[Math.cos(angle1) * radius, 0, Math.sin(angle1) * radius]}
              end={[Math.cos(angle2) * radius, 0, Math.sin(angle2) * radius]}
            />
          );
        })
      )}

      {/* Task nodes */}
      {tasks.slice(0, 5).map((task, idx) => (
        <TaskNode
          key={idx}
          task={task}
          position={[
            Math.cos((idx / 5) * Math.PI * 2) * 1,
            1.5,
            Math.sin((idx / 5) * Math.PI * 2) * 1
          ]}
        />
      ))}

      <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  );
}