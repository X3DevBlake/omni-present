import React, { useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

function HeatmapOverlay({ heatmapData, type }) {
  const meshRef = React.useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
  });

  const getHeatColor = (intensity) => {
    if (type === 'activity') {
      return new THREE.Color().setHSL(0.6 - intensity * 0.6, 1, 0.5);
    } else {
      return new THREE.Color().setHSL(0, intensity, 0.5);
    }
  };

  return (
    <group ref={meshRef}>
      <Sphere args={[2.05, 64, 64]}>
        <meshBasicMaterial
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </Sphere>

      {heatmapData.map((point, i) => {
        const phi = (90 - point.lat) * (Math.PI / 180);
        const theta = (point.lng + 180) * (Math.PI / 180);
        const radius = 2.1;
        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const z = radius * Math.sin(phi) * Math.sin(theta);
        const y = radius * Math.cos(phi);

        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[0.15 * point.intensity, 16, 16]} />
            <meshBasicMaterial
              color={getHeatColor(point.intensity)}
              transparent
              opacity={0.7}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export default function GlobalHeatmap({ type = 'activity' }) {
  const [heatmapData] = useState([
    { lat: 40.7128, lng: -74.0060, intensity: 0.9, label: 'New York' },
    { lat: 51.5074, lng: -0.1278, intensity: 0.8, label: 'London' },
    { lat: 35.6762, lng: 139.6503, intensity: 0.95, label: 'Tokyo' },
    { lat: -33.8688, lng: 151.2093, intensity: 0.6, label: 'Sydney' },
    { lat: 48.8566, lng: 2.3522, intensity: 0.75, label: 'Paris' },
    { lat: 37.7749, lng: -122.4194, intensity: 0.85, label: 'San Francisco' },
    { lat: 22.3193, lng: 114.1694, intensity: 0.7, label: 'Hong Kong' },
  ]);

  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00f5ff" />
        
        <Sphere args={[2, 64, 64]}>
          <meshStandardMaterial
            color="#0ea5e9"
            emissive="#0ea5e9"
            emissiveIntensity={0.2}
            wireframe
            transparent
            opacity={0.6}
          />
        </Sphere>

        <HeatmapOverlay heatmapData={heatmapData} type={type} />
      </Canvas>
    </div>
  );
}