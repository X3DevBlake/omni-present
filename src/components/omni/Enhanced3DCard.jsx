import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sphere, TorusKnot, Tetrahedron } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

function Interactive3DObject({ color, shape = 'sphere' }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.x += 0.003;
      if (hovered) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.15, 1.15, 1.15), 0.1);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  const shapes = {
    sphere: <Sphere args={[1.2, 32, 32]} />,
    torusknot: <TorusKnot args={[1, 0.4, 128, 16]} />,
    tetrahedron: <Tetrahedron args={[1.2, 0]} />
  };

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.4}>
      <mesh
        ref={meshRef}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        {shapes[shape]}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.8 : 0.4}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      {hovered && (
        <mesh>
          {shapes[shape]}
          <meshBasicMaterial color={color} transparent opacity={0.15} wireframe />
        </mesh>
      )}
    </Float>
  );
}

export default function Enhanced3DCard({ item, delay }) {
  const colors = {
    wallet: '#00f5ff',
    trading: '#10b981',
    staking: '#f59e0b',
    portfolio: '#a855f7',
    cards: '#ec4899',
    liquidity: '#3b82f6'
  };

  const shapes = {
    wallet: 'sphere',
    trading: 'torusknot',
    staking: 'tetrahedron'
  };

  const colorKey = Object.keys(colors).find(key => item.title.toLowerCase().includes(key)) || 'wallet';
  const shapeKey = Object.keys(shapes).find(key => item.title.toLowerCase().includes(key)) || 'sphere';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="group h-full"
    >
      <div className={`bg-gradient-to-br ${item.gradient} border ${item.border} rounded-2xl p-6 h-full flex flex-col overflow-hidden relative group-hover:shadow-2xl transition-all duration-300`}>
        {/* 3D Canvas Background */}
        <div className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity">
          <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
            <ambientLight intensity={0.4} />
            <pointLight position={[5, 5, 5]} intensity={0.8} color={colors[colorKey]} />
            <Interactive3DObject color={colors[colorKey]} shape={shapeKey} />
            <OrbitControls autoRotate autoRotateSpeed={1} enableZoom={false} enablePan={false} />
          </Canvas>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-black/60 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform border border-white/20">
              <item.icon className="w-6 h-6 text-white" />
            </div>
            <div className="px-2 py-1 bg-black/40 rounded-lg text-xs text-white/60 group-hover:text-white/80 transition-colors">
              ✨ Interactive
            </div>
          </div>
          <h3 className="text-white font-bold text-lg mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all">
            {item.title}
          </h3>
          <p className="text-white/60 text-sm leading-relaxed group-hover:text-white/80 transition-colors">
            {item.description}
          </p>
        </div>

        {/* Hover Border Animation */}
        <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-cyan-400/50 transition-all duration-300 pointer-events-none" />
      </div>
    </motion.div>
  );
}