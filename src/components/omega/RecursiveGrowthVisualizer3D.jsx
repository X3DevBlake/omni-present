import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Line, Text } from '@react-three/drei';
import * as THREE from 'three';

export const RecursiveGrowthNode = ({ position, capital, month, isActive }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current && isActive) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.8;
      const pulse = Math.sin(state.clock.elapsedTime * 4) * 0.15;
      meshRef.current.scale.setScalar(0.3 + (capital / 1000000) + pulse);
    }
  });
  
  const intensity = Math.min(capital / 500000, 2);
  
  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.2, 32, 32]}>
        <meshStandardMaterial
          color="#10b981"
          emissive="#10b981"
          emissiveIntensity={intensity}
        />
      </Sphere>
      <Text position={[0, -0.4, 0]} fontSize={0.12} color="#6ee7b7" anchorX="center">
        M{month}
      </Text>
      <Text position={[0, 0.4, 0]} fontSize={0.1} color="white" anchorX="center">
        ${(capital / 1000).toFixed(0)}K
      </Text>
    </group>
  );
};

export const RecursiveConnection = ({ from, to, strength }) => {
  const lineRef = useRef();
  
  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 3 + strength) * 0.2;
    }
  });
  
  return (
    <Line
      ref={lineRef}
      points={[new THREE.Vector3(...from), new THREE.Vector3(...to)]}
      color="#34d399"
      lineWidth={1 + strength * 2}
      transparent
      opacity={0.5}
    />
  );
};