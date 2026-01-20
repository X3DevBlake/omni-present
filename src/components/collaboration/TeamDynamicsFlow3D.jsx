import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

function AgentNode({ position, member, color }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  const size = 0.3 + (member.performance_score || 50) / 200;

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[size, 32, 32]}>
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={0.4}
        />
      </Sphere>
      <Text
        position={[0, size + 0.4, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
      >
        {member.role || 'Agent'}
      </Text>
      <Text
        position={[0, -(size + 0.4), 0]}
        fontSize={0.1}
        color={color}
        anchorX="center"
      >
        {member.current_tasks?.length || 0} tasks
      </Text>
      <Text
        position={[0, -(size + 0.6), 0]}
        fontSize={0.08}
        color="#fbbf24"
        anchorX="center"
      >
        {member.workload_percentage || 0}% load
      </Text>
    </group>
  );
}

function TaskFlowLine({ from, to, active }) {
  const points = useMemo(() => [
    new THREE.Vector3(...from),
    new THREE.Vector3(...to)
  ], [from, to]);

  return (
    <Line
      points={points}
      color={active ? '#10b981' : '#6b7280'}
      lineWidth={active ? 3 : 1}
      opacity={active ? 0.8 : 0.3}
      transparent
    />
  );
}

export default function TeamDynamicsFlow3D({ snapshot }) {
  const members = snapshot?.team_members || [];
  const reallocations = snapshot?.dynamic_reallocation_events || [];

  const getMemberColor = (member) => {
    const workload = member.workload_percentage || 0;
    if (workload > 80) return '#ef4444'; // Overloaded
    if (workload > 60) return '#fbbf24'; // Busy
    return '#10b981'; // Available
  };

  return (
    <div className="w-full h-[600px] bg-black/20 rounded-xl overflow-hidden relative">
      <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />

        {/* Team members in circle */}
        {members.map((member, i) => {
          const angle = (i / members.length) * Math.PI * 2;
          const radius = 4;
          return (
            <AgentNode
              key={member.agent_id}
              position={[
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                0
              ]}
              member={member}
              color={getMemberColor(member)}
            />
          );
        })}

        {/* Task flow lines */}
        {members.map((member, i) => {
          const angle = (i / members.length) * Math.PI * 2;
          const radius = 4;
          const fromPos = [
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
            0
          ];

          return members.slice(i + 1).map((otherMember, j) => {
            const otherAngle = ((i + j + 1) / members.length) * Math.PI * 2;
            const toPos = [
              Math.cos(otherAngle) * radius,
              Math.sin(otherAngle) * radius,
              0
            ];

            return (
              <TaskFlowLine
                key={`${i}-${j}`}
                from={fromPos}
                to={toPos}
                active={Math.random() > 0.7}
              />
            );
          });
        })}

        {/* Center team velocity indicator */}
        <Sphere args={[0.6, 32, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial 
            color="#a855f7" 
            emissive="#a855f7" 
            emissiveIntensity={0.5}
            wireframe
          />
        </Sphere>
        <Text position={[0, 0, 0.7]} fontSize={0.25} color="white">
          {snapshot?.team_velocity?.toFixed(1) || 0}
        </Text>
        <Text position={[0, 0, 0.4]} fontSize={0.12} color="#a855f7">
          velocity
        </Text>

        <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.8} />
      </Canvas>

      <div className="absolute top-4 right-4 bg-black/60 p-4 rounded-lg backdrop-blur-sm">
        <div className="text-white text-sm font-bold mb-3">Team Metrics</div>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between gap-4">
            <span className="text-white/60">Members:</span>
            <span className="text-cyan-400">{members.length}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-white/60">Efficiency:</span>
            <span className="text-green-400">{snapshot?.collaboration_efficiency || 0}%</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-white/60">Reallocations:</span>
            <span className="text-purple-400">{reallocations.length}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-white/60">Bottlenecks:</span>
            <span className="text-red-400">{snapshot?.bottlenecks_detected?.length || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}