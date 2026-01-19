import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

function AssetPile({ asset, position }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
    }
  });
  
  const height = Math.max(0.5, (asset.value_usd / 100000));
  
  return (
    <group position={position}>
      <Cylinder
        ref={meshRef}
        args={[0.4, 0.4, height, 32]}
        position={[0, height / 2, 0]}
      >
        <meshStandardMaterial
          color="#ffd700"
          emissive="#ffd700"
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </Cylinder>
      
      <Text
        position={[0, height + 0.5, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
      >
        {asset.symbol}
      </Text>
      
      <Text
        position={[0, height + 0.2, 0]}
        fontSize={0.15}
        color="#ffd700"
        anchorX="center"
      >
        ${(asset.value_usd / 1000).toFixed(0)}K
      </Text>
    </group>
  );
}

export default function TreasuryFlow3D({ treasury }) {
  if (!treasury) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white">
        <p>No treasury data available</p>
      </div>
    );
  }
  
  const assets = treasury.asset_holdings || [];
  
  const positions = React.useMemo(() => {
    return assets.map((_, idx) => {
      const angle = (idx / assets.length) * Math.PI * 2;
      const radius = 3;
      
      return [
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      ];
    });
  }, [assets]);
  
  return (
    <Canvas camera={{ position: [0, 6, 10], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#ffd700" />
      
      {/* Central treasury vault */}
      <Sphere args={[0.8, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#1e293b"
          emissive="#ffd700"
          emissiveIntensity={0.3}
          metalness={0.9}
          roughness={0.1}
        />
      </Sphere>
      
      <Text
        position={[0, 0, 0]}
        fontSize={0.25}
        color="#ffd700"
        anchorX="center"
      >
        ${(treasury.total_balance_usd / 1000000).toFixed(2)}M
      </Text>
      
      {/* Asset piles */}
      {assets.map((asset, idx) => (
        <AssetPile
          key={idx}
          asset={asset}
          position={positions[idx]}
        />
      ))}
      
      <Text
        position={[0, 5, -5]}
        fontSize={0.5}
        color="white"
        anchorX="center"
      >
        Treasury Assets
      </Text>
      
      <Text
        position={[0, 4.3, -5]}
        fontSize={0.2}
        color="#10b981"
        anchorX="center"
      >
        {assets.length} Asset Types
      </Text>
      
      <OrbitControls
        enableZoom={true}
        minDistance={3}
        maxDistance={20}
        autoRotate
        autoRotateSpeed={0.3}
      />
    </Canvas>
  );
}