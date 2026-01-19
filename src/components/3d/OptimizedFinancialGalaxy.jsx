import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import { useOptimizedQuery } from '../hooks/useOptimizedQuery';
import { base44 } from '@/api/base44Client';
import { useLOD, InstancedObjects } from './LODManager';
import * as THREE from 'three';

function OptimizedTransactionPoints() {
  const groupRef = useRef();
  const lod = useLOD(groupRef, [20, 50, 100]);

  const { data: transactions } = useOptimizedQuery(
    ['recent-transactions-3d'],
    async () => {
      const txs = await base44.entities.OmniTransaction.list('-created_date', 100);
      return txs;
    },
    { queryType: 'realtime' }
  );

  const positions = useMemo(() => {
    if (!transactions) return [];
    return transactions.map((tx, i) => {
      const angle = (i / transactions.length) * Math.PI * 2;
      const radius = 5 + (tx.amount / 1000);
      return {
        x: Math.cos(angle) * radius,
        y: (Math.random() - 0.5) * 10,
        z: Math.sin(angle) * radius,
      };
    });
  }, [transactions]);

  const geometry = useMemo(() => new THREE.SphereGeometry(0.1, lod === 2 ? 16 : lod === 1 ? 8 : 4), [lod]);
  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: '#00f5ff' }), []);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={groupRef}>
      {lod > 0 && positions.length > 0 && (
        <InstancedObjects 
          count={positions.length}
          geometry={geometry}
          material={material}
          positions={positions}
        />
      )}
    </group>
  );
}

export default function OptimizedFinancialGalaxy() {
  return (
    <div className="w-full h-96 rounded-lg overflow-hidden">
      <Canvas camera={{ position: [0, 0, 30] }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} />
        <Stars radius={100} depth={50} count={3000} factor={4} />
        <OptimizedTransactionPoints />
        <OrbitControls enableZoom={true} enablePan={false} />
      </Canvas>
    </div>
  );
}