import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import * as THREE from 'three';

function TokenBuilding({ token, position }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle sway
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime + position[0]) * 0.05;
    }
  });
  
  // Height based on market cap
  const height = Math.max(0.5, (token.market_cap || 1000000) / 1000000000);
  
  // Color based on 24h change
  const priceChange = token.price_24h_change || 0;
  const color = new THREE.Color().setHSL(
    priceChange >= 0 ? 0.3 : 0, // Green for positive, red for negative
    0.7,
    0.5
  );
  
  return (
    <group position={position}>
      <Box
        ref={meshRef}
        args={[0.5, height, 0.5]}
        position={[0, height / 2, 0]}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          metalness={0.6}
          roughness={0.4}
        />
      </Box>
      
      <Text
        position={[0, height + 0.5, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
      >
        {token.token_symbol}
      </Text>
      
      <Text
        position={[0, height + 0.2, 0]}
        fontSize={0.12}
        color={priceChange >= 0 ? '#10b981' : '#ef4444'}
        anchorX="center"
      >
        {priceChange >= 0 ? '+' : ''}{priceChange?.toFixed(2)}%
      </Text>
      
      <Text
        position={[0, -0.3, 0]}
        fontSize={0.1}
        color="#ffd700"
        anchorX="center"
      >
        ${token.current_price_usd?.toFixed(2)}
      </Text>
    </group>
  );
}

export default function CryptoMarketTrends3D({ tokens }) {
  const positions = React.useMemo(() => {
    if (!tokens || tokens.length === 0) return [];
    
    const gridSize = Math.ceil(Math.sqrt(tokens.length));
    const spacing = 2;
    
    return tokens.map((_, idx) => {
      const row = Math.floor(idx / gridSize);
      const col = idx % gridSize;
      
      return [
        (col - gridSize / 2) * spacing,
        0,
        (row - gridSize / 2) * spacing
      ];
    });
  }, [tokens]);
  
  if (!tokens || tokens.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white">
        <p>No crypto data available</p>
      </div>
    );
  }
  
  const totalMarketCap = tokens.reduce((sum, t) => sum + (t.market_cap || 0), 0);
  
  return (
    <Canvas camera={{ position: [5, 8, 12], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#00f5ff" />
      
      {/* Grid floor */}
      <gridHelper args={[20, 20, '#334155', '#1e293b']} position={[0, 0, 0]} />
      
      {/* Token buildings */}
      {tokens.map((token, idx) => (
        <TokenBuilding
          key={token.id || idx}
          token={token}
          position={positions[idx]}
        />
      ))}
      
      <Text
        position={[0, 6, -8]}
        fontSize={0.5}
        color="white"
        anchorX="center"
      >
        Crypto Market Cityscape
      </Text>
      
      <Text
        position={[0, 5.3, -8]}
        fontSize={0.25}
        color="#00f5ff"
        anchorX="center"
      >
        Total Market Cap: ${(totalMarketCap / 1000000000).toFixed(2)}B
      </Text>
      
      <OrbitControls
        enableZoom={true}
        minDistance={5}
        maxDistance={30}
      />
    </Canvas>
  );
}