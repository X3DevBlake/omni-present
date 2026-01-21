import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Float } from '@react-three/drei';
import * as THREE from 'three';

function GlowingLetter({ char, position, delay }) {
  const ref = useRef();
  const glowRef = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + delay) * 0.15;
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + delay) * 0.2;
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3 + delay) * 0.2);
    }
  });

  const letterGeometry = useMemo(() => {
    const shapes = {
      'O': () => (
        <mesh>
          <torusGeometry args={[0.3, 0.12, 16, 32]} />
          <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={0.8} metalness={0.9} roughness={0.1} />
        </mesh>
      ),
      'M': () => (
        <group>
          <Box args={[0.12, 0.7, 0.12]} position={[-0.25, 0, 0]}>
            <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.8} metalness={0.9} roughness={0.1} />
          </Box>
          <Box args={[0.12, 0.7, 0.12]} position={[0.25, 0, 0]}>
            <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.8} metalness={0.9} roughness={0.1} />
          </Box>
          <Box args={[0.12, 0.45, 0.12]} position={[-0.12, 0.1, 0]} rotation={[0, 0, 0.5]}>
            <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.8} metalness={0.9} roughness={0.1} />
          </Box>
          <Box args={[0.12, 0.45, 0.12]} position={[0.12, 0.1, 0]} rotation={[0, 0, -0.5]}>
            <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.8} metalness={0.9} roughness={0.1} />
          </Box>
        </group>
      ),
      'N': () => (
        <group>
          <Box args={[0.12, 0.7, 0.12]} position={[-0.2, 0, 0]}>
            <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.8} metalness={0.9} roughness={0.1} />
          </Box>
          <Box args={[0.12, 0.7, 0.12]} position={[0.2, 0, 0]}>
            <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.8} metalness={0.9} roughness={0.1} />
          </Box>
          <Box args={[0.12, 0.75, 0.12]} position={[0, 0, 0]} rotation={[0, 0, 0.6]}>
            <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.8} metalness={0.9} roughness={0.1} />
          </Box>
        </group>
      ),
      'I': () => (
        <Box args={[0.12, 0.7, 0.12]}>
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.8} metalness={0.9} roughness={0.1} />
        </Box>
      )
    };
    return shapes[char] || shapes['O'];
  }, [char]);

  const LetterComponent = letterGeometry;

  return (
    <group ref={ref} position={position}>
      <LetterComponent />
      <Sphere ref={glowRef} args={[0.5, 16, 16]}>
        <meshBasicMaterial color={char === 'O' ? '#00f5ff' : char === 'M' ? '#a855f7' : char === 'N' ? '#ec4899' : '#10b981'} transparent opacity={0.1} />
      </Sphere>
    </group>
  );
}

function ParticleField() {
  const ref = useRef();
  const count = 200;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#00f5ff" transparent opacity={0.6} />
    </points>
  );
}

function HolographicRings() {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.elapsedTime * 0.3;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <group ref={ref}>
      {[1.5, 2, 2.5].map((radius, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius, 0.02, 16, 64]} />
          <meshBasicMaterial color={['#00f5ff', '#a855f7', '#ec4899'][i]} transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function EnergyCore() {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 4) * 0.2);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5}>
      <Sphere ref={ref} args={[0.3, 32, 32]} position={[0, 0, -2]}>
        <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={2} transparent opacity={0.8} />
      </Sphere>
    </Float>
  );
}

export default function EnhancedOmniText3D() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={1.5} color="#00f5ff" />
        <pointLight position={[-5, 5, -5]} intensity={1} color="#a855f7" />
        <spotLight position={[0, 5, 0]} intensity={0.8} angle={0.5} color="#ec4899" />

        <GlowingLetter char="O" position={[-1.8, 0, 0]} delay={0} />
        <GlowingLetter char="M" position={[-0.6, 0, 0]} delay={0.5} />
        <GlowingLetter char="N" position={[0.6, 0, 0]} delay={1} />
        <GlowingLetter char="I" position={[1.8, 0, 0]} delay={1.5} />

        <ParticleField />
        <HolographicRings />
        <EnergyCore />

        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}