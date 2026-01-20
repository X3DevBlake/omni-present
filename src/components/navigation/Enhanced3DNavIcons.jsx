import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Icon3D({ type }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  const getGeometry = () => {
    switch (type) {
      case 'agents':
        return <octahedronGeometry args={[0.4, 0]} />;
      case 'analytics':
        return <icosahedronGeometry args={[0.4, 0]} />;
      case 'collaboration':
        return <dodecahedronGeometry args={[0.4, 0]} />;
      case 'security':
        return <tetrahedronGeometry args={[0.5, 0]} />;
      case 'labs':
        return <torusGeometry args={[0.3, 0.15, 16, 100]} />;
      default:
        return <boxGeometry args={[0.5, 0.5, 0.5]} />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'agents': return '#00f5ff';
      case 'analytics': return '#a855f7';
      case 'collaboration': return '#44ff44';
      case 'security': return '#ff4444';
      case 'labs': return '#ffaa00';
      default: return '#ffffff';
    }
  };

  return (
    <mesh ref={meshRef}>
      {getGeometry()}
      <meshStandardMaterial
        color={getColor()}
        emissive={getColor()}
        emissiveIntensity={0.6}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}

export default function Enhanced3DNavIcon({ type, size = 40 }) {
  return (
    <div style={{ width: size, height: size }}>
      <Canvas camera={{ position: [0, 0, 2.5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[2, 2, 2]} intensity={1} />
        <Icon3D type={type} />
      </Canvas>
    </div>
  );
}