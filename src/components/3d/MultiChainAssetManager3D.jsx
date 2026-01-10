import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Text, Line } from '@react-three/drei';

function ChainIsland({ position, color, label, assets, size }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <group position={position}>
        <mesh ref={meshRef}>
          <cylinderGeometry args={[size, size * 0.8, 1, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.4}
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>
        <Text
          position={[0, size + 1, 0]}
          fontSize={0.4}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
        <Text
          position={[0, -1, 0]}
          fontSize={0.25}
          color="#00f5ff"
          anchorX="center"
          anchorY="middle"
        >
          {assets} assets
        </Text>
      </group>
    </Float>
  );
}

function Bridge({ start, end, active }) {
  const points = [start, end];
  
  return (
    <Line
      points={points}
      color={active ? "#00ff88" : "#ffffff"}
      lineWidth={active ? 3 : 1}
      opacity={active ? 0.8 : 0.3}
      transparent
      dashed={!active}
      dashSize={0.2}
      gapSize={0.1}
    />
  );
}

export default function MultiChainAssetManager3D() {
  const chains = [
    { position: [0, 0, 0], color: '#627eea', label: 'Ethereum', assets: 12, size: 1.5 },
    { position: [4, 0.5, 2], color: '#8247e5', label: 'Polygon', assets: 8, size: 1.2 },
    { position: [-4, -0.5, 2], color: '#e84142', label: 'Avalanche', assets: 5, size: 1 },
    { position: [0, 1, -4], color: '#000000', label: 'Arbitrum', assets: 7, size: 1.1 },
    { position: [4, -0.5, -2], color: '#f0b90b', label: 'BSC', assets: 6, size: 1 },
  ];

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden" style={{ height: '600px' }}>
      <div className="p-4 border-b border-white/10">
        <h3 className="text-white font-bold text-xl">🌐 Multi-Chain Asset Manager</h3>
        <p className="text-white/60 text-sm">Navigate your assets across blockchain islands</p>
      </div>
      <Canvas camera={{ position: [8, 6, 8], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, 5, -10]} intensity={0.5} color="#a855f7" />
        
        {/* Bridges between chains */}
        {chains.map((chain1, i) =>
          chains.slice(i + 1).map((chain2, j) => (
            <Bridge
              key={`${i}-${j}`}
              start={chain1.position}
              end={chain2.position}
              active={Math.random() > 0.7}
            />
          ))
        )}
        
        {chains.map((chain, i) => (
          <ChainIsland key={i} {...chain} />
        ))}
        
        <OrbitControls enableZoom autoRotate autoRotateSpeed={0.3} />
      </Canvas>
    </div>
  );
}