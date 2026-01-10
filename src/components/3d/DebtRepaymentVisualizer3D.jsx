import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';

function DebtSnowball({ position, size, color, label }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      <Text position={[0, size + 0.5, 0]} fontSize={0.3} color="white" anchorX="center">
        {label}
      </Text>
    </group>
  );
}

export default function DebtRepaymentVisualizer3D() {
  const debts = [
    { label: 'Credit Card', size: 1.5, color: '#ef4444', pos: [-2, 0, 0] },
    { label: 'Car Loan', size: 1.2, color: '#f59e0b', pos: [0, 0, 0] },
    { label: 'Student', size: 0.8, color: '#10b981', pos: [2, 0, 0] }
  ];

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden" style={{ height: '400px' }}>
      <div className="p-4 border-b border-white/10">
        <h3 className="text-white font-bold">❄️ Debt Snowball Strategy</h3>
        <p className="text-white/60 text-sm">Watch debts shrink as you pay them off</p>
      </div>
      <Canvas camera={{ position: [0, 2, 6], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1} />
        
        {debts.map((debt, i) => (
          <DebtSnowball key={i} {...debt} position={debt.pos} />
        ))}
        
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}