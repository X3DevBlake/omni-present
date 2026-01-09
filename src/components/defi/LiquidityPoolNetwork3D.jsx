import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Torus } from '@react-three/drei';
import * as THREE from 'three';

function PoolNode({ position, color, label, apy, tvl }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime) * 0.01;
    }
  });

  return (
    <group>
      {/* Pool Sphere */}
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhongMaterial color={color} emissive={color} emissiveIntensity={0.7} />
      </mesh>

      {/* Ring representing APY */}
      <mesh position={position} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[1.5, 0.15, 16, 100]} />
        <meshBasicMaterial color={color} transparent opacity={Math.min(apy / 100, 1)} />
      </mesh>

      {/* Inner glow */}
      <mesh position={position} scale={0.8}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} wireframe />
      </mesh>
    </group>
  );
}

export default function LiquidityPoolNetwork3D() {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.z += 0.0001;
    }
  });

  const pools = [
    { position: [0, 0, 0], color: '#00f5ff', label: 'OMNI/USDT', apy: 45, tvl: 5.2 },
    { position: [8, 4, 0], color: '#10b981', label: 'ETH/USDT', apy: 28, tvl: 3.8 },
    { position: [8, -4, 0], color: '#f59e0b', label: 'BTC/USDT', apy: 22, tvl: 2.5 },
    { position: [-8, 4, 0], color: '#ec4899', label: 'OMNI/ETH', apy: 38, tvl: 4.1 },
    { position: [-8, -4, 0], color: '#3b82f6', label: 'OMNI/BTC', apy: 35, tvl: 3.9 },
    { position: [0, 8, 0], color: '#a855f7', label: 'Yield Farm', apy: 65, tvl: 6.3 },
  ];

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden bg-black/40 border border-green-500/30">
      <Canvas camera={{ position: [0, 0, 20], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[15, 15, 15]} intensity={2} color="#10b981" />
        <pointLight position={[-15, -15, 15]} intensity={1} color="#00f5ff" />

        <group ref={groupRef}>
          {/* Central hub */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.8, 32, 32]} />
            <meshPhongMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
          </mesh>

          {/* Pool nodes */}
          {pools.map((pool, idx) => (
            <PoolNode key={idx} {...pool} />
          ))}

          {/* Connection lines showing liquidity flow */}
          <lineSegments>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={pools.length * 2}
                array={new Float32Array(pools.flatMap((pool) => [0, 0, 0, pool.position[0], pool.position[1], pool.position[2]]))}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#00f5ff" transparent opacity={0.4} linewidth={2} />
          </lineSegments>

          {/* Inter-pool connections */}
          {pools.map((pool1, i) =>
            pools.slice(i + 1).map((pool2, j) => (
              <lineSegments key={`${i}-${j}`}>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    count={2}
                    array={new Float32Array([...pool1.position, ...pool2.position])}
                    itemSize={3}
                  />
                </bufferGeometry>
                <lineBasicMaterial color="#10b981" transparent opacity={0.1} linewidth={1} />
              </lineSegments>
            ))
          )}
        </group>

        <OrbitControls enableZoom autoRotate autoRotateSpeed={0.3} />
      </Canvas>
    </div>
  );
}