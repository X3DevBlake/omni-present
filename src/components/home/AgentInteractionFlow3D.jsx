import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line, Trail, Html } from '@react-three/drei';
import * as THREE from 'three';

function AgentNode({ agent, position, connections, onSelect }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.scale.setScalar(hovered ? 1.3 : pulse);
    }
  });

  const getColor = () => {
    if (agent.status === 'active') return '#44ff44';
    if (agent.status === 'idle') return '#00f5ff';
    return '#ff8800';
  };

  return (
    <group position={position}>
      <Trail width={3} length={8} color={getColor()} attenuation={(t) => t * t}>
        <Sphere
          ref={meshRef}
          args={[0.3, 32, 32]}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={() => onSelect?.(agent)}
        >
          <meshStandardMaterial
            color={getColor()}
            emissive={getColor()}
            emissiveIntensity={0.8}
            metalness={0.8}
            roughness={0.2}
          />
        </Sphere>
      </Trail>

      <Html position={[0, 0.6, 0]} center>
        <div className="text-white text-xs font-medium bg-black/70 px-2 py-1 rounded whitespace-nowrap">
          {agent.name || `Agent ${agent.id?.slice(0, 4)}`}
        </div>
      </Html>

      {connections > 0 && (
        <Text position={[0, -0.6, 0]} fontSize={0.12} color="#ffaa00">
          {connections} links
        </Text>
      )}
    </group>
  );
}

function CommunicationBeam({ start, end, strength, active }) {
  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  const color = active ? '#00f5ff' : '#a855f7';
  
  return (
    <Line
      points={points}
      color={color}
      lineWidth={strength * 3}
      transparent
      opacity={active ? 0.8 : 0.3}
    />
  );
}

function CentralHub() {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={meshRef}>
      <octahedronGeometry args={[0.5, 0]} />
      <meshStandardMaterial
        color="#a855f7"
        emissive="#a855f7"
        emissiveIntensity={1}
        wireframe
      />
    </mesh>
  );
}

export default function AgentInteractionFlow3D({ agents = [], interactions = [], onAgentSelect }) {
  const agentPositions = agents.map((agent, i) => {
    const angle = (i / agents.length) * Math.PI * 2;
    const radius = 3 + Math.random() * 1;
    return {
      agent,
      position: [
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        (Math.random() - 0.5) * 2
      ],
      connections: interactions.filter(
        int => int.source_agent_id === agent.id || int.target_agent_id === agent.id
      ).length
    };
  });

  return (
    <div className="w-full h-[600px] bg-black/20 rounded-xl overflow-hidden">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
        
        <Text position={[0, 5, 0]} fontSize={0.4} color="#00f5ff">
          Agent Interaction Network
        </Text>

        <CentralHub />

        {agentPositions.map((item, i) => (
          <AgentNode
            key={i}
            agent={item.agent}
            position={item.position}
            connections={item.connections}
            onSelect={onAgentSelect}
          />
        ))}

        {interactions.map((interaction, i) => {
          const source = agentPositions.find(ap => ap.agent.id === interaction.source_agent_id);
          const target = agentPositions.find(ap => ap.agent.id === interaction.target_agent_id);
          
          if (!source || !target) return null;
          
          return (
            <CommunicationBeam
              key={i}
              start={source.position}
              end={target.position}
              strength={interaction.interaction_count / 10}
              active={interaction.is_active}
            />
          );
        })}

        <Text position={[0, -5, 0]} fontSize={0.2} color="white">
          {interactions.filter(i => i.is_active).length} Active Connections
        </Text>
        
        <OrbitControls enableDamping dampingFactor={0.05} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}