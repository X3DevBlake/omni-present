import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Text3D, Center, Environment } from '@react-three/drei';
import { motion } from 'framer-motion';

function FloatingLogo() {
  const logoRef = useRef();

  useFrame((state) => {
    if (logoRef.current) {
      logoRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={logoRef}>
        <torusKnotGeometry args={[1, 0.3, 128, 16]} />
        <meshStandardMaterial
          color="#00f5ff"
          emissive="#00f5ff"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </Float>
  );
}

function DataStream({ position, color }) {
  const particlesRef = useRef();

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <group position={position} ref={particlesRef}>
      {[...Array(50)].map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i / 50) * Math.PI * 2) * 3,
            (i / 50) * 4 - 2,
            Math.sin((i / 50) * Math.PI * 2) * 3
          ]}
        >
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
        </mesh>
      ))}
    </group>
  );
}

export default function Immersive3DAbout() {
  return (
    <div className="h-[400px] w-full rounded-2xl overflow-hidden mb-12">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <color attach="background" args={['#0a0a0f']} />
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00f5ff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />

        <FloatingLogo />
        <DataStream position={[0, 0, 0]} color="#00f5ff" />

        <Environment preset="night" />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>

      <div className="relative -mt-[400px] pointer-events-none flex items-center justify-center h-[400px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <h2 className="text-6xl font-bold text-white mb-4 drop-shadow-[0_0_20px_rgba(0,245,255,0.5)]">
            Omni<span className="text-cyan-400">Present</span>
          </h2>
          <p className="text-white/80 text-xl">Building the Future of AI</p>
        </motion.div>
      </div>
    </div>
  );
}