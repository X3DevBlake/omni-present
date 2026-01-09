import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Text, MeshDistortMaterial, Sphere } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

function DeviceModel({ device, onFeatureClick }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003;
    }
  });

  const getGeometry = () => {
    switch (device.category) {
      case 'core':
        return <boxGeometry args={[2, 2, 2]} />;
      case 'sensors':
        return <cylinderGeometry args={[0.8, 0.8, 1.5, 32]} />;
      case 'display':
        return <boxGeometry args={[3, 2, 0.3]} />;
      case 'robotics':
        return <capsuleGeometry args={[0.8, 2, 16, 32]} />;
      case 'interface':
        return <sphereGeometry args={[1.2, 32, 32]} />;
      case 'power':
        return <torusGeometry args={[1, 0.4, 16, 100]} />;
      case 'networking':
        return <octahedronGeometry args={[1.5, 0]} />;
      default:
        return <boxGeometry args={[2, 2, 2]} />;
    }
  };

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.2}>
      <mesh ref={meshRef}>
        {getGeometry()}
        <meshStandardMaterial
          color={device.model_color || '#00f5ff'}
          emissive={device.model_color || '#00f5ff'}
          emissiveIntensity={0.4}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Feature points */}
      {device.features?.slice(0, 4).map((feature, i) => {
        const angle = (i / 4) * Math.PI * 2;
        return (
          <group key={i} position={[Math.cos(angle) * 2.5, Math.sin(i) * 0.5, Math.sin(angle) * 2.5]}>
            <Sphere args={[0.1, 16, 16]} onClick={() => onFeatureClick?.(feature)}>
              <meshBasicMaterial color="#00f5ff" />
            </Sphere>
            <Text
              position={[0, 0.3, 0]}
              fontSize={0.15}
              color="white"
              anchorX="center"
              maxWidth={1.5}
            >
              {feature.substring(0, 20)}
            </Text>
          </group>
        );
      })}
    </Float>
  );
}

export default function Device3DViewer({ device, onFeatureClick }) {
  return (
    <div className="w-full h-[500px] bg-black/20 rounded-2xl overflow-hidden border border-white/10 relative">
      <Canvas camera={{ position: [0, 2, 8], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
        
        <DeviceModel device={device} onFeatureClick={onFeatureClick} />
        
        <OrbitControls 
          enableZoom 
          enablePan 
          minDistance={4} 
          maxDistance={15}
          autoRotate={false}
        />
      </Canvas>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl px-6 py-3">
        <p className="text-white/60 text-sm">Drag to rotate • Scroll to zoom • Click features</p>
      </div>

      <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl p-3">
        <div className="text-white text-sm font-medium mb-1">{device.name}</div>
        <div className="text-cyan-400 text-xl font-bold">${device.price}</div>
      </div>
    </div>
  );
}