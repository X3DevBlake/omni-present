import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';

function FloatingLogo() {
  const logoRef = useRef();

  useFrame((state) => {
    if (logoRef.current) {
      logoRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.3}>
      <mesh ref={logoRef}>
        <torusKnotGeometry args={[1, 0.3, 128, 16]} />
        <meshStandardMaterial
          color="#00f5ff"
          emissive="#00f5ff"
          emissiveIntensity={0.6}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </Float>
  );
}

function DataStream() {
  const particlesRef = useRef();

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <group ref={particlesRef}>
      {[...Array(30)].map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i / 30) * Math.PI * 2) * 2,
            (i / 30) * 2.5 - 1.25,
            Math.sin((i / 30) * Math.PI * 2) * 2
          ]}
        >
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={1} />
        </mesh>
      ))}
    </group>
  );
}

export default function OmniPresentLogo({ size = 'sm' }) {
  const sizeMap = {
    xs: { height: 'h-12', width: 'w-12' },
    sm: { height: 'h-16', width: 'w-16' },
    md: { height: 'h-24', width: 'w-24' },
    lg: { height: 'h-32', width: 'w-32' },
  };

  const dimensions = sizeMap[size] || sizeMap.sm;

  return (
    <div className={`${dimensions.height} ${dimensions.width} rounded-full overflow-hidden flex-shrink-0`}>
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
        <color attach="background" args={['#0a0a0f']} />
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#00f5ff" />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#a855f7" />

        <FloatingLogo />
        <DataStream />

        <Environment preset="night" />
      </Canvas>
    </div>
  );
}