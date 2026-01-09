import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Text, OrbitControls, Environment } from '@react-three/drei';
import { motion } from 'framer-motion';

function TokenMesh() {
  const meshRef = useRef();
  const particlesRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y -= 0.002;
    }
  });

  return (
    <group>
      {/* Main token sphere */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh ref={meshRef}>
          <sphereGeometry args={[2, 64, 64]} />
          <MeshDistortMaterial
            color="#00f5ff"
            attach="material"
            distort={0.3}
            speed={2}
            roughness={0.1}
            metalness={0.8}
          />
        </mesh>
      </Float>

      {/* Omni text on token */}
      <Float speed={1.5} floatIntensity={0.3}>
        <Text
          position={[0, 0, 2.1]}
          fontSize={0.5}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          OMNI
        </Text>
      </Float>

      {/* Orbiting ring */}
      <mesh rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[3, 0.05, 16, 100]} />
        <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.5} />
      </mesh>

      {/* Particle field */}
      <group ref={particlesRef}>
        {Array.from({ length: 50 }).map((_, i) => {
          const angle = (i / 50) * Math.PI * 2;
          const radius = 4 + Math.random() * 2;
          const x = Math.cos(angle) * radius;
          const y = (Math.random() - 0.5) * 6;
          const z = Math.sin(angle) * radius;
          
          return (
            <Float key={i} speed={1 + Math.random()} rotationIntensity={0.5} floatIntensity={1}>
              <mesh position={[x, y, z]}>
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshStandardMaterial 
                  color="#00f5ff" 
                  emissive="#00f5ff" 
                  emissiveIntensity={0.5}
                />
              </mesh>
            </Float>
          );
        })}
      </group>

      {/* Lighting */}
      <pointLight position={[10, 10, 10]} intensity={1} color="#00f5ff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
      <ambientLight intensity={0.3} />
    </group>
  );
}

export default function OmniToken3D({ height = '500px' }) {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-br from-black/60 to-black/80 border border-white/10" style={{ height }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <Environment preset="night" />
        <TokenMesh />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl px-6 py-3">
        <div className="text-center">
          <div className="text-white/60 text-xs mb-1">Omni Token</div>
          <div className="text-cyan-400 text-2xl font-bold">$0.0245</div>
        </div>
      </div>
    </div>
  );
}