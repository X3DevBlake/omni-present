import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial } from '@react-three/drei';
import { motion } from 'framer-motion';

function NewsNode({ position, sentiment, title }) {
  const getColor = () => {
    switch (sentiment) {
      case 'bullish':
        return '#10b981';
      case 'bearish':
        return '#ef4444';
      case 'neutral':
        return '#3b82f6';
      default:
        return '#00f5ff';
    }
  };

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.3}>
      <mesh position={position} scale={0.8}>
        <icosahedronGeometry args={[0.6, 3]} />
        <MeshDistortMaterial
          color={getColor()}
          emissive={getColor()}
          emissiveIntensity={0.7}
          distort={0.2}
          speed={1.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </Float>
  );
}

export default function NewsVisualization3D({ newsItems }) {
  const nodes = useMemo(() => {
    if (!newsItems || newsItems.length === 0) {
      return [
        { position: [-6, 0, 0], sentiment: 'bullish', title: 'Bull Run News' },
        { position: [0, 5, 0], sentiment: 'bearish', title: 'Market Concern' },
        { position: [6, 0, 0], sentiment: 'neutral', title: 'Update' },
        { position: [0, -5, 0], sentiment: 'bullish', title: 'Positive Dev' },
        { position: [-3, 3, -3], sentiment: 'neutral', title: 'Analysis' },
        { position: [3, 3, -3], sentiment: 'bearish', title: 'Warning' }
      ];
    }

    return newsItems.slice(0, 6).map((item, i) => {
      const angle = (i / 6) * Math.PI * 2;
      return {
        position: [Math.cos(angle) * 5, Math.sin(i * 0.7) * 3, Math.sin(angle) * 5],
        sentiment: item.sentiment || 'neutral',
        title: item.title
      };
    });
  }, [newsItems]);

  return (
    <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.2} />
      <pointLight position={[-10, -10, 10]} intensity={0.8} color="#a855f7" />

      {/* Central hub */}
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={0.8} />
      </mesh>

      {/* News nodes */}
      {nodes.map((node, i) => (
        <NewsNode key={i} position={node.position} sentiment={node.sentiment} title={node.title} />
      ))}

      {/* Connection lines */}
      {nodes.map((node, i) => (
        <line key={`line-${i}`}>
          <bufferGeometry attach="geometry" />
          <lineBasicMaterial attach="material" color="#00f5ff" transparent opacity={0.3} />
        </line>
      ))}

      <OrbitControls autoRotate autoRotateSpeed={3} enableZoom />
    </Canvas>
  );
}