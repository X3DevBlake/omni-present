import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

function AssetStar({ position, name, value, connections, allAssets }) {
  const meshRef = useRef();
  const [hovered, setHovered] = React.useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  // Brightness based on value
  const brightness = Math.min(value / 10000, 1);
  const size = 0.2 + (brightness * 0.3);
  const emissiveIntensity = 0.5 + (brightness * 0.5);

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <octahedronGeometry args={[size, 0]} />
        <meshStandardMaterial
          color="#00f5ff"
          emissive="#00f5ff"
          emissiveIntensity={hovered ? 1 : emissiveIntensity}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Glow effect */}
      <mesh>
        <sphereGeometry args={[size * 2, 16, 16]} />
        <meshBasicMaterial color="#00f5ff" transparent opacity={0.1} />
      </mesh>

      {hovered && (
        <>
          <Text position={[0, size + 0.4, 0]} fontSize={0.2} color="white">
            {name}
          </Text>
          <Text position={[0, size + 0.2, 0]} fontSize={0.15} color="#00ff88">
            ${value.toLocaleString()}
          </Text>
        </>
      )}

      <pointLight position={[0, 0, 0]} intensity={brightness * 2} color="#00f5ff" distance={3} />
    </group>
  );
}

function AssetConnection({ start, end, strength }) {
  const points = useMemo(() => {
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);
    return [startVec, endVec];
  }, [start, end]);

  const color = strength > 0.7 ? '#00ff88' : strength > 0.4 ? '#00f5ff' : '#a855f7';

  return (
    <Line
      points={points}
      color={color}
      lineWidth={strength * 3}
      transparent
      opacity={0.3 + strength * 0.3}
    />
  );
}

function StarField() {
  const starsRef = useRef();

  useFrame(() => {
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.0002;
    }
  });

  const starPositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < 500; i++) {
      const x = (Math.random() - 0.5) * 50;
      const y = (Math.random() - 0.5) * 50;
      const z = (Math.random() - 0.5) * 50;
      positions.push(x, y, z);
    }
    return new Float32Array(positions);
  }, []);

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={starPositions.length / 3}
          array={starPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#ffffff" transparent opacity={0.6} />
    </points>
  );
}

export default function CryptoAssetConstellations3D({ assets = [] }) {
  const defaultAssets = [
    { id: 1, name: 'BTC', value: 45000, pos: [0, 2, 0], connections: [2, 3] },
    { id: 2, name: 'ETH', value: 32000, pos: [-2, 1, -1], connections: [1, 3, 4] },
    { id: 3, name: 'USDT', value: 28000, pos: [2, 1, -1], connections: [1, 2, 5] },
    { id: 4, name: 'BNB', value: 15000, pos: [-3, -1, 1], connections: [2, 6] },
    { id: 5, name: 'USDC', value: 25000, pos: [3, -1, 1], connections: [3, 7] },
    { id: 6, name: 'SOL', value: 12000, pos: [-2, -2, -2], connections: [4] },
    { id: 7, name: 'ADA', value: 10000, pos: [2, -2, -2], connections: [5] },
    { id: 8, name: 'MATIC', value: 8000, pos: [0, 0, 2], connections: [2, 3] },
  ];

  const assetData = assets.length > 0 ? assets : defaultAssets;

  const connections = useMemo(() => {
    const conns = [];
    assetData.forEach((asset) => {
      asset.connections?.forEach((connId) => {
        const connAsset = assetData.find((a) => a.id === connId);
        if (connAsset) {
          const strength = Math.random() * 0.5 + 0.5;
          conns.push({
            start: asset.pos,
            end: connAsset.pos,
            strength,
          });
        }
      });
    });
    return conns;
  }, [assetData]);

  return (
    <div className="bg-black/40 rounded-xl border border-white/10 h-[500px] overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <h3 className="text-lg font-semibold text-white">Crypto Asset Constellations</h3>
        <p className="text-sm text-gray-400">Star brightness indicates value • Connections show dependencies</p>
      </div>
      <div className="h-[calc(100%-80px)]">
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
          <color attach="background" args={['#000510']} />
          <ambientLight intensity={0.2} />

          <StarField />

          {connections.map((conn, i) => (
            <AssetConnection
              key={i}
              start={conn.start}
              end={conn.end}
              strength={conn.strength}
            />
          ))}

          {assetData.map((asset) => (
            <AssetStar
              key={asset.id}
              position={asset.pos}
              name={asset.name}
              value={asset.value}
              connections={asset.connections}
              allAssets={assetData}
            />
          ))}

          <OrbitControls enableZoom autoRotate autoRotateSpeed={0.3} />
        </Canvas>
      </div>
    </div>
  );
}