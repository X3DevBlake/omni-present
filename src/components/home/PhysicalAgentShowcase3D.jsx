import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, RoundedBox, Text, Float } from '@react-three/drei';
import * as THREE from 'three';

function ProjectedAgent({ position, index }) {
  const agentRef = useRef();

  useFrame((state) => {
    if (agentRef.current) {
      const offset = Math.sin(state.clock.elapsedTime * 2 + index) * 0.2;
      agentRef.current.position.y = position[1] + offset;
      agentRef.current.rotation.y += 0.02;
    }
  });

  return (
    <group position={position}>
      <Sphere ref={agentRef} args={[0.3, 32, 32]}>
        <meshStandardMaterial
          color="#00ff88"
          emissive="#00ff88"
          emissiveIntensity={0.8}
          metalness={0.9}
          roughness={0.1}
        />
      </Sphere>

      {/* Holographic aura */}
      <mesh>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial
          color="#00f5ff"
          transparent
          opacity={0.1}
          wireframe
        />
      </mesh>
    </group>
  );
}

function HouseEnvironment() {
  return (
    <group>
      {/* Floor */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Furniture (simplified) */}
      <RoundedBox args={[1.5, 0.8, 1.5]} position={[-2, 0.4, -2]} radius={0.05}>
        <meshStandardMaterial color="#334155" />
      </RoundedBox>

      <RoundedBox args={[0.8, 1.5, 0.8]} position={[2.5, 0.75, 2]} radius={0.05}>
        <meshStandardMaterial color="#334155" />
      </RoundedBox>
    </group>
  );
}

function ProjectionDevice({ position }) {
  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.3}>
      <group position={position}>
        <RoundedBox args={[0.3, 0.3, 0.3]} radius={0.05}>
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#22d3ee"
            emissiveIntensity={0.7}
            metalness={0.8}
            roughness={0.2}
          />
        </RoundedBox>

        {/* Projection beam */}
        <mesh position={[0, -1, 0]}>
          <coneGeometry args={[1, 2, 32]} />
          <meshBasicMaterial
            color="#00f5ff"
            transparent
            opacity={0.15}
          />
        </mesh>
      </group>
    </Float>
  );
}

export default function PhysicalAgentShowcase3D() {
  const agentPositions = [
    [0, 1, 0],
    [-2, 1, 1.5],
    [2, 1, -1]
  ];

  return (
    <Canvas camera={{ position: [6, 4, 6], fov: 60 }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 8, 5]} intensity={1} />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#a855f7" />
      <spotLight position={[0, 5, 0]} angle={0.6} intensity={0.7} color="#00f5ff" />

      <HouseEnvironment />

      {agentPositions.map((pos, idx) => (
        <ProjectedAgent key={idx} position={pos} index={idx} />
      ))}

      <ProjectionDevice position={[0, 3, 0]} />
      <ProjectionDevice position={[-3, 3, -3]} />

      <Text position={[0, 3.5, 0]} fontSize={0.3} color="white" anchorX="center">
        Agents in Your Space
      </Text>

      <OrbitControls
        enableZoom={true}
        minDistance={4}
        maxDistance={12}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
}