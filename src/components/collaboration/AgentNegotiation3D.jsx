import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function NegotiatingAgent({ agent, position, index }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.x = position[0] + Math.sin(state.clock.elapsedTime + index) * 0.2;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={0.5} />
      </mesh>
      <Text position={[0, -0.6, 0]} fontSize={0.1} color="white">
        Agent {index + 1}
      </Text>
      <Text position={[0, 0.6, 0]} fontSize={0.08} color="#ffaa00">
        Concessions: {agent.concessions_made}
      </Text>
    </group>
  );
}

function NegotiationTable({ position }) {
  return (
    <mesh position={position}>
      <cylinderGeometry args={[1.5, 1.5, 0.1, 32]} />
      <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.2} />
    </mesh>
  );
}

function ProgressRings({ rounds, maxRounds }) {
  return (
    <group position={[0, 2, 0]}>
      {Array.from({ length: maxRounds }, (_, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <torusGeometry args={[0.5 + i * 0.2, 0.02, 16, 100]} />
          <meshStandardMaterial
            color={i < rounds ? '#44ff44' : '#333333'}
            emissive={i < rounds ? '#44ff44' : '#000000'}
            emissiveIntensity={i < rounds ? 0.5 : 0}
          />
        </mesh>
      ))}
      <Text position={[0, 0.5, 0]} fontSize={0.3} color="#44ff44">
        Round {rounds}/{maxRounds}
      </Text>
    </group>
  );
}

export default function AgentNegotiation3D({ negotiation }) {
  return (
    <div className="w-full h-[600px] bg-black/20 rounded-lg">
      <Canvas camera={{ position: [0, 3, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ec4899" />
        
        {negotiation && (
          <>
            <Text position={[0, 4.5, 0]} fontSize={0.4} color="#00f5ff">
              Agent Negotiation
            </Text>
            <Text position={[0, 3.8, 0]} fontSize={0.2} color="#ffffff">
              {negotiation.negotiation_type.replace('_', ' ').toUpperCase()}
            </Text>
            <Text position={[0, 3.3, 0]} fontSize={0.18} color={
              negotiation.status === 'agreement_reached' ? '#44ff44' : '#ffaa00'
            }>
              Status: {negotiation.status}
            </Text>

            <ProgressRings rounds={negotiation.rounds_completed} maxRounds={negotiation.max_rounds} />
            <NegotiationTable position={[0, 0, 0]} />

            {negotiation.participating_agents?.map((agent, i) => {
              const angle = (i / negotiation.participating_agents.length) * Math.PI * 2;
              return (
                <NegotiatingAgent
                  key={i}
                  agent={agent}
                  position={[Math.cos(angle) * 2.5, Math.sin(angle) * 2.5, 0]}
                  index={i}
                />
              );
            })}

            {negotiation.status === 'agreement_reached' && (
              <group position={[0, -3, 0]}>
                <Text fontSize={0.2} color="#44ff44">
                  ✓ Agreement Reached
                </Text>
                <Text position={[0, -0.5, 0]} fontSize={0.15} color="#ffffff">
                  Fairness: {(negotiation.fairness_score * 100).toFixed(0)}%
                </Text>
              </group>
            )}
          </>
        )}
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}