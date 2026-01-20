import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function AgentNode({ position, agent, isLeader, onClick }) {
  const meshRef = useRef();
  const trailRef = useRef([]);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      
      // Swarm behavior - gentle movement
      const time = state.clock.elapsedTime;
      meshRef.current.position.x = position[0] + Math.sin(time + position[0]) * 0.3;
      meshRef.current.position.y = position[1] + Math.cos(time + position[1]) * 0.3;
      meshRef.current.position.z = position[2] + Math.sin(time + position[2]) * 0.3;
    }
  });

  const color = isLeader ? '#fbbf24' : '#60a5fa';
  const scale = isLeader ? 0.8 : 0.5;

  return (
    <group onClick={onClick}>
      <Sphere ref={meshRef} args={[scale, 32, 32]} position={position}>
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={isLeader ? 0.8 : 0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>
      <Text
        position={[position[0], position[1] + scale + 0.5, position[2]]}
        fontSize={0.3}
        color="white"
        anchorX="center"
      >
        {agent.role_in_swarm}
      </Text>
      <Text
        position={[position[0], position[1] + scale + 0.9, position[2]]}
        fontSize={0.2}
        color="#a0a0a0"
        anchorX="center"
      >
        Score: {agent.contribution_score?.toFixed(0) || 0}
      </Text>
    </group>
  );
}

function CommunicationLine({ start, end, strength }) {
  const lineRef = useRef();
  
  useFrame((state) => {
    if (lineRef.current) {
      const opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2 + strength) * 0.2;
      lineRef.current.material.opacity = opacity;
    }
  });

  return (
    <Line
      ref={lineRef}
      points={[start, end]}
      color="#8b5cf6"
      lineWidth={strength * 2}
      transparent
      opacity={0.5}
    />
  );
}

export default function SwarmIntelligence3D({ swarm, onAgentClick }) {
  const agentPositions = useMemo(() => {
    const positions = [];
    const agents = swarm?.participating_agents || [];
    
    agents.forEach((agent, i) => {
      const angle = (i / agents.length) * Math.PI * 2;
      const radius = 5;
      const height = Math.sin(angle * 2) * 2;
      positions.push({
        agent,
        position: [
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        ],
        isLeader: agent.role_in_swarm === 'leader' || agent.role_in_swarm === 'coordinator'
      });
    });
    
    return positions;
  }, [swarm]);

  const communicationLines = useMemo(() => {
    const lines = [];
    agentPositions.forEach((pos1, i) => {
      agentPositions.forEach((pos2, j) => {
        if (i < j) {
          lines.push({
            start: pos1.position,
            end: pos2.position,
            strength: Math.random()
          });
        }
      });
    });
    return lines;
  }, [agentPositions]);

  const emergentBehavior = swarm?.emergent_behavior;

  return (
    <Canvas camera={{ position: [0, 8, 15], fov: 60 }} style={{ height: '700px' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.2} />
      <pointLight position={[-10, -10, -10]} intensity={0.6} color="#8b5cf6" />

      {/* Central swarm core */}
      <Sphere args={[1.5, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#fbbf24" 
          emissive="#fbbf24" 
          emissiveIntensity={0.6}
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.7}
        />
      </Sphere>

      <Text position={[0, 2.5, 0]} fontSize={0.6} color="white" anchorX="center">
        {swarm?.swarm_name || 'Swarm Intelligence'}
      </Text>
      <Text position={[0, 1.8, 0]} fontSize={0.3} color="#fbbf24" anchorX="center">
        Intelligence: {swarm?.swarm_intelligence_score?.toFixed(0) || 0}
      </Text>
      <Text position={[0, 1.3, 0]} fontSize={0.25} color="#a78bfa" anchorX="center">
        {swarm?.coordination_protocol || 'consensus'}
      </Text>

      {/* Agent nodes */}
      {agentPositions.map(({ agent, position, isLeader }, i) => (
        <AgentNode
          key={i}
          position={position}
          agent={agent}
          isLeader={isLeader}
          onClick={() => onAgentClick?.(agent)}
        />
      ))}

      {/* Communication lines */}
      {communicationLines.map((line, i) => (
        <CommunicationLine
          key={i}
          start={line.start}
          end={line.end}
          strength={line.strength}
        />
      ))}

      {/* Emergent behavior visualization */}
      {emergentBehavior && (
        <group position={[0, -3, 0]}>
          <Text fontSize={0.4} color="#ff6b6b" anchorX="center">
            Emergent: {emergentBehavior.behavior_type}
          </Text>
          <Text position={[0, -0.5, 0]} fontSize={0.25} color="white" anchorX="center">
            Complexity: {emergentBehavior.complexity_score?.toFixed(1) || 0}
          </Text>
        </group>
      )}

      <OrbitControls 
        enableZoom={true}
        autoRotate
        autoRotateSpeed={0.5}
        minDistance={10}
        maxDistance={30}
      />
    </Canvas>
  );
}