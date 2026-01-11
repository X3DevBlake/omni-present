import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

function BuildingBlock({ position, price, volume, name, color }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.scale.y = 2 + (volume / 1000) * 0.5 + (hovered ? 0.3 : 0);
      meshRef.current.material.emissiveIntensity = hovered ? 0.8 : 0.3;
    }
  });

  const height = 2 + (volume / 1000) * 0.5;

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      scale={[1, height, 1]}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.3}
        metalness={0.6}
        roughness={0.2}
        wireframe={false}
      />
    </mesh>
  );
}

function CityScene({ assets }) {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0003;
    }
  });

  const colors = ['#00f5ff', '#a855f7', '#ec4899', '#3b82f6', '#10b981'];

  return (
    <Float speed={0.5} rotationIntensity={0.1}>
      <group ref={groupRef}>
        {assets.map((asset, idx) => (
          <BuildingBlock
            key={idx}
            position={[
              (idx % 5) * 2.5 - 5,
              0,
              Math.floor(idx / 5) * 2.5 - 5
            ]}
            price={asset.price}
            volume={asset.volume}
            name={asset.name}
            color={colors[idx % colors.length]}
          />
        ))}

        {/* Ground grid */}
        <mesh position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[20, 20, 20, 20]} />
          <meshStandardMaterial
            color="#0a0a0f"
            wireframe={true}
            transparent={true}
            opacity={0.1}
          />
        </mesh>
      </group>
    </Float>
  );
}

export default function FinancialMarket3DCityscape() {
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    const mockAssets = [
      { name: 'OMNI', price: 245.32, volume: 12500, change: 5.2 },
      { name: 'ETH', price: 3456.78, volume: 8900, change: 3.1 },
      { name: 'BTC', price: 98765.43, volume: 6700, change: 2.8 },
      { name: 'USDT', price: 1.0, volume: 15600, change: 0.1 },
      { name: 'SOL', price: 187.45, volume: 5400, change: 4.2 },
      { name: 'ADA', price: 0.98, volume: 4200, change: 1.5 },
      { name: 'XRP', price: 2.34, volume: 7800, change: 2.9 },
      { name: 'MATIC', price: 0.52, volume: 3100, change: 3.7 },
      { name: 'AVAX', price: 45.67, volume: 2900, change: 1.2 },
      { name: 'LINK', price: 32.11, volume: 3400, change: 2.4 }
    ];
    setAssets(mockAssets);
  }, []);

  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [10, 8, 10], fov: 60 }}>
        <color attach="background" args={['#0a0a0f']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 15, 10]} intensity={2} color="#00f5ff" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#a855f7" />

        <CityScene assets={assets} />

        <OrbitControls enableZoom autoRotate autoRotateSpeed={0.3} />
      </Canvas>

      {/* Asset Legend */}
      <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-xl border border-cyan-500/30 rounded-lg p-4 max-w-xs">
        <h3 className="text-white font-bold text-sm mb-3">Market Assets (Building Height = Volume)</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {assets.slice(0, 6).map(asset => (
            <div key={asset.name} className="text-white/70">
              <span className="font-semibold text-cyan-400">{asset.name}</span>
              <div className="text-white/50">${asset.price.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}