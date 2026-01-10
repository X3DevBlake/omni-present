import React, { useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Line, MeshDistortMaterial } from '@react-three/drei';
import { motion } from 'framer-motion';

function PoolNode({ position, pool, onClick }) {
  const meshRef = React.useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.3;
    }
  });

  const getColor = () => {
    if (pool.apy > 800) return '#10b981';
    if (pool.apy > 500) return '#00f5ff';
    return '#a855f7';
  };

  return (
    <group position={position} onClick={onClick}>
      <mesh ref={meshRef}>
        <Sphere args={[0.8, 32, 32]}>
          <MeshDistortMaterial
            color={getColor()}
            emissive={getColor()}
            emissiveIntensity={0.6}
            distort={0.3}
            speed={2}
            roughness={0.2}
            metalness={0.8}
          />
        </Sphere>
      </mesh>
      <Text position={[0, -1.5, 0]} fontSize={0.3} color="white">
        {pool.name}
      </Text>
      <Text position={[0, -2, 0]} fontSize={0.2} color="#00f5ff">
        {pool.apy}% APY
      </Text>
    </group>
  );
}

export default function Enhanced3DLiquidityPools({ pools, onPoolSelect }) {
  const poolPositions = [
    [-4, 2, 0],
    [0, 2, -3],
    [4, 2, 0],
    [0, 2, 3]
  ];

  return (
    <div className="h-96 bg-black/20 rounded-2xl overflow-hidden border border-white/10">
      <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00f5ff" />
        
        {/* Central Hub */}
        <mesh position={[0, 0, 0]}>
          <Sphere args={[1, 32, 32]}>
            <meshStandardMaterial
              color="#a855f7"
              emissive="#a855f7"
              emissiveIntensity={0.4}
              roughness={0.3}
              metalness={0.7}
            />
          </Sphere>
        </mesh>
        <Text position={[0, -1.8, 0]} fontSize={0.35} color="#a855f7">
          Liquidity Hub
        </Text>

        {/* Pool Nodes */}
        {pools.map((pool, idx) => (
          <PoolNode
            key={pool.id}
            position={poolPositions[idx] || [0, 2, 0]}
            pool={pool}
            onClick={() => onPoolSelect(pool)}
          />
        ))}

        {/* Connection Lines */}
        {pools.map((pool, idx) => (
          <Line
            key={`line-${pool.id}`}
            points={[[0, 0, 0], poolPositions[idx] || [0, 2, 0]]}
            color="#00f5ff"
            lineWidth={2}
            opacity={0.5}
          />
        ))}

        <OrbitControls enableZoom autoRotate autoRotateSpeed={0.5} />
        <gridHelper args={[20, 20, '#ffffff20', '#ffffff10']} />
      </Canvas>
    </div>
  );
}