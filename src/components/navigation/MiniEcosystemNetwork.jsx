import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

export default function MiniEcosystemNetwork({ nodeCount = 8 }) {
  const groupRef = useRef();

  const network = React.useMemo(() => {
    const nodes = [];
    const connections = [];

    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = 1;
      nodes.push({
        position: [
          Math.cos(angle) * radius,
          (Math.random() - 0.5) * 0.5,
          Math.sin(angle) * radius
        ],
        color: new THREE.Color().setHSL(i / nodeCount, 0.8, 0.6)
      });
    }

    for (let i = 0; i < nodeCount; i++) {
      const next = (i + 1) % nodeCount;
      connections.push({
        start: nodes[i].position,
        end: nodes[next].position
      });
      if (i % 2 === 0 && i + 2 < nodeCount) {
        connections.push({
          start: nodes[i].position,
          end: nodes[i + 2].position
        });
      }
    }

    return { nodes, connections };
  }, [nodeCount]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 2, 0]} intensity={0.8} color="#00f5ff" />

      {network.nodes.map((node, i) => (
        <mesh key={i} position={node.position}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial
            color={node.color}
            emissive={node.color}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}

      {network.connections.map((conn, i) => (
        <Line
          key={i}
          points={[conn.start, conn.end]}
          color="#00f5ff"
          lineWidth={1}
          opacity={0.4}
          transparent
        />
      ))}

      <mesh>
        <torusGeometry args={[1.2, 0.02, 16, 100]} />
        <meshBasicMaterial color="#00f5ff" opacity={0.3} transparent />
      </mesh>
    </group>
  );
}