import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Text, Float } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

const SentientAgent = ({ position, color, name }) => {
  const mesh = useRef();
  useFrame((state) => {
    mesh.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.2;
    mesh.current.rotation.x = state.clock.elapsedTime * 0.5;
    mesh.current.rotation.y = state.clock.elapsedTime * 0.2;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group position={position}>
        <Sphere ref={mesh} args={[0.5, 32, 32]}>
          <MeshDistortMaterial
            color={color}
            distort={0.4}
            speed={2}
            roughness={0.2}
            metalness={0.8}
            emissive={color}
            emissiveIntensity={0.5}
          />
        </Sphere>
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {name}
        </Text>
      </group>
    </Float>
  );
};

export default function SentientAgentVisualizer3D({ agents = [] }) {
  const defaultAgents = [
    { id: 1, name: 'Strategist', position: [-2, 0, 0], color: '#8b5cf6' },
    { id: 2, name: 'Negotiator', position: [0, 0, 0], color: '#ec4899' },
    { id: 3, name: 'Analyst', position: [2, 0, 0], color: '#3b82f6' },
  ];

  const displayAgents = agents.length > 0 ? agents : defaultAgents;

  return (
    <div className="w-full h-[400px] bg-black/20 rounded-lg overflow-hidden border border-white/10">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        {displayAgents.map((agent, i) => (
          <SentientAgent key={i} {...agent} />
        ))}
        <EffectComposer>
          <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} height={300} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}