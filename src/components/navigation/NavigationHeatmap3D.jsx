import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

function PageNode({ page, position, intensity }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  const getColor = () => {
    if (intensity > 80) return '#ff4444';
    if (intensity > 60) return '#ff8800';
    if (intensity > 40) return '#ffaa00';
    if (intensity > 20) return '#44ff44';
    return '#00f5ff';
  };

  const size = 0.2 + (intensity / 100) * 0.5;

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial
          color={getColor()}
          emissive={getColor()}
          emissiveIntensity={intensity / 100}
        />
      </mesh>
      <Text position={[0, -0.5, 0]} fontSize={0.1} color="white">
        {page.page_name}
      </Text>
      <Text position={[0, 0.5, 0]} fontSize={0.08} color={getColor()}>
        {page.visit_count} visits
      </Text>
    </group>
  );
}

export default function NavigationHeatmap3D({ navigationData }) {
  const pages = navigationData?.most_visited_pages || [];

  return (
    <div className="w-full h-[400px] bg-black/20 rounded-xl overflow-hidden">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
        
        <Text position={[0, 4, 0]} fontSize={0.3} color="#00f5ff">
          Navigation Heatmap
        </Text>

        {pages.map((page, i) => {
          const maxVisits = Math.max(...pages.map(p => p.visit_count), 1);
          const intensity = (page.visit_count / maxVisits) * 100;
          
          const angle = (i / pages.length) * Math.PI * 2;
          const radius = 2 + (i % 3);
          
          return (
            <PageNode
              key={i}
              page={page}
              position={[
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                (Math.random() - 0.5) * 2
              ]}
              intensity={intensity}
            />
          );
        })}
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}