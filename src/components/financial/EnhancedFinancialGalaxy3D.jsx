import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

const AssetPlanet = ({ position, size, color, symbol, value, allocation }) => {
  const mesh = useRef();
  
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.01;
    }
  });

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh ref={mesh}>
          <sphereGeometry args={[size, 32, 32]} />
          <meshStandardMaterial 
            color={color} 
            emissive={color} 
            emissiveIntensity={0.5} 
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
        {/* Orbital Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[size * 1.5, 0.02, 16, 64]} />
          <meshBasicMaterial color={color} transparent opacity={0.3} />
        </mesh>
        
        <Text 
          position={[0, size + 0.5, 0]} 
          fontSize={0.3} 
          color="white" 
          anchorX="center" 
          anchorY="bottom"
        >
          {symbol}
        </Text>
        <Text 
          position={[0, size + 0.2, 0]} 
          fontSize={0.15} 
          color="#ccc" 
          anchorX="center" 
          anchorY="bottom"
        >
          ${value.toLocaleString()} ({allocation}%)
        </Text>
      </Float>
    </group>
  );
};

const ConnectionLines = ({ assets }) => {
  const lines = useMemo(() => {
    const _lines = [];
    for (let i = 0; i < assets.length; i++) {
      for (let j = i + 1; j < assets.length; j++) {
        if (Math.random() > 0.7) { // Random connections
          _lines.push({
            start: assets[i].position,
            end: assets[j].position,
            color: '#ffffff'
          });
        }
      }
    }
    return _lines;
  }, [assets]);

  return (
    <group>
      {lines.map((line, i) => (
        <Line 
          key={i} 
          points={[line.start, line.end]} 
          color={line.color} 
          transparent 
          opacity={0.1} 
          lineWidth={1} 
        />
      ))}
    </group>
  );
};

export default function EnhancedFinancialGalaxy3D({ portfolioData }) {
  // Generate positions in a spiral
  const assets = useMemo(() => {
    if (!portfolioData?.assets) return [];
    return portfolioData.assets.map((asset, i) => {
      const angle = (i / portfolioData.assets.length) * Math.PI * 2;
      const radius = 4 + (i * 0.5);
      return {
        ...asset,
        position: [
          Math.cos(angle) * radius, 
          (Math.random() - 0.5) * 2, 
          Math.sin(angle) * radius
        ],
        size: Math.max(0.3, Math.min(1, asset.allocation_target / 10)),
        color: asset.type === 'Crypto' ? '#8b5cf6' : 
               asset.type === 'Stock' ? '#3b82f6' : 
               asset.type === 'NFT' ? '#ec4899' : '#10b981'
      };
    });
  }, [portfolioData]);

  return (
    <div className="w-full h-[600px] bg-black rounded-xl overflow-hidden relative">
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-2xl font-bold text-white mb-1">Conscious Portfolio Galaxy</h3>
        <div className="flex gap-4 text-sm">
            <span className="text-purple-400">Alignment: {portfolioData?.ethical_alignment_score || 0}%</span>
            <span className="text-blue-400">Risk: {portfolioData?.risk_tolerance || 0}</span>
        </div>
      </div>
      
      <Canvas camera={{ position: [0, 5, 12], fov: 50 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        {/* Central Core (User Consciousness) */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
        </mesh>
        
        {assets.map((asset, i) => (
          <AssetPlanet key={i} {...asset} />
        ))}
        
        <ConnectionLines assets={assets} />
        
        <OrbitControls autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}