import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Sphere, Box } from '@react-three/drei';
import * as THREE from 'three';

function TaskNode({ position, task, status, onClick }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current && status === 'in_progress') {
      meshRef.current.rotation.y += 0.02;
    }
  });

  const colorMap = {
    completed: '#10b981',
    in_progress: '#3b82f6',
    pending: '#6b7280',
    blocked: '#ef4444'
  };

  return (
    <group position={position} onClick={onClick}>
      <Box ref={meshRef} args={[0.8, 0.8, 0.8]}>
        <meshStandardMaterial 
          color={colorMap[status] || '#6b7280'} 
          emissive={colorMap[status] || '#6b7280'} 
          emissiveIntensity={0.4} 
        />
      </Box>
      <Text
        position={[0, 1, 0]}
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {task.name}
      </Text>
    </group>
  );
}

function AgentAvatar({ position, agent, workload }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  const scale = 0.5 + (workload / 100) * 0.3;

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[scale, 32, 32]}>
        <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.5} />
      </Sphere>
      <Text
        position={[0, scale + 0.5, 0]}
        fontSize={0.2}
        color="#a78bfa"
        anchorX="center"
      >
        Agent {agent.slice(-6)}
      </Text>
      <Text
        position={[0, scale + 0.8, 0]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="center"
      >
        {workload.toFixed(0)}% load
      </Text>
    </group>
  );
}

export default function TeamDynamicsTimeline3D({ snapshots, tasks, onTaskClick }) {
  const taskPositions = useMemo(() => {
    return tasks?.map((task, i) => {
      const x = (i % 5) * 3 - 6;
      const z = Math.floor(i / 5) * 3;
      const y = 0;
      return { task, position: [x, y, z] };
    }) || [];
  }, [tasks]);

  const agentPositions = useMemo(() => {
    const latestSnapshot = snapshots?.[0];
    return latestSnapshot?.team_members?.map((member, i) => {
      const angle = (i / (latestSnapshot.team_members.length || 1)) * Math.PI * 2;
      const radius = 8;
      return {
        agent: member.agent_id,
        position: [Math.cos(angle) * radius, 2, Math.sin(angle) * radius],
        workload: member.workload_percentage || 50
      };
    }) || [];
  }, [snapshots]);

  const dependencies = useMemo(() => {
    const lines = [];
    tasks?.forEach((task, i) => {
      if (task.dependencies && taskPositions[i]) {
        task.dependencies.forEach(depId => {
          const depIndex = tasks.findIndex(t => t.id === depId);
          if (depIndex >= 0 && taskPositions[depIndex]) {
            lines.push({
              points: [taskPositions[i].position, taskPositions[depIndex].position],
              color: '#fbbf24'
            });
          }
        });
      }
    });
    return lines;
  }, [tasks, taskPositions]);

  return (
    <Canvas camera={{ position: [0, 10, 20], fov: 60 }} style={{ height: '700px' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 10, -10]} intensity={0.5} />

      {/* Central coordination hub */}
      <Sphere args={[1.5, 32, 32]} position={[0, 5, 0]}>
        <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.6} />
      </Sphere>
      <Text position={[0, 7, 0]} fontSize={0.5} color="white">
        Team Coordination
      </Text>

      {/* Task nodes */}
      {taskPositions.map(({ task, position }, i) => (
        <TaskNode
          key={task.id || i}
          position={position}
          task={task}
          status={task.status || 'pending'}
          onClick={() => onTaskClick?.(task)}
        />
      ))}

      {/* Agent avatars */}
      {agentPositions.map((agent, i) => (
        <AgentAvatar
          key={agent.agent || i}
          position={agent.position}
          agent={agent.agent}
          workload={agent.workload}
        />
      ))}

      {/* Task dependency lines */}
      {dependencies.map((dep, i) => (
        <Line
          key={i}
          points={dep.points}
          color={dep.color}
          lineWidth={2}
          dashed
          dashSize={0.1}
          gapSize={0.05}
        />
      ))}

      {/* Timeline visualization */}
      <Line
        points={[[- 10, -2, 0], [10, -2, 0]]}
        color="#6366f1"
        lineWidth={3}
      />
      
      <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.3} />
    </Canvas>
  );
}