import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float } from '@react-three/drei';
import { motion } from 'framer-motion';

function OmniHologram({ isSpeaking }) {
  const sphereRef = useRef();

  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      
      if (isSpeaking) {
        sphereRef.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.1;
        sphereRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.1;
        sphereRef.current.scale.z = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.1;
      }
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group ref={sphereRef}>
        <Sphere args={[1, 64, 64]}>
          <MeshDistortMaterial
            color={isSpeaking ? "#ec4899" : "#00f5ff"}
            attach="material"
            distort={isSpeaking ? 0.6 : 0.4}
            speed={isSpeaking ? 4 : 2}
            roughness={0}
            metalness={0.8}
            emissive={isSpeaking ? "#ec4899" : "#00f5ff"}
            emissiveIntensity={isSpeaking ? 0.8 : 0.5}
          />
        </Sphere>

        {/* Inner glow */}
        <Sphere args={[0.8, 32, 32]}>
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={isSpeaking ? 0.4 : 0.2}
            emissive="#ffffff"
            emissiveIntensity={isSpeaking ? 0.6 : 0.3}
          />
        </Sphere>

        {/* Orbiting particles */}
        {[...Array(8)].map((_, i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i / 8) * Math.PI * 2) * 1.5,
              Math.sin((i / 8) * Math.PI * 2) * 1.5,
              0
            ]}
          >
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial
              color="#a855f7"
              emissive="#a855f7"
              emissiveIntensity={isSpeaking ? 1 : 0.5}
            />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

export default function OmniVideoCall({ isSpeaking }) {
  return (
    <motion.div
      className="relative w-full h-64 bg-gradient-to-br from-black via-purple-900/20 to-black border-b border-white/10"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 256 }}
      exit={{ opacity: 0, height: 0 }}
    >
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
        <color attach="background" args={['#000000']} />
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00f5ff" />
        <pointLight position={[-10, -10, 10]} intensity={0.5} color="#a855f7" />
        
        <OmniHologram isSpeaking={isSpeaking} />
        
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>

      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-pink-400 animate-pulse' : 'bg-cyan-400'}`} />
          <span className="text-white text-xs">
            {isSpeaking ? 'Omni is speaking...' : 'Omni is listening'}
          </span>
        </div>
      </div>

      {isSpeaking && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              'radial-gradient(circle at center, rgba(236, 72, 153, 0.1) 0%, transparent 70%)',
              'radial-gradient(circle at center, rgba(236, 72, 153, 0.2) 0%, transparent 70%)',
              'radial-gradient(circle at center, rgba(236, 72, 153, 0.1) 0%, transparent 70%)',
            ],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
          }}
        />
      )}
    </motion.div>
  );
}