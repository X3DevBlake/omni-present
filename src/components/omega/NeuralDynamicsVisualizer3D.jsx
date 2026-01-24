import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Line, Text } from '@react-three/drei';
import * as THREE from 'three';

export const NeuralTrajectory = ({ history, color = '#3b82f6' }) => {
  const lineRef = useRef();
  
  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.material.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });
  
  if (history.length < 2) return null;
  
  const points = history.map((h, idx) => {
    const t = idx / history.length;
    return new THREE.Vector3(
      Math.cos(t * Math.PI * 2) * (2 + t),
      Math.sin(t * Math.PI * 2) * (2 + t),
      t - 0.5
    );
  });
  
  return (
    <Line
      ref={lineRef}
      points={points}
      color={color}
      lineWidth={2}
      transparent
      opacity={0.6}
    />
  );
};

export const StateInertiaIndicator = ({ position, inertia, isActive }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current && isActive) {
      const speed = 1 / (inertia / 100);
      meshRef.current.rotation.z = state.clock.elapsedTime * speed;
    }
  });
  
  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.15, 32, 32]}>
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#f59e0b"
          emissiveIntensity={isActive ? 1.2 : 0.5}
          wireframe
        />
      </Sphere>
      <Text position={[0, -0.3, 0]} fontSize={0.1} color="#fbbf24" anchorX="center">
        {inertia}ms
      </Text>
    </group>
  );
};

export const TelepathyBeam = ({ from, to, active, bidirectional }) => {
  const lineRef = useRef();
  const particleRef = useRef();
  
  useFrame((state) => {
    if (lineRef.current && active) {
      lineRef.current.material.opacity = 0.6 + Math.sin(state.clock.elapsedTime * 4) * 0.3;
    }
    
    if (particleRef.current && active) {
      const t = (state.clock.elapsedTime % 2) / 2;
      const fromVec = new THREE.Vector3(...from);
      const toVec = new THREE.Vector3(...to);
      particleRef.current.position.lerpVectors(fromVec, toVec, bidirectional ? (Math.sin(t * Math.PI * 2) + 1) / 2 : t);
    }
  });
  
  return (
    <group>
      <Line
        ref={lineRef}
        points={[new THREE.Vector3(...from), new THREE.Vector3(...to)]}
        color={bidirectional ? "#ec4899" : "#8b5cf6"}
        lineWidth={3}
        transparent
        opacity={0.7}
      />
      {active && (
        <Sphere ref={particleRef} args={[0.08, 16, 16]} position={from}>
          <meshStandardMaterial
            color="#ec4899"
            emissive="#ec4899"
            emissiveIntensity={1.5}
          />
        </Sphere>
      )}
    </group>
  );
};