import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial, Text3D, Center } from '@react-three/drei';
import * as THREE from 'three';

function RotatingBlueprint({ type, color }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current && state?.clock) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  const renderGeometry = () => {
    switch (type) {
      case 'layers':
        return (
          <>
            <mesh position={[0, 0.5, 0]}>
              <boxGeometry args={[2, 0.2, 2]} />
              <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[1.8, 0.2, 1.8]} />
              <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, -0.5, 0]}>
              <boxGeometry args={[1.6, 0.2, 1.6]} />
              <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
            </mesh>
          </>
        );
      case 'network':
        return (
          <>
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.5, 32, 32]} />
              <MeshDistortMaterial color={color} distort={0.3} speed={2} metalness={0.8} />
            </mesh>
            {[...Array(6)].map((_, i) => {
              const angle = (i / 6) * Math.PI * 2;
              return (
                <mesh key={i} position={[Math.cos(angle) * 1.5, 0, Math.sin(angle) * 1.5]}>
                  <sphereGeometry args={[0.2, 16, 16]} />
                  <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
                </mesh>
              );
            })}
          </>
        );
      case 'shield':
        return (
          <mesh>
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} wireframe />
          </mesh>
        );
      case 'zap':
        return (
          <mesh>
            <torusKnotGeometry args={[0.7, 0.2, 100, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} metalness={0.8} />
          </mesh>
        );
      case 'globe':
        return (
          <mesh>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial color={color} metalness={0.5} roughness={0.5} wireframe />
          </mesh>
        );
      case 'sparkles':
        return (
          <>
            {[...Array(20)].map((_, i) => (
              <mesh key={i} position={[(Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2]}>
                <octahedronGeometry args={[0.1, 0]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
              </mesh>
            ))}
          </>
        );
      default:
        return (
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
          </mesh>
        );
    }
  };

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <group
        ref={meshRef}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        scale={hovered ? 1.1 : 1}
      >
        {renderGeometry()}
        {hovered && (
          <mesh>
            <sphereGeometry args={[2, 32, 32]} />
            <meshBasicMaterial color={color} transparent opacity={0.05} wireframe />
          </mesh>
        )}
      </group>
    </Float>
  );
}

export default function Feature3DBlueprint({ type = 'layers', color = '#00f5ff', height = 200 }) {
  return (
    <div style={{ width: '100%', height: `${height}px` }}>
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color={color} />
        
        <RotatingBlueprint type={type} color={color} />
        
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1} />
      </Canvas>
    </div>
  );
}