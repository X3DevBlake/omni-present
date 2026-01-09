import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

function DataLandscape({ data = [] }) {
  const groupRef = useRef();
  const dataPoints = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return Array.from({ length: 50 }, () => ({
        x: (Math.random() - 0.5) * 20,
        y: Math.random() * 10,
        z: (Math.random() - 0.5) * 20,
        value: Math.random() * 100
      }));
    }
    return data.slice(0, 50);
  }, [data]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={groupRef}>
        {/* Terrain mesh */}
        <mesh position={[0, -3, 0]}>
          <planeGeometry args={[20, 20, 50, 50]} />
          <meshStandardMaterial
            color="#00f5ff"
            emissive="#00f5ff"
            emissiveIntensity={0.1}
            wireframe={true}
            metalness={0.5}
            roughness={0.5}
            transparent={true}
            opacity={0.6}
          />
        </mesh>

        {/* Data points */}
        {dataPoints.map((point, idx) => (
          <mesh
            key={idx}
            position={[point.x || 0, point.y || 0, point.z || 0]}
          >
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial
              color={`hsl(${(point.value || 0) / 100 * 360}, 100%, 50%)`}
              emissive={`hsl(${(point.value || 0) / 100 * 360}, 100%, 50%)`}
              emissiveIntensity={0.5}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        ))}

        {/* Connection lines between nearby points */}
        {dataPoints.slice(0, 10).map((point, idx) => (
          <mesh key={`connection-${idx}`} position={[point.x || 0, point.y || 0, point.z || 0]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial
              color="#a855f7"
              emissive="#a855f7"
              emissiveIntensity={0.3}
              transparent={true}
              opacity={0.2}
            />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

export default function Data3DVisualizer({ data, title = "3D Data Landscape" }) {
  return (
    <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl overflow-hidden">
      <div className="h-[400px] relative">
        <Canvas camera={{ position: [15, 10, 15], fov: 60 }}>
          <color attach="background" args={['#0a0a0f']} />
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#00f5ff" />
          <pointLight position={[-10, -10, -10]} intensity={0.8} color="#a855f7" />

          <DataLandscape data={data} />

          <Environment preset="night" />
          <OrbitControls enableZoom autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>
      <div className="p-4 border-t border-white/10">
        <h3 className="text-white font-bold text-sm">{title}</h3>
        <p className="text-white/60 text-xs mt-1">
          {Array.isArray(data) && data.length > 0 ? `${data.length} data points` : 'Awaiting data...'}
        </p>
      </div>
    </div>
  );
}