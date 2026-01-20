import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line, Html } from '@react-three/drei';
import * as THREE from 'three';

function GraphNode({ position, index }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2 + index) * 0.1 + 0.9;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <Sphere ref={meshRef} args={[0.3, 32, 32]} position={position}>
      <meshStandardMaterial 
        color="#60a5fa"
        emissive="#60a5fa"
        emissiveIntensity={0.6}
      />
    </Sphere>
  );
}

export default function GraphNeuralNet3D({ network, onNodeClick }) {
  const numNodes = Math.min(network?.graph_structure?.num_nodes || 20, 30);
  
  const nodes = Array.from({ length: numNodes }, (_, i) => {
    const phi = Math.acos(-1 + (2 * i) / numNodes);
    const theta = Math.sqrt(numNodes * Math.PI) * phi;
    const radius = 5;
    return {
      position: [
        radius * Math.cos(theta) * Math.sin(phi),
        radius * Math.sin(theta) * Math.sin(phi),
        radius * Math.cos(phi)
      ],
      index: i
    };
  });

  const edges = [];
  for (let i = 0; i < nodes.length; i++) {
    const neighbors = Math.floor(Math.random() * 3) + 2;
    for (let j = 0; j < neighbors; j++) {
      const target = (i + j + 1) % nodes.length;
      edges.push([nodes[i].position, nodes[target].position]);
    }
  }

  return (
    <Canvas camera={{ position: [0, 0, 15], fov: 60 }} style={{ height: '700px' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[15, 15, 15]} intensity={1.5} />
      <pointLight position={[-15, 5, -15]} intensity={0.8} color="#60a5fa" />

      <Text position={[0, 7, 0]} fontSize={0.6} color="white" anchorX="center">
        Graph Neural Network
      </Text>
      <Text position={[0, 6.3, 0]} fontSize={0.3} color="#60a5fa" anchorX="center">
        {network?.network_name || 'GNN'}
      </Text>
      <Text position={[0, 5.8, 0]} fontSize={0.25} color="#a78bfa" anchorX="center">
        {network?.architecture_type || 'GAT'} • {network?.num_layers || 3} layers
      </Text>

      {nodes.map((node, i) => (
        <GraphNode key={i} {...node} />
      ))}

      {edges.map((edge, i) => (
        <Line
          key={i}
          points={edge}
          color="#60a5fa"
          lineWidth={1}
          transparent
          opacity={0.3}
        />
      ))}

      <group position={[0, -7, 0]}>
        <Text fontSize={0.3} color="#10b981" anchorX="center">
          {numNodes} nodes • {edges.length} edges
        </Text>
        <Text position={[0, -0.6, 0]} fontSize={0.25} color="#60a5fa" anchorX="center">
          Aggregation: {network?.aggregation_function || 'attention'}
        </Text>
      </group>

      <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={1} minDistance={10} maxDistance={25} />
    </Canvas>
  );
}