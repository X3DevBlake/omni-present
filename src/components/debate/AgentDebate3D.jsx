import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line, Cone } from '@react-three/drei';
import * as THREE from 'three';

function DebaterNode({ position, agent, round }) {
  const meshRef = useRef();
  const pulseRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.008;
    }
    if (pulseRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.3 + 0.7;
      pulseRef.current.scale.setScalar(pulse);
    }
  });

  const confidence = agent.confidence || 0.5;
  const color = new THREE.Color().lerpColors(
    new THREE.Color('#ef4444'),
    new THREE.Color('#10b981'),
    confidence
  );

  return (
    <group position={position}>
      <Sphere ref={pulseRef} args={[0.8, 32, 32]}>
        <meshStandardMaterial color={color} transparent opacity={0.3} />
      </Sphere>
      <Sphere ref={meshRef} args={[0.6, 32, 32]}>
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          metalness={0.7}
          roughness={0.3}
        />
      </Sphere>
      <Text position={[0, 1.2, 0]} fontSize={0.3} color="white" anchorX="center">
        Agent {agent.agent_id?.slice(-4)}
      </Text>
      <Text position={[0, 0.8, 0]} fontSize={0.2} color={color} anchorX="center">
        {(confidence * 100).toFixed(0)}% confident
      </Text>
    </group>
  );
}

function ArgumentLine({ start, end, strength }) {
  const lineRef = useRef();
  
  useFrame((state) => {
    if (lineRef.current) {
      const opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      lineRef.current.material.opacity = opacity;
    }
  });

  return (
    <Line
      ref={lineRef}
      points={[start, end]}
      color="#60a5fa"
      lineWidth={strength * 4}
      transparent
      opacity={0.5}
    />
  );
}

export default function AgentDebate3D({ debate }) {
  const agents = debate?.participating_agents || [];
  const rounds = debate?.debate_rounds || [];
  const consensus = debate?.consensus_reached;

  const agentPositions = agents.map((agent, i) => {
    const angle = (i / agents.length) * Math.PI * 2;
    const radius = 5;
    return {
      agent,
      position: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius]
    };
  });

  const argumentLines = [];
  agentPositions.forEach((pos1, i) => {
    agentPositions.forEach((pos2, j) => {
      if (i < j) {
        argumentLines.push({
          start: pos1.position,
          end: pos2.position,
          strength: Math.random()
        });
      }
    });
  });

  return (
    <Canvas camera={{ position: [0, 8, 15], fov: 60 }} style={{ height: '700px' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <pointLight position={[-10, 5, -10]} intensity={0.8} color="#60a5fa" />

      {/* Central debate topic */}
      <Sphere args={[1.2, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color={consensus ? '#10b981' : '#f59e0b'}
          emissive={consensus ? '#10b981' : '#f59e0b'}
          emissiveIntensity={0.7}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>

      <Text position={[0, 3, 0]} fontSize={0.6} color="white" anchorX="center">
        Agent Debate
      </Text>
      <Text position={[0, 2.3, 0]} fontSize={0.3} color="#60a5fa" anchorX="center" maxWidth={8}>
        {debate?.debate_topic || 'Discussion Topic'}
      </Text>
      <Text position={[0, 1.8, 0]} fontSize={0.25} color="#a78bfa" anchorX="center">
        Rounds: {rounds.length}
      </Text>
      <Text position={[0, 1.3, 0]} fontSize={0.22} color={consensus ? '#10b981' : '#fbbf24'} anchorX="center">
        {consensus ? '✓ Consensus Reached' : '⏳ In Progress'}
      </Text>

      {/* Debater nodes */}
      {agentPositions.map((pos, i) => (
        <DebaterNode key={i} {...pos} round={rounds.length} />
      ))}

      {/* Argument connections */}
      {argumentLines.map((line, i) => (
        <ArgumentLine key={i} {...line} />
      ))}

      {/* Truth score indicator */}
      <group position={[0, -3, 0]}>
        <Text fontSize={0.4} color="#10b981" anchorX="center">
          Truth Score: {((debate?.truth_score || 0.7) * 100).toFixed(0)}%
        </Text>
        {debate?.final_conclusion && (
          <Text position={[0, -0.6, 0]} fontSize={0.25} color="white" anchorX="center" maxWidth={10}>
            {debate.final_conclusion}
          </Text>
        )}
      </group>

      <OrbitControls 
        enableZoom={true}
        autoRotate={consensus}
        autoRotateSpeed={0.5}
        minDistance={10}
        maxDistance={25}
      />
    </Canvas>
  );
}