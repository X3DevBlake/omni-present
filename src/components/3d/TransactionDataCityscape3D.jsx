import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

function Building({ position, height, value, label }) {
  const meshRef = useRef();
  const [hovered, setHovered] = React.useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.01;
    }
  });

  const color = height > 3 ? '#00ff88' : height > 2 ? '#00f5ff' : '#a855f7';

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        position={[0, height / 2, 0]}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        scale={hovered ? 1.05 : 1}
      >
        <boxGeometry args={[0.8, height, 0.8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.8 : 0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      {hovered && (
        <Text position={[0, height + 0.5, 0]} fontSize={0.15} color="white">
          {label}: ${value}K
        </Text>
      )}
      {/* Light beam at top */}
      <pointLight position={[0, height, 0]} intensity={height * 0.5} color={color} distance={5} />
    </group>
  );
}

function DataTrail({ startPos, endPos, color }) {
  const lineRef = useRef();
  const [progress, setProgress] = React.useState(0);

  useFrame(() => {
    setProgress((prev) => (prev + 0.02) % 1);
  });

  const curve = useMemo(() => {
    const start = new THREE.Vector3(...startPos);
    const end = new THREE.Vector3(...endPos);
    const mid = new THREE.Vector3(
      (start.x + end.x) / 2,
      Math.max(start.y, end.y) + 2,
      (start.z + end.z) / 2
    );
    return new THREE.QuadraticBezierCurve3(start, mid, end);
  }, [startPos, endPos]);

  const points = curve.getPoints(50);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <>
      <line ref={lineRef}>
        <bufferGeometry attach="geometry" {...geometry} />
        <lineBasicMaterial color={color} transparent opacity={0.3} linewidth={2} />
      </line>
      {/* Moving particle */}
      <mesh position={curve.getPoint(progress).toArray()}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
      </mesh>
    </>
  );
}

function CityGrid() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial
        color="#0a0a0f"
        transparent
        opacity={0.8}
        wireframe
      />
    </mesh>
  );
}

export default function TransactionDataCityscape3D({ transactions = [] }) {
  const defaultTransactions = [
    { id: 1, pos: [-3, 0, -3], height: 4, value: 1250, label: 'ETH Transfer' },
    { id: 2, pos: [-1, 0, -3], height: 2.5, value: 850, label: 'Token Swap' },
    { id: 3, pos: [1, 0, -3], height: 3.5, value: 1100, label: 'NFT Sale' },
    { id: 4, pos: [3, 0, -3], height: 1.8, value: 600, label: 'Staking' },
    { id: 5, pos: [-3, 0, -1], height: 2.2, value: 750, label: 'Liquidity Add' },
    { id: 6, pos: [-1, 0, -1], height: 3.8, value: 1300, label: 'DeFi Loan' },
    { id: 7, pos: [1, 0, -1], height: 2.8, value: 920, label: 'Bridge' },
    { id: 8, pos: [3, 0, -1], height: 1.5, value: 500, label: 'Deposit' },
    { id: 9, pos: [-3, 0, 1], height: 3.2, value: 1050, label: 'Yield Farm' },
    { id: 10, pos: [-1, 0, 1], height: 4.2, value: 1400, label: 'Large TX' },
    { id: 11, pos: [1, 0, 1], height: 2.0, value: 680, label: 'Withdrawal' },
    { id: 12, pos: [3, 0, 1], height: 3.0, value: 980, label: 'Governance' },
  ];

  const txData = transactions.length > 0 ? transactions : defaultTransactions;

  const dataTrails = [
    { start: [-3, 4, -3], end: [-1, 3.8, -1], color: '#00ff88' },
    { start: [1, 3.5, -3], end: [1, 3.2, 1], color: '#00f5ff' },
    { start: [3, 1.8, -3], end: [-3, 2.2, -1], color: '#a855f7' },
    { start: [-1, 2.5, -3], end: [3, 3, 1], color: '#ec4899' },
  ];

  return (
    <div className="bg-black/40 rounded-xl border border-white/10 h-[500px] overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <h3 className="text-lg font-semibold text-white">Transaction Data Cityscape</h3>
        <p className="text-sm text-gray-400">Building height represents transaction value • Light trails show data flow</p>
      </div>
      <div className="h-[calc(100%-80px)]">
        <Canvas camera={{ position: [8, 6, 8], fov: 60 }}>
          <color attach="background" args={['#000000']} />
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#00f5ff" />
          <pointLight position={[-10, 10, -10]} intensity={0.5} color="#a855f7" />

          <CityGrid />

          {txData.map((tx) => (
            <Building
              key={tx.id}
              position={tx.pos}
              height={tx.height}
              value={tx.value}
              label={tx.label}
            />
          ))}

          {dataTrails.map((trail, i) => (
            <DataTrail
              key={i}
              startPos={trail.start}
              endPos={trail.end}
              color={trail.color}
            />
          ))}

          <OrbitControls enableZoom autoRotate autoRotateSpeed={0.5} />
          <fog attach="fog" args={['#000000', 5, 25]} />
        </Canvas>
      </div>
    </div>
  );
}