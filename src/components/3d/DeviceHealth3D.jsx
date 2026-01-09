import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text, Html } from '@react-three/drei';
import { motion } from 'framer-motion';

function Device3DModel({ health }) {
  const meshRef = useRef();
  const particlesRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
    
    if (particlesRef.current) {
      particlesRef.current.rotation.y = -state.clock.elapsedTime * 0.3;
    }
  });

  const getHealthColor = () => {
    if (health > 80) return '#10b981'; // green
    if (health > 50) return '#eab308'; // yellow
    return '#ef4444'; // red
  };

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={meshRef}>
        {/* Device body */}
        <mesh>
          <boxGeometry args={[1.5, 2, 0.5]} />
          <meshStandardMaterial
            color={getHealthColor()}
            metalness={0.8}
            roughness={0.2}
            emissive={getHealthColor()}
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Screen */}
        <mesh position={[0, 0, 0.26]}>
          <planeGeometry args={[1.3, 1.7]} />
          <meshStandardMaterial color="#000000" />
        </mesh>

        {/* Health indicator ring */}
        <group ref={particlesRef}>
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const radius = 1.2;
            return (
              <mesh
                key={i}
                position={[
                  Math.cos(angle) * radius,
                  Math.sin(angle) * radius,
                  0
                ]}
              >
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshStandardMaterial
                  color={getHealthColor()}
                  emissive={getHealthColor()}
                  emissiveIntensity={1}
                />
              </mesh>
            );
          })}
        </group>

        {/* Data streams */}
        {health > 50 && Array.from({ length: 5 }).map((_, i) => (
          <Float key={i} speed={2 + i} rotationIntensity={0} floatIntensity={2}>
            <mesh position={[(Math.random() - 0.5) * 2, -1.5 + i * 0.5, 0.3]}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={2} />
            </mesh>
          </Float>
        ))}
      </group>
    </Float>
  );
}

export default function DeviceHealth3D({ deviceName, health, metrics }) {
  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
      <div className="h-64 relative">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <ambientLight intensity={0.3} />
          <pointLight position={[5, 5, 5]} intensity={1} />
          <pointLight position={[-5, -5, -5]} intensity={0.5} color="#00f5ff" />
          <Device3DModel health={health} />
        </Canvas>

        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md rounded-lg px-3 py-2 border border-white/20">
          <div className="text-white font-bold">{deviceName}</div>
          <div className={`text-sm font-semibold ${
            health > 80 ? 'text-green-400' :
            health > 50 ? 'text-yellow-400' :
            'text-red-400'
          }`}>
            Health: {health}%
          </div>
        </div>

        {metrics && (
          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md rounded-lg p-3 border border-white/20 space-y-1">
            {Object.entries(metrics).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between gap-3">
                <span className="text-white/60 text-xs capitalize">{key}</span>
                <span className="text-white text-xs font-semibold">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}