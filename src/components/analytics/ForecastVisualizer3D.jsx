import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

function ForecastCurve({ data }) {
  const points = useMemo(() => {
    if (!data?.forecast) return [];
    return data.forecast.map((point, i) => {
      return new THREE.Vector3(
        i * 0.5 - 2,
        (point.predicted_value / 100) * 5,
        0
      );
    });
  }, [data]);

  return points.length > 0 ? (
    <Line
      points={points}
      color="#a855f7"
      lineWidth={3}
    />
  ) : null;
}

function ConfidenceBand({ data }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.material.opacity = 0.2 + Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  if (!data?.forecast) return null;

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[data.forecast.length * 0.5, 5]} />
      <meshBasicMaterial color="#a855f7" transparent opacity={0.2} side={THREE.DoubleSide} />
    </mesh>
  );
}

export default function ForecastVisualizer3D({ data }) {
  return (
    <div className="w-full h-96 rounded-lg overflow-hidden bg-black/20">
      <Canvas camera={{ position: [0, 3, 8], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />

        {data && (
          <>
            <ForecastCurve data={data} />
            <ConfidenceBand data={data} />

            {/* Current value marker */}
            <Sphere args={[0.3, 32, 32]} position={[-2, (data.current_value / 100) * 5, 0]}>
              <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={0.5} />
            </Sphere>

            <Text
              position={[-2, (data.current_value / 100) * 5 + 0.8, 0]}
              fontSize={0.3}
              color="#00f5ff"
              anchorX="center"
            >
              Current
            </Text>
          </>
        )}

        <OrbitControls enableZoom={true} enablePan={false} />
        <gridHelper args={[10, 10, '#ffffff20', '#ffffff10']} />
      </Canvas>

      {!data && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white/60">Generate forecast to visualize</p>
        </div>
      )}
    </div>
  );
}