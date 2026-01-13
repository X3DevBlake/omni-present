import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text, OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, Zap } from 'lucide-react';

function FloatingDataCube({ position, data, color }) {
  const meshRef = useRef();
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.5;
      meshRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 2) * 0.3;
    }
  });
  
  return (
    <Float speed={1.5} rotationIntensity={0.5}>
      <group position={position}>
        <mesh ref={meshRef}>
          <boxGeometry args={[1, 1, 1]} />
          <meshPhysicalMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.5}
            metalness={0.9}
            roughness={0.1}
            transmission={0.3}
            thickness={0.5}
          />
        </mesh>
        <Text
          position={[0, 1.5, 0]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          outlineWidth={0.05}
          outlineColor="#000000"
        >
          {data.label}
        </Text>
        <Text
          position={[0, 1.1, 0]}
          fontSize={0.5}
          color={color}
          anchorX="center"
          outlineWidth={0.05}
          outlineColor="#000000"
        >
          {data.value}
        </Text>
      </group>
    </Float>
  );
}

export default function Interactive3DStats({ stats }) {
  const statsData = stats || [
    { label: 'Active Agents', value: '24', color: '#00f5ff', position: [-3, 0, 0] },
    { label: 'Tasks/Day', value: '1.2K', color: '#a855f7', position: [0, 0, 0] },
    { label: 'Success Rate', value: '98%', color: '#10b981', position: [3, 0, 0] }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="w-full h-[400px] relative bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 rounded-3xl overflow-hidden border border-cyan-500/20"
    >
      <Canvas camera={{ position: [0, 2, 8], fov: 50 }}>
        <color attach="background" args={['#0a0a0f']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#00f5ff" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#a855f7" />
        
        {statsData.map((stat, idx) => (
          <FloatingDataCube
            key={idx}
            position={stat.position}
            data={stat}
            color={stat.color}
          />
        ))}
        
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
      </Canvas>
      
      <div className="absolute bottom-4 left-4 flex gap-4 text-xs text-white/60">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>Real-time Data</span>
        </div>
      </div>
    </motion.div>
  );
}