import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

function AssetNode({ trade, position, index }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      const scale = 0.5 + (trade.amount / 1000) * 0.5;
      meshRef.current.scale.setScalar(scale);
    }
  });

  const color = trade.action === 'buy' ? '#00ff88' : trade.action === 'sell' ? '#ff4444' : '#00f5ff';

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[1, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          transparent
          opacity={0.8}
        />
      </Sphere>

      <Text
        position={[0, -1.5, 0]}
        fontSize={0.25}
        color="white"
        anchorX="center"
      >
        {trade.token_symbol}
      </Text>

      <Text
        position={[0, 1.8, 0]}
        fontSize={0.2}
        color={color}
        anchorX="center"
      >
        {trade.action?.toUpperCase()}
      </Text>
    </group>
  );
}

export default function DeFiPortfolio3D({ trades = [] }) {
  const recentTrades = trades.slice(0, 15);

  const positions = recentTrades.map((_, index) => {
    const angle = (index / recentTrades.length) * Math.PI * 2;
    const radius = 5;
    return [
      Math.cos(angle) * radius,
      (Math.random() - 0.5) * 3,
      Math.sin(angle) * radius,
    ];
  });

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden bg-black/20">
      <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#00ff88" />

        {/* Central hub */}
        <Sphere args={[1.5, 64, 64]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#a855f7"
            emissive="#a855f7"
            emissiveIntensity={0.8}
            transparent
            opacity={0.4}
            wireframe
          />
        </Sphere>

        {recentTrades.map((trade, index) => (
          <React.Fragment key={trade.id}>
            <AssetNode trade={trade} position={positions[index]} index={index} />
            
            <Line
              points={[[0, 0, 0], positions[index]]}
              color={trade.action === 'buy' ? '#00ff88' : '#ff4444'}
              lineWidth={1}
              transparent
              opacity={0.3}
            />
          </React.Fragment>
        ))}

        <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={1} />
      </Canvas>

      {recentTrades.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white/60">No trades to visualize</p>
        </div>
      )}
    </div>
  );
}