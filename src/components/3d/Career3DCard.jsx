import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import { motion } from 'framer-motion';

function CardMesh({ title, color }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  return (
    <Float speed={2} rotationIntensity={hovered ? 1 : 0.3} floatIntensity={hovered ? 0.5 : 0.2}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.15 : 1}
      >
        <boxGeometry args={[2, 3, 0.3]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} emissive={color} emissiveIntensity={0.5} />
      </mesh>
    </Float>
  );
}

export default function Career3DCard({ title, description, color = '#00f5ff', onClick }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      className="cursor-pointer relative"
    >
      <div className="h-80 bg-black/40 rounded-2xl border border-white/20 overflow-hidden mb-4">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <CardMesh title={title} color={color} />
          <OrbitControls autoRotate autoRotateSpeed={4} enableZoom={false} />
        </Canvas>
      </div>
      <div className="p-4">
        <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
        <p className="text-white/60 text-sm line-clamp-2">{description}</p>
      </div>
    </motion.div>
  );
}