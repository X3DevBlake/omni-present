import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line, RoundedBox, Html } from '@react-three/drei';
import * as THREE from 'three';

function TeamNode({ team, position, onSelect }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.015;
      const workloadPulse = 1 + team.workload * Math.sin(state.clock.elapsedTime * 2) * 0.2;
      meshRef.current.scale.setScalar(workloadPulse);
    }
  });

  const getColor = () => {
    if (team.availability > 0.7) return '#44ff44';
    if (team.availability > 0.4) return '#ffaa00';
    return '#ff4444';
  };

  return (
    <group position={position}>
      <Sphere
        ref={meshRef}
        args={[0.3 + team.performance_score * 0.3, 32, 32]}
        onClick={() => onSelect?.(team)}
      >
        <meshStandardMaterial
          color={getColor()}
          emissive={getColor()}
          emissiveIntensity={0.8}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>

      <Html position={[0, 0.7, 0]} center>
        <div className="text-white text-xs font-medium bg-black/70 px-2 py-1 rounded whitespace-nowrap">
          {team.team_name}
        </div>
      </Html>

      <Text position={[0, -0.7, 0]} fontSize={0.12} color={getColor()}>
        {team.members_count} agents
      </Text>

      <Text position={[0, -1, 0]} fontSize={0.1} color="white">
        {team.assigned_tasks} tasks
      </Text>
    </group>
  );
}

function TaskCube({ task, position }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.02;
      meshRef.current.rotation.y += 0.01;
    }
  });

  const getStatusColor = () => {
    switch (task.status) {
      case 'completed': return '#44ff44';
      case 'in_progress': return '#00f5ff';
      case 'assigned': return '#ffaa00';
      default: return '#a855f7';
    }
  };

  return (
    <group position={position}>
      <RoundedBox ref={meshRef} args={[0.3, 0.3, 0.3]} radius={0.05}>
        <meshStandardMaterial
          color={getStatusColor()}
          emissive={getStatusColor()}
          emissiveIntensity={0.6}
        />
      </RoundedBox>

      <Html position={[0, 0.4, 0]} center>
        <div className="text-white text-xs bg-black/70 px-2 py-1 rounded">
          {task.status}
        </div>
      </Html>
    </group>
  );
}

function AllocationPath({ fromPos, toPos, confidence }) {
  const lineRef = useRef();
  
  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.material.dashOffset -= 0.02;
    }
  });

  return (
    <Line
      ref={lineRef}
      points={[new THREE.Vector3(...fromPos), new THREE.Vector3(...toPos)]}
      color="#00f5ff"
      lineWidth={1 + confidence * 2}
      dashed
      dashScale={20}
      dashSize={0.3}
      gapSize={0.2}
    />
  );
}

function OrchestratorCore() {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={meshRef}>
      <dodecahedronGeometry args={[0.8, 0]} />
      <meshStandardMaterial
        color="#a855f7"
        emissive="#a855f7"
        emissiveIntensity={1.2}
        wireframe
      />
    </mesh>
  );
}

export default function AgentOrchestration3D({ orchestrationData, onTeamSelect, onTaskSelect }) {
  if (!orchestrationData) return null;

  const teamPositions = (orchestrationData.teams || []).map((team, i) => {
    const angle = (i / orchestrationData.teams.length) * Math.PI * 2;
    const radius = 4;
    return {
      team,
      position: [Math.cos(angle) * radius, Math.sin(angle) * radius, 0]
    };
  });

  const taskPositions = (orchestrationData.task_flow || []).slice(0, 10).map((task, i) => {
    const angle = (i / 10) * Math.PI * 2;
    const radius = 2;
    return {
      task,
      position: [Math.cos(angle) * radius, Math.sin(angle) * radius, 2]
    };
  });

  return (
    <div className="w-full h-[700px] bg-black/20 rounded-xl overflow-hidden">
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#a855f7" />
        
        <Text position={[0, 6, 0]} fontSize={0.5} color="#00f5ff">
          Agent Orchestration Layer
        </Text>

        <OrchestratorCore />

        {teamPositions.map((item, i) => (
          <TeamNode
            key={i}
            team={item.team}
            position={item.position}
            onSelect={onTeamSelect}
          />
        ))}

        {taskPositions.map((item, i) => (
          <TaskCube
            key={i}
            task={item.task}
            position={item.position}
          />
        ))}

        {taskPositions.map((taskItem, i) => {
          const assignedTeam = teamPositions.find(tp => tp.team.team_id === taskItem.task.assigned_team?.id);
          if (!assignedTeam) return null;
          
          return (
            <AllocationPath
              key={i}
              fromPos={taskItem.position}
              toPos={assignedTeam.position}
              confidence={0.8}
            />
          );
        })}

        <Text position={[0, -6, 0]} fontSize={0.25} color="white">
          {orchestrationData.teams?.length} Teams • {orchestrationData.task_flow?.length} Tasks
        </Text>

        {orchestrationData.performance && (
          <Text position={[0, -6.7, 0]} fontSize={0.2} color="#44ff44">
            Success Rate: {((orchestrationData.performance.success_rate || 0) * 100).toFixed(0)}%
          </Text>
        )}
        
        <OrbitControls enableDamping dampingFactor={0.05} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}