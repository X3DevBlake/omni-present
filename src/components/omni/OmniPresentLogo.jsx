import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial } from '@react-three/drei';

function FloatingLogo() {
  const logoRef = useRef();

  useFrame((state) => {
    if (logoRef.current) {
      logoRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      logoRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      logoRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });

  return (
    <mesh ref={logoRef}>
      <torusKnotGeometry args={[1, 0.3, 128, 16]} />
      <MeshDistortMaterial
        color="#00f5ff"
        emissive="#00f5ff"
        emissiveIntensity={0.6}
        distort={0.3}
        speed={2}
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  );
}

function DataStream() {
  const particlesRef = useRef();

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <group ref={particlesRef}>
      {[...Array(20)].map((_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const radius = 2;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * radius,
              (Math.random() - 0.5) * 2,
              Math.sin(angle) * radius
            ]}
          >
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial
              color="#a855f7"
              emissive="#a855f7"
              emissiveIntensity={0.8}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export default function OmniPresentLogo({ size = 200 }) {
  return (
    <div style={{ width: size, height: size }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00f5ff" />
        <pointLight position={[-10, -10, 10]} intensity={0.5} color="#a855f7" />
        
        <FloatingLogo />
        <DataStream />
        
        <fog attach="fog" args={['#000000', 5, 15]} />
      </Canvas>
    </div>
  );
}