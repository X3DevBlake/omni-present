import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, useGLTF, MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function LogoCore() {
  const meshRef = useRef();
  const particlesRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
    
    if (particlesRef.current) {
      particlesRef.current.rotation.y -= 0.003;
      particlesRef.current.rotation.z += 0.002;
    }
  });

  const particles = new Array(100).fill(null).map((_, i) => {
    const angle = (i / 100) * Math.PI * 2;
    const radius = 2 + Math.random() * 1;
    return {
      position: [
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 3,
        Math.sin(angle) * radius
      ],
      scale: 0.05 + Math.random() * 0.05
    };
  });

  return (
    <group>
      {/* Central sphere with distortion */}
      <Sphere ref={meshRef} args={[1.5, 64, 64]}>
        <MeshDistortMaterial
          color="#00f5ff"
          emissive="#00f5ff"
          emissiveIntensity={0.8}
          metalness={0.9}
          roughness={0.1}
          distort={0.3}
          speed={2}
        />
      </Sphere>

      {/* Orbiting ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2, 0.1, 16, 100]} />
        <meshStandardMaterial
          color="#a855f7"
          emissive="#a855f7"
          emissiveIntensity={0.6}
          metalness={0.8}
        />
      </mesh>

      {/* Particle field */}
      <group ref={particlesRef}>
        {particles.map((particle, i) => (
          <mesh key={i} position={particle.position}>
            <sphereGeometry args={[particle.scale, 8, 8]} />
            <meshBasicMaterial
              color={i % 2 === 0 ? '#00f5ff' : '#a855f7'}
              transparent
              opacity={0.6}
            />
          </mesh>
        ))}
      </group>

      {/* Outer wireframe */}
      <mesh>
        <icosahedronGeometry args={[2.5, 0]} />
        <meshBasicMaterial color="#ffffff" wireframe opacity={0.2} transparent />
      </mesh>
    </group>
  );
}

export default function OmniPresent3DLogo() {
  return (
    <div className="w-full h-[500px]">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#a855f7" />
        <pointLight position={[0, 10, 0]} intensity={0.8} color="#00f5ff" />
        
        <LogoCore />
        
        <Text position={[0, -4, 0]} fontSize={0.6} color="#ffffff" letterSpacing={0.1}>
          OMNI-PRESENT
        </Text>
        <Text position={[0, -4.8, 0]} fontSize={0.2} color="#00f5ff">
          The Future of AI Agent Collaboration
        </Text>
        
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          autoRotate
          autoRotateSpeed={2}
          enableZoom={false}
          enablePan={false}
        />
      </Canvas>
    </div>
  );
}