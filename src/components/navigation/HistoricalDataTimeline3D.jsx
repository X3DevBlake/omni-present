import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import * as THREE from 'three';

function TimelinePoint({ position, data, index, color }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + index) * 0.2;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </mesh>
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
      >
        {data.label}
      </Text>
    </group>
  );
}

function TimelinePath({ points }) {
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(
      points.map(p => new THREE.Vector3(...p))
    );
  }, [points]);

  const tubeGeometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 100, 0.05, 8, false);
  }, [curve]);

  return (
    <mesh geometry={tubeGeometry}>
      <meshBasicMaterial color="#00f5ff" transparent opacity={0.3} />
    </mesh>
  );
}

export default function HistoricalDataTimeline3D() {
  const { data: historicalData } = useQuery({
    queryKey: ['historical-nav-data'],
    queryFn: async () => {
      const data = [];
      const now = Date.now();
      
      for (let i = 0; i < 10; i++) {
        data.push({
          timestamp: now - (i * 24 * 60 * 60 * 1000),
          label: `Day ${10 - i}`,
          value: Math.floor(50 + Math.random() * 50),
          type: ['agents', 'simulations', 'transactions'][Math.floor(Math.random() * 3)],
        });
      }
      
      return data.reverse();
    },
  });

  const positions = useMemo(() => {
    if (!historicalData) return [];
    return historicalData.map((d, i) => [
      i * 2 - 10,
      (d.value / 100) * 3,
      0,
    ]);
  }, [historicalData]);

  const colorMap = {
    agents: '#00f5ff',
    simulations: '#a855f7',
    transactions: '#00ff88',
  };

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden bg-black/20">
      <Canvas camera={{ position: [0, 3, 15], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} />

        {historicalData && positions.length > 1 && (
          <>
            <TimelinePath points={positions} />
            {historicalData.map((data, i) => (
              <TimelinePoint
                key={i}
                position={positions[i]}
                data={data}
                index={i}
                color={colorMap[data.type]}
              />
            ))}
          </>
        )}

        <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}