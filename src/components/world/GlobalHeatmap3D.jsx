import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';

function HeatmapPoint({ position, intensity, label, type }) {
  const pointRef = useRef();

  useFrame((state) => {
    if (pointRef.current) {
      pointRef.current.rotation.y += 0.02;
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.05;
      pointRef.current.scale.set(1 + pulse, 1 + pulse, 1 + pulse);
    }
  });

  const color = new THREE.Color();
  color.setHSL(0.6 - intensity * 0.6, 1, 0.5); // Blue (cool) to Red (hot)

  return (
    <group position={position}>
      <Sphere ref={pointRef} args={[0.2 + intensity * 0.3, 16, 16]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5 + intensity * 0.5}
          transparent
          opacity={0.7}
        />
      </Sphere>
      <Html position={[0, 0.5, 0]} center style={{ pointerEvents: 'none' }}>
        <div className="text-white text-xs font-bold drop-shadow-lg">
          {Math.round(intensity * 100)}%
        </div>
      </Html>
    </group>
  );
}

function Globe3D() {
  const globeRef = useRef();

  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.002;
    }
  });

  return (
    <Sphere ref={globeRef} args={[2, 64, 64]}>
      <meshStandardMaterial
        color="#1e293b"
        metalness={0.4}
        roughness={0.6}
        opacity={0.5}
        transparent
      />
    </Sphere>
  );
}

export default function GlobalHeatmap3D({ dataPoints }) {
  // Convert data to 3D positions on globe surface
  const heatmapPoints = useMemo(() => {
    return dataPoints.slice(0, 30).map((point, idx) => {
      const phi = Math.random() * Math.PI;
      const theta = Math.random() * Math.PI * 2;
      const radius = 2.2;
      
      return {
        position: [
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta)
        ],
        intensity: point.intensity || Math.random(),
        label: point.label || `Point ${idx}`,
        type: point.type || 'general'
      };
    });
  }, [dataPoints]);

  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ef4444" />

      <Globe3D />

      {heatmapPoints.map((point, idx) => (
        <HeatmapPoint
          key={idx}
          position={point.position}
          intensity={point.intensity}
          label={point.label}
          type={point.type}
        />
      ))}

      <OrbitControls
        enableZoom={true}
        minDistance={4}
        maxDistance={10}
        autoRotate
        autoRotateSpeed={0.3}
      />
    </Canvas>
  );
}