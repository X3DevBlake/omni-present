import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import * as THREE from 'three';

export default function Agent3DNode({ position, agentName, isActive, dataFlow }) {
  const meshRef = useRef();
  const particlesRef = useRef([]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.01;
      
      if (isActive) {
        meshRef.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
        meshRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
        meshRef.current.scale.z = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      }
    }
  });

  return (
    <group position={position}>
      {/* Main Agent Sphere */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 4]} />
        <meshPhongMaterial
          color={isActive ? '#00f5ff' : '#a855f7'}
          emissive={isActive ? '#00f5ff' : '#a855f7'}
          emissiveIntensity={isActive ? 0.8 : 0.4}
          wireframe={isActive}
        />
      </mesh>

      {/* Outer Glow Ring */}
      <mesh rotation={[Math.PI / 2.5, 0, 0]}>
        <torusGeometry args={[1.5, 0.1, 16, 100]} />
        <meshBasicMaterial
          color={isActive ? '#00f5ff' : '#a855f7'}
          transparent
          opacity={isActive ? 0.8 : 0.4}
        />
      </mesh>

      {/* Data Flow Particles */}
      {dataFlow && (
        <>
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={i} position={[Math.cos((i / 8) * Math.PI * 2) * 2.5, Math.sin((i / 8) * Math.PI * 2) * 2.5, 0]}>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshBasicMaterial color="#00f5ff" />
            </mesh>
          ))}
        </>
      )}

      {/* Connection Lines to Other Agents */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, 0, Math.random() * 10, Math.random() * 10, Math.random() * 10])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#00f5ff" linewidth={2} transparent opacity={0.5} />
      </lineSegments>
    </group>
  );
}