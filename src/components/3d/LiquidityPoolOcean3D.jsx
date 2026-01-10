import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

function PoolIsland({ position, name, tvl, apy, color }) {
  const meshRef = useRef();
  const [hovered, setHovered] = React.useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
    }
  });

  const depth = Math.min(tvl / 100000, 5);

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <cylinderGeometry args={[1, 1.2, depth, 32]} />
        <MeshWobbleMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.6 : 0.3}
          factor={0.3}
          speed={2}
          transparent
          opacity={0.7}
        />
      </mesh>

      {hovered && (
        <>
          <Text position={[0, depth / 2 + 0.5, 0]} fontSize={0.3} color="white">
            {name}
          </Text>
          <Text position={[0, depth / 2 + 0.2, 0]} fontSize={0.2} color="#00ff88">
            TVL: ${(tvl / 1000).toFixed(1)}K
          </Text>
          <Text position={[0, depth / 2 - 0.1, 0]} fontSize={0.2} color="#00f5ff">
            APY: {apy}%
          </Text>
        </>
      )}

      <pointLight position={[0, depth / 2, 0]} intensity={1} color={color} distance={4} />
    </group>
  );
}

function LiquidityCurrent({ start, end, speed, color }) {
  const particlesRef = useRef();
  const [progress, setProgress] = React.useState(0);

  useFrame(() => {
    setProgress((prev) => (prev + speed * 0.01) % 1);
  });

  const curve = useMemo(() => {
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);
    return new THREE.LineCurve3(startVec, endVec);
  }, [start, end]);

  const position = curve.getPoint(progress);

  return (
    <>
      <mesh ref={particlesRef} position={position.toArray()}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
      </mesh>
      <mesh position={[position.x, position.y, position.z]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </mesh>
    </>
  );
}

function OceanSurface() {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current && meshRef.current.geometry && meshRef.current.geometry.attributes.position) {
      const positions = meshRef.current.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const z = positions[i + 2];
        positions[i + 1] = Math.sin(x * 0.5 + state.clock.elapsedTime) * 0.1 +
                           Math.cos(z * 0.5 + state.clock.elapsedTime * 0.7) * 0.1;
      }
      meshRef.current.geometry.attributes.position.needsUpdate = true;
      meshRef.current.geometry.computeVertexNormals();
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
      <planeGeometry args={[30, 30, 50, 50]} />
      <meshStandardMaterial
        color="#001a33"
        transparent
        opacity={0.6}
        wireframe={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default function LiquidityPoolOcean3D({ pools = [] }) {
  const defaultPools = [
    { id: 1, name: 'ETH/USDT', pos: [0, 0, 0], tvl: 250000, apy: 45, color: '#00f5ff' },
    { id: 2, name: 'BTC/USDC', pos: [-4, 0, -3], tvl: 380000, apy: 38, color: '#00ff88' },
    { id: 3, name: 'MATIC/ETH', pos: [4, 0, -3], tvl: 150000, apy: 62, color: '#a855f7' },
    { id: 4, name: 'LINK/ETH', pos: [-4, 0, 3], tvl: 180000, apy: 55, color: '#3b82f6' },
    { id: 5, name: 'UNI/ETH', pos: [4, 0, 3], tvl: 220000, apy: 48, color: '#ec4899' },
    { id: 6, name: 'AAVE/USDT', pos: [0, 0, -5], tvl: 120000, apy: 70, color: '#f59e0b' },
  ];

  const poolData = pools.length > 0 ? pools : defaultPools;

  const currents = [
    { start: [0, 0, 0], end: [-4, 0, -3], speed: 1, color: '#00f5ff' },
    { start: [-4, 0, -3], end: [4, 0, -3], speed: 0.8, color: '#00ff88' },
    { start: [4, 0, -3], end: [4, 0, 3], speed: 1.2, color: '#a855f7' },
    { start: [4, 0, 3], end: [-4, 0, 3], speed: 0.9, color: '#3b82f6' },
    { start: [-4, 0, 3], end: [0, 0, 0], speed: 1.1, color: '#ec4899' },
  ];

  return (
    <div className="bg-black/40 rounded-xl border border-white/10 h-[500px] overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <h3 className="text-lg font-semibold text-white">Liquidity Pool Ocean</h3>
        <p className="text-sm text-gray-400">Currents represent liquidity flow • Depth indicates TVL</p>
      </div>
      <div className="h-[calc(100%-80px)]">
        <Canvas camera={{ position: [0, 8, 12], fov: 60 }}>
          <color attach="background" args={['#000510']} />
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#00f5ff" />
          <pointLight position={[-10, 10, -10]} intensity={0.5} color="#a855f7" />

          <OceanSurface />

          {poolData.map((pool) => (
            <PoolIsland
              key={pool.id}
              position={pool.pos}
              name={pool.name}
              tvl={pool.tvl}
              apy={pool.apy}
              color={pool.color}
            />
          ))}

          {currents.map((current, i) => (
            <LiquidityCurrent
              key={i}
              start={current.start}
              end={current.end}
              speed={current.speed}
              color={current.color}
            />
          ))}

          <OrbitControls enableZoom autoRotate autoRotateSpeed={0.4} />
          <fog attach="fog" args={['#000510', 10, 30]} />
        </Canvas>
      </div>
    </div>
  );
}