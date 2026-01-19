import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

export default function AILabsTransition() {
  const networkRef = useRef();

  const neuralNetwork = useMemo(() => {
    const layers = [8, 12, 12, 8, 4];
    const nodes = [];
    const connections = [];

    layers.forEach((count, layerIndex) => {
      const layerNodes = [];
      for (let i = 0; i < count; i++) {
        const y = (i - count / 2) * 1.5;
        const x = (layerIndex - layers.length / 2) * 4;
        layerNodes.push([x, y, 0]);
      }
      nodes.push(layerNodes);

      // Create connections to previous layer
      if (layerIndex > 0) {
        layerNodes.forEach((node) => {
          nodes[layerIndex - 1].forEach((prevNode) => {
            connections.push({
              start: prevNode,
              end: node,
              activated: Math.random() > 0.5
            });
          });
        });
      }
    });

    return { nodes: nodes.flat(), connections };
  }, []);

  useFrame((state) => {
    if (networkRef.current) {
      networkRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.3;
      networkRef.current.position.z = -5 + Math.sin(state.clock.elapsedTime * 2) * 2;
    }
  });

  return (
    <group ref={networkRef}>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 5]} intensity={1} color="#ec4899" />

      {/* Neural Network Nodes */}
      {neuralNetwork.nodes.map((position, i) => (
        <mesh key={i} position={position}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial
            color="#ec4899"
            emissive="#ec4899"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}

      {/* Connections */}
      {neuralNetwork.connections.map((conn, i) => (
        <Line
          key={i}
          points={[conn.start, conn.end]}
          color={conn.activated ? '#ec4899' : '#666'}
          lineWidth={conn.activated ? 2 : 1}
          opacity={conn.activated ? 0.8 : 0.3}
          transparent
        />
      ))}

      {/* Expanding Ring Effect */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[5, 0.05, 16, 100]} />
        <meshBasicMaterial color="#ec4899" opacity={0.3} transparent />
      </mesh>
    </group>
  );
}