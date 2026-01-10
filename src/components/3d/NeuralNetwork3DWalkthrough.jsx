import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line } from '@react-three/drei';

function NetworkLayer({ z, nodeCount, color }) {
  const nodes = [];
  const spacing = 2;
  const offset = -((nodeCount - 1) * spacing) / 2;

  for (let i = 0; i < nodeCount; i++) {
    nodes.push(
      <Sphere key={i} position={[offset + i * spacing, 0, z]} args={[0.2, 16, 16]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </Sphere>
    );
  }
  return <>{nodes}</>;
}

function ConnectionLines() {
  const connections = [];
  const layers = [
    { z: -3, count: 3, color: '#00f5ff' },
    { z: 0, count: 4, color: '#a855f7' },
    { z: 3, count: 2, color: '#10b981' }
  ];

  for (let l = 0; l < layers.length - 1; l++) {
    const current = layers[l];
    const next = layers[l + 1];
    const currentOffset = -((current.count - 1) * 2) / 2;
    const nextOffset = -((next.count - 1) * 2) / 2;

    for (let i = 0; i < current.count; i++) {
      for (let j = 0; j < next.count; j++) {
        connections.push(
          <Line
            key={`${l}-${i}-${j}`}
            points={[
              [currentOffset + i * 2, 0, current.z],
              [nextOffset + j * 2, 0, next.z]
            ]}
            color="#ffffff"
            lineWidth={1}
            opacity={0.2}
            transparent
          />
        );
      }
    }
  }
  return <>{connections}</>;
}

export default function NeuralNetwork3DWalkthrough() {
  return (
    <div className="bg-black/40 rounded-xl border border-white/10 h-96 overflow-hidden">
      <Canvas camera={{ position: [0, 3, 8], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />

        <ConnectionLines />
        <NetworkLayer z={-3} nodeCount={3} color="#00f5ff" />
        <NetworkLayer z={0} nodeCount={4} color="#a855f7" />
        <NetworkLayer z={3} nodeCount={2} color="#10b981" />

        <OrbitControls enableZoom />
        <fog attach="fog" args={['#000000', 8, 20]} />
      </Canvas>
    </div>
  );
}