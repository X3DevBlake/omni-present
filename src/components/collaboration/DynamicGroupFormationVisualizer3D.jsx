import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';

function AgentNode({ agent, position, groupColor }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
    }
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.5, 32, 32]}>
        <meshStandardMaterial 
          color={groupColor} 
          emissive={groupColor} 
          emissiveIntensity={0.6}
        />
      </Sphere>
      <Text
        position={[0, 1, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {agent.slice(-4)}
      </Text>
    </group>
  );
}

function GroupCluster({ group, position, index }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  const colors = ['#00ffff', '#ff00ff', '#ffff00', '#00ff88', '#ff8800'];
  const color = colors[index % colors.length];
  const memberCount = group.member_agents?.length || 0;
  const radius = 3;

  return (
    <group ref={meshRef} position={position}>
      {/* Group center */}
      <Sphere args={[1, 32, 32]}>
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.8}
          transparent
          opacity={0.7}
        />
      </Sphere>
      <Text
        position={[0, 2, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
      >
        {group.group_name}
      </Text>

      {/* Member agents */}
      {group.member_agents?.slice(0, 8).map((agentId, i) => {
        const angle = (i / memberCount) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        return (
          <React.Fragment key={i}>
            <AgentNode 
              agent={agentId} 
              position={[x, 0, z]} 
              groupColor={color}
            />
            <Line
              points={[[0, 0, 0], [x, 0, z]]}
              color={color}
              lineWidth={1}
              opacity={0.5}
            />
          </React.Fragment>
        );
      })}
    </group>
  );
}

export default function DynamicGroupFormationVisualizer3D({ groups = [] }) {
  if (!groups || groups.length === 0) {
    return (
      <div className="h-[500px] flex items-center justify-center text-white/60">
        No working groups formed yet
      </div>
    );
  }

  const radius = 12;
  const angleStep = (Math.PI * 2) / groups.length;

  return (
    <div className="h-[500px] w-full bg-black/40 rounded-xl overflow-hidden">
      <Canvas camera={{ position: [0, 10, 25], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00ffff" />

        {groups.map((group, index) => {
          const angle = angleStep * index;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          
          return (
            <GroupCluster
              key={group.id || index}
              group={group}
              position={[x, 0, z]}
              index={index}
            />
          );
        })}

        <OrbitControls enableZoom={true} />
      </Canvas>
    </div>
  );
}