import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

function ActivityParticle({ activity, index }) {
  const meshRef = useRef();
  const speed = 0.02 + Math.random() * 0.03;
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y += speed;
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.02;
      
      if (meshRef.current.position.y > 8) {
        meshRef.current.position.y = -8;
      }
      
      const opacity = Math.sin(state.clock.elapsedTime * 2 + index) * 0.3 + 0.7;
      if (meshRef.current.material) {
        meshRef.current.material.opacity = opacity;
      }
    }
  });

  const getColor = () => {
    switch (activity.activity_type) {
      case 'page_view': return '#00f5ff';
      case 'feature_usage': return '#a855f7';
      case 'entity_creation': return '#44ff44';
      case 'collaboration': return '#ec4899';
      case 'achievement': return '#ffaa00';
      default: return '#ffffff';
    }
  };

  const startY = -8 + (index * 0.5);
  const x = Math.cos(index * 0.8) * 3;
  const z = Math.sin(index * 0.8) * 2;

  return (
    <group>
      <mesh ref={meshRef} position={[x, startY, z]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color={getColor()}
          emissive={getColor()}
          emissiveIntensity={0.8}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      <Html position={[x, startY, z]} distanceFactor={8}>
        <div className="bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none backdrop-blur-sm">
          {activity.activity_details?.page_name || activity.activity_type}
        </div>
      </Html>
    </group>
  );
}

export default function RealTimeActivityStream3D({ activities = [] }) {
  return (
    <div className="w-full h-[500px] bg-black/20 rounded-xl overflow-hidden">
      <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[0, -10, 5]} intensity={0.7} color="#a855f7" />
        
        <Text position={[0, 7, 0]} fontSize={0.4} color="#00f5ff">
          Live Activity Stream
        </Text>

        {activities.slice(0, 30).map((activity, i) => (
          <ActivityParticle key={activity.id || i} activity={activity} index={i} />
        ))}

        <group position={[0, -7, 0]}>
          <Text fontSize={0.15} color="#ffffff">
            {activities.length} Recent Activities
          </Text>
        </group>
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}