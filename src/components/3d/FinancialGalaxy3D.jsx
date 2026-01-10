import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Text } from '@react-three/drei';
import * as THREE from 'three';

function Planet({ position, size, color, label, balance }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group position={position}>
        <mesh ref={meshRef}>
          <sphereGeometry args={[size, 32, 32]} />
          <meshStandardMaterial 
            color={color}
            emissive={color}
            emissiveIntensity={0.3}
            roughness={0.5}
            metalness={0.8}
          />
        </mesh>
        <Text
          position={[0, size + 0.5, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
        <Text
          position={[0, -size - 0.5, 0]}
          fontSize={0.2}
          color="#00f5ff"
          anchorX="center"
          anchorY="middle"
        >
          ${balance.toLocaleString()}
        </Text>
      </group>
    </Float>
  );
}

function TransactionMoon({ planetPosition, orbitRadius, speed, color }) {
  const moonRef = useRef();
  
  useFrame((state) => {
    if (moonRef.current) {
      const time = state.clock.getElapsedTime() * speed;
      moonRef.current.position.x = planetPosition[0] + Math.cos(time) * orbitRadius;
      moonRef.current.position.z = planetPosition[2] + Math.sin(time) * orbitRadius;
      moonRef.current.position.y = planetPosition[1] + Math.sin(time * 2) * 0.2;
    }
  });

  return (
    <mesh ref={moonRef}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
    </mesh>
  );
}

function Stars() {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 1000; i++) {
      const x = (Math.random() - 0.5) * 50;
      const y = (Math.random() - 0.5) * 50;
      const z = (Math.random() - 0.5) * 50;
      pts.push(x, y, z);
    }
    return new Float32Array(pts);
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length / 3}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#ffffff" transparent opacity={0.6} />
    </points>
  );
}

export default function FinancialGalaxy3D() {
  const accounts = [
    { label: 'Checking', position: [0, 0, 0], size: 1.5, color: '#00f5ff', balance: 12500, moons: 3 },
    { label: 'Savings', position: [5, 1, 2], size: 2, color: '#a855f7', balance: 45000, moons: 5 },
    { label: 'Investment', position: [-4, -1, 3], size: 1.8, color: '#ec4899', balance: 78500, moons: 7 },
    { label: 'Crypto', position: [3, 2, -4], size: 1.2, color: '#3b82f6', balance: 23400, moons: 4 },
    { label: 'Emergency', position: [-3, -2, -2], size: 1, color: '#10b981', balance: 15000, moons: 2 },
  ];

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden" style={{ height: '600px' }}>
      <div className="p-4 border-b border-white/10">
        <h3 className="text-white font-bold text-xl">🌌 Your Financial Galaxy</h3>
        <p className="text-white/60 text-sm">Each planet represents an account, moons show recent transactions</p>
      </div>
      <Canvas camera={{ position: [8, 5, 8], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00f5ff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
        
        <Stars />
        
        {accounts.map((account, i) => (
          <React.Fragment key={i}>
            <Planet {...account} />
            {Array.from({ length: account.moons }).map((_, j) => (
              <TransactionMoon
                key={j}
                planetPosition={account.position}
                orbitRadius={account.size + 0.5 + j * 0.3}
                speed={0.5 + j * 0.2}
                color={account.color}
              />
            ))}
          </React.Fragment>
        ))}
        
        <OrbitControls enableZoom autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}