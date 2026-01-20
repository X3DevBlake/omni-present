import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Cylinder, Line } from '@react-three/drei';
import * as THREE from 'three';

function AssetNode({ position, asset, onClick }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.008;
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.05 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  const priceChange = asset['24h_change'] || 0;
  const color = priceChange >= 0 ? '#10b981' : '#ef4444';

  return (
    <group position={position} onClick={onClick}>
      <Sphere ref={meshRef} args={[0.6, 32, 32]}>
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.7}
          roughness={0.3}
        />
      </Sphere>
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
      >
        {asset.base_asset}/{asset.quote_asset}
      </Text>
      <Text
        position={[0, 0.8, 0]}
        fontSize={0.25}
        color={color}
        anchorX="center"
      >
        ${asset.current_price?.toFixed(2)}
      </Text>
    </group>
  );
}

function LiquidityFlow({ height, totalLiquidity }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Cylinder
      ref={meshRef}
      args={[2, 2, height, 32, 1, true]}
      position={[0, height / 2, 0]}
    >
      <meshStandardMaterial 
        color="#60a5fa"
        transparent
        opacity={0.3}
        side={THREE.DoubleSide}
      />
    </Cylinder>
  );
}

export default function AutonomousMarket3D({ market, onAssetClick }) {
  const assetPairs = market?.asset_pairs || [];
  const liquidity = market?.liquidity_pool?.total_liquidity || 1000000;

  const assetPositions = assetPairs.slice(0, 8).map((asset, i) => {
    const angle = (i / 8) * Math.PI * 2;
    const radius = 5;
    return {
      asset,
      position: [
        Math.cos(angle) * radius,
        Math.sin(angle * 2) * 1.5,
        Math.sin(angle) * radius
      ]
    };
  });

  return (
    <Canvas camera={{ position: [0, 8, 15], fov: 60 }} style={{ height: '700px' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[15, 15, 15]} intensity={1.5} />
      <pointLight position={[-15, 5, -15]} intensity={0.8} color="#60a5fa" />

      {/* Central market engine */}
      <Sphere args={[1.8, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#f59e0b" 
          emissive="#f59e0b" 
          emissiveIntensity={0.7}
          metalness={0.9}
          roughness={0.2}
        />
      </Sphere>

      <Text position={[0, 3, 0]} fontSize={0.7} color="white" anchorX="center">
        Autonomous Market
      </Text>
      <Text position={[0, 2.3, 0]} fontSize={0.3} color="#fbbf24" anchorX="center">
        {market?.market_name || 'DeFi Market'}
      </Text>
      <Text position={[0, 1.8, 0]} fontSize={0.25} color="#60a5fa" anchorX="center">
        Algorithm: {market?.pricing_algorithm || 'AMM'}
      </Text>

      {/* Liquidity visualization */}
      <LiquidityFlow 
        height={6} 
        totalLiquidity={liquidity}
      />

      {/* Asset nodes */}
      {assetPositions.map(({ asset, position }, i) => (
        <AssetNode
          key={i}
          position={position}
          asset={asset}
          onClick={() => onAssetClick?.(asset)}
        />
      ))}

      {/* Market efficiency indicator */}
      <group position={[0, -4, 0]}>
        <Text fontSize={0.4} color="#10b981" anchorX="center">
          Efficiency: {market?.market_efficiency_score?.toFixed(0) || 75}%
        </Text>
        {market?.self_regulation_enabled && (
          <Text position={[0, -0.6, 0]} fontSize={0.25} color="#a78bfa" anchorX="center">
            🤖 Self-Regulating
          </Text>
        )}
      </group>

      <OrbitControls 
        enableZoom={true}
        autoRotate
        autoRotateSpeed={0.5}
        minDistance={10}
        maxDistance={30}
      />
    </Canvas>
  );
}