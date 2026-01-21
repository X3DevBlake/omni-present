import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedLogo() {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group ref={groupRef}>
        <Text
          fontSize={1.2}
          color="#00f5ff"
          anchorX="center"
          anchorY="middle"
          font={undefined}
        >
          OMNI
          <meshStandardMaterial
            color="#00f5ff"
            emissive="#00f5ff"
            emissiveIntensity={0.5}
          />
        </Text>
      </group>
    </Float>
  );
}

function HologramRings() {
  const ringsRef = useRef();

  useFrame((state) => {
    if (ringsRef.current) {
      ringsRef.current.rotation.z = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <group ref={ringsRef}>
      {[1.5, 2, 2.5].map((radius, idx) => (
        <mesh key={idx} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius, 0.02, 16, 100]} />
          <meshStandardMaterial
            color="#a855f7"
            emissive="#a855f7"
            emissiveIntensity={0.5}
            transparent
            opacity={0.6 - idx * 0.15}
          />
        </mesh>
      ))}
    </group>
  );
}

function CoreSphere() {
  const sphereRef = useRef();

  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
    }
  });

  return (
    <Sphere ref={sphereRef} args={[0.3, 32, 32]} position={[0, 0, -0.5]}>
      <meshStandardMaterial
        color="#00f5ff"
        emissive="#00f5ff"
        emissiveIntensity={1}
        transparent
        opacity={0.7}
      />
    </Sphere>
  );
}

export default function OmniPresent3DLogo() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
      
      <AnimatedLogo />
      <HologramRings />
      <CoreSphere />
    </Canvas>
  );
}