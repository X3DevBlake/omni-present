import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function WavePool({ pool, position }) {
  const meshRef = useRef();
  const [hovered, setHovered] = React.useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Wave animation based on volume
      const waveHeight = 0.2 * (pool.volume_24h || 0) / 1000000;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * waveHeight;
      
      // Gentle rotation
      meshRef.current.rotation.y += 0.005;
      
      // Scale on hover
      const targetScale = hovered ? 1.2 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });
  
  // Height based on TVL
  const height = 0.5 + (pool.tvl_usd || 0) / 10000000;
  
  // Color based on APY and IL risk
  const apy = pool.apy || 0;
  const ilRisk = pool.impermanent_loss_risk || 0;
  
  // Green for high APY, red for high IL risk
  const color = new THREE.Color().setHSL(
    Math.max(0, 0.3 - ilRisk / 200) * (1 + apy / 100),
    0.7,
    0.5
  );
  
  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <cylinderGeometry args={[0.5, 0.5, height, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.5 : 0.2}
          transparent
          opacity={0.8}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      
      {/* Pool info */}
      <Text
        position={[0, height / 2 + 0.5, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {pool.pool_name}
      </Text>
      
      <Text
        position={[0, height / 2 + 0.2, 0]}
        fontSize={0.15}
        color="#ffd700"
        anchorX="center"
        anchorY="middle"
      >
        APY: {pool.apy?.toFixed(1)}%
      </Text>
      
      {/* IL risk indicator */}
      {ilRisk > 20 && (
        <Sphere args={[0.1, 16, 16]} position={[0.6, height / 2, 0]}>
          <meshStandardMaterial
            color="#ef4444"
            emissive="#ef4444"
            emissiveIntensity={0.8}
          />
        </Sphere>
      )}
      
      {/* Audit status indicator */}
      {pool.smart_contract_audit_status === 'audited' && (
        <Sphere args={[0.08, 16, 16]} position={[-0.6, height / 2, 0]}>
          <meshStandardMaterial
            color="#10b981"
            emissive="#10b981"
            emissiveIntensity={0.8}
          />
        </Sphere>
      )}
    </group>
  );
}

function OceanFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry args={[50, 50, 50, 50]} />
      <meshStandardMaterial
        color="#1e293b"
        wireframe
        transparent
        opacity={0.3}
      />
    </mesh>
  );
}

export default function LiquidityPoolOcean3D({ pools }) {
  // Arrange pools in a grid
  const positions = useMemo(() => {
    if (!pools) return [];
    
    const gridSize = Math.ceil(Math.sqrt(pools.length));
    const spacing = 3;
    
    return pools.map((_, idx) => {
      const row = Math.floor(idx / gridSize);
      const col = idx % gridSize;
      
      return [
        (col - gridSize / 2) * spacing,
        0,
        (row - gridSize / 2) * spacing
      ];
    });
  }, [pools]);
  
  if (!pools || pools.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white">
        <p>No liquidity pool data available</p>
      </div>
    );
  }
  
  return (
    <Canvas camera={{ position: [0, 8, 15], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 10, -10]} intensity={0.5} color="#00f5ff" />
      <directionalLight position={[0, 10, 0]} intensity={0.5} />
      
      {/* Ocean floor */}
      <OceanFloor />
      
      {/* Pool waves */}
      {pools.map((pool, idx) => (
        <WavePool
          key={pool.id || idx}
          pool={pool}
          position={positions[idx]}
        />
      ))}
      
      {/* Summary info */}
      <Text
        position={[0, 5, -8]}
        fontSize={0.4}
        color="white"
        anchorX="center"
      >
        Liquidity Ocean
      </Text>
      
      <Text
        position={[0, 4.3, -8]}
        fontSize={0.2}
        color="#00f5ff"
        anchorX="center"
      >
        {pools.length} Pools • Total TVL: ${pools.reduce((sum, p) => sum + (p.tvl_usd || 0), 0).toLocaleString()}
      </Text>
      
      <OrbitControls
        enableZoom={true}
        minDistance={5}
        maxDistance={30}
        autoRotate
        autoRotateSpeed={0.3}
      />
    </Canvas>
  );
}