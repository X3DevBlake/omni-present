import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';

function SpendingBar({ position, height, color, label, value }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} position={[0, height / 2, 0]}>
        <boxGeometry args={[0.8, height, 0.8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      <Text position={[0, -0.5, 0]} fontSize={0.2} color="white" anchorX="center">
        {label}
      </Text>
      <Text position={[0, height + 0.5, 0]} fontSize={0.25} color="#00f5ff" anchorX="center">
        ${value}
      </Text>
    </group>
  );
}

export default function RealTimeSpendingInsights3D() {
  const categories = [
    { label: 'Food', value: 450, color: '#ec4899', pos: [-3, 0, 0] },
    { label: 'Transport', value: 230, color: '#3b82f6', pos: [-1.5, 0, 0] },
    { label: 'Entertainment', value: 180, color: '#a855f7', pos: [0, 0, 0] },
    { label: 'Bills', value: 890, color: '#ef4444', pos: [1.5, 0, 0] },
    { label: 'Shopping', value: 320, color: '#f59e0b', pos: [3, 0, 0] }
  ];

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden" style={{ height: '400px' }}>
      <div className="p-4 border-b border-white/10">
        <h3 className="text-white font-bold">📊 Spending by Category (This Month)</h3>
      </div>
      <Canvas camera={{ position: [0, 3, 8], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1} />
        
        {categories.map((cat, i) => (
          <SpendingBar
            key={i}
            position={cat.pos}
            height={cat.value / 200}
            color={cat.color}
            label={cat.label}
            value={cat.value}
          />
        ))}
        
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}