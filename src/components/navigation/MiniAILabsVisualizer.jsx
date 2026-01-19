import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';

export default function MiniAILabsVisualizer() {
  const networkRef = useRef();

  const neuralNetwork = React.useMemo(() => {
    const layers = [3, 4, 3];
    const nodes = [];
    const connections = [];

    layers.forEach((count, layerIndex) => {
      const layerNodes = [];
      for (let i = 0; i < count; i++) {
        const y = (i - count / 2) * 0.6;
        const x = (layerIndex - layers.length / 2) * 1.2;
        layerNodes.push([x, y, 0]);
      }
      nodes.push(layerNodes);

      if (layerIndex > 0) {
        layerNodes.forEach((node) => {
          nodes[layerIndex - 1].forEach((prevNode) => {
            connections.push({ start: prevNode, end: node });
          });
        });
      }
    });

    return { nodes: nodes.flat(), connections };
  }, []);

  useFrame((state) => {
    if (networkRef.current) {
      networkRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  return (
    <group ref={networkRef}>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 2]} intensity={0.5} color="#ec4899" />

      {neuralNetwork.nodes.map((position, i) => (
        <mesh key={i} position={position}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.5} />
        </mesh>
      ))}

      {neuralNetwork.connections.map((conn, i) => (
        <Line
          key={i}
          points={[conn.start, conn.end]}
          color="#ec4899"
          lineWidth={1}
          opacity={0.4}
          transparent
        />
      ))}
    </group>
  );
}