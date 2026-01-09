import React, { useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial } from '@react-three/drei';
import { motion } from 'framer-motion';

function Planet({ position, size, color, title, description, onClick }) {
  const meshRef = useRef();

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.3}>
        <mesh
          ref={meshRef}
          onClick={onClick}
          scale={size}
          onPointerOver={() => meshRef.current?.scale.set(size * 1.2, size * 1.2, size * 1.2)}
          onPointerOut={() => meshRef.current?.scale.set(size, size, size)}
        >
          <icosahedronGeometry args={[1, 4]} />
          <MeshDistortMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.6}
            distort={0.3}
            speed={2}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      </Float>
      <mesh position={[0, -2, 0]}>
        <textGeometry args={[title, { font: null, size: 0.5, height: 0.1 }]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </group>
  );
}

export default function Roadmap3DVisualizer({ roadmapItems, onPlanetClick }) {
  const planets = useMemo(() => {
    if (!roadmapItems || roadmapItems.length === 0) {
      return [
        { position: [-8, 0, 0], size: 1.5, color: '#00f5ff', title: 'Q1 2026', description: 'AI Integration Phase' },
        { position: [0, 6, 0], size: 1.2, color: '#a855f7', title: 'Q2 2026', description: 'DeFi Expansion' },
        { position: [8, 0, 0], size: 1.3, color: '#ec4899', title: 'Q3 2026', description: 'Device Ecosystem' },
        { position: [0, -6, 0], size: 1.4, color: '#3b82f6', title: 'Q4 2026', description: 'Full Integration' }
      ];
    }
    const angles = roadmapItems.length;
    return roadmapItems.map((item, i) => {
      const angle = (i / angles) * Math.PI * 2;
      const radius = 8;
      return {
        position: [Math.cos(angle) * radius, Math.sin(angle) * radius, 0],
        size: 1.2 + Math.random() * 0.4,
        color: ['#00f5ff', '#a855f7', '#ec4899', '#3b82f6'][i % 4],
        title: item.title || `Milestone ${i + 1}`,
        description: item.description
      };
    });
  }, [roadmapItems]);

  return (
    <Canvas camera={{ position: [0, 0, 20], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <pointLight position={[-10, -10, 10]} intensity={0.8} color="#a855f7" />

      {planets.map((planet, i) => (
        <Planet
          key={i}
          position={planet.position}
          size={planet.size}
          color={planet.color}
          title={planet.title}
          description={planet.description}
          onClick={() => onPlanetClick?.(i, planet)}
        />
      ))}

      <OrbitControls autoRotate autoRotateSpeed={2} enableZoom />
    </Canvas>
  );
}