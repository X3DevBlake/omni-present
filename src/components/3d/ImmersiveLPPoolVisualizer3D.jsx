import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Text } from '@react-three/drei';

function LiquidityPool({ position, size, color, label, tvl }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.2;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <group position={position}>
        <mesh ref={meshRef}>
          <cylinderGeometry args={[size, size * 0.8, size * 1.5, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.4}
            transparent
            opacity={0.8}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
        <Text position={[0, size + 1, 0]} fontSize={0.3} color="white" anchorX="center">
          {label}
        </Text>
        <Text position={[0, -size - 0.5, 0]} fontSize={0.2} color="#00f5ff" anchorX="center">
          ${tvl}
        </Text>
      </group>
    </Float>
  );
}

export default function ImmersiveLPPoolVisualizer3D() {
  const pools = [
    { label: 'ETH/USDC', size: 1.5, color: '#627eea', tvl: '450M', pos: [-3, 0, 0] },
    { label: 'BTC/ETH', size: 1.8, color: '#f7931a', tvl: '680M', pos: [0, 0, 0] },
    { label: 'OMNI/USDT', size: 1.3, color: '#a855f7', tvl: '320M', pos: [3, 0, 0] }
  ];

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden" style={{ height: '600px' }}>
      <div className="p-4 border-b border-white/10">
        <h3 className="text-white font-bold text-xl">💧 Liquidity Pool Ocean</h3>
        <p className="text-white/60 text-sm">Interactive 3D visualization of liquidity pools</p>
      </div>
      <Canvas camera={{ position: [0, 3, 8], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00f5ff" />
        <pointLight position={[-10, 5, -10]} intensity={0.5} color="#a855f7" />
        
        {pools.map((pool, i) => (
          <LiquidityPool key={i} {...pool} position={pool.pos} />
        ))}
        
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#001122" opacity={0.5} transparent />
        </mesh>
        
        <OrbitControls enableZoom autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}