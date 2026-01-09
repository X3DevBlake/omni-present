import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Text3D, Center } from '@react-three/drei';
import { motion } from 'framer-motion';

function BannerScene({ title, color = '#00f5ff' }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Background orbs */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Sphere args={[1.5, 64, 64]} position={[-2, 0, -2]}>
          <MeshDistortMaterial
            color={color}
            attach="material"
            distort={0.4}
            speed={2}
            roughness={0}
            metalness={0.8}
            opacity={0.3}
            transparent
          />
        </Sphere>
      </Float>

      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.3}>
        <Sphere args={[1, 64, 64]} position={[2, 0.5, -1]}>
          <MeshDistortMaterial
            color="#a855f7"
            attach="material"
            distort={0.3}
            speed={1.5}
            roughness={0}
            metalness={0.8}
            opacity={0.3}
            transparent
          />
        </Sphere>
      </Float>

      {/* Floating particles */}
      {Array.from({ length: 30 }).map((_, i) => (
        <Float key={i} speed={1 + Math.random()} rotationIntensity={0.5} floatIntensity={1}>
          <mesh position={[(Math.random() - 0.5) * 8, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
          </mesh>
        </Float>
      ))}

      {/* Light sources */}
      <pointLight position={[5, 5, 5]} intensity={1} color={color} />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#a855f7" />
    </group>
  );
}

export default function Interactive3DBanner({ title, subtitle, color = '#00f5ff', height = '300px' }) {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden" style={{ height }}>
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/80" />
      
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <BannerScene title={title} color={color} />
      </Canvas>

      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
        <motion.h2
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {title}
        </motion.h2>
        {subtitle && (
          <motion.p
            className="text-white/70 text-lg text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </div>
  );
}