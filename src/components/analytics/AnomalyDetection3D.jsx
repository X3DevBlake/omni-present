import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function AnomalyNode({ position, anomaly, isSelected, onClick }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      if (isSelected) {
        meshRef.current.scale.setScalar(1.2 + Math.sin(state.clock.elapsedTime * 3) * 0.1);
      }
    }
  });

  const severityColors = {
    critical: '#ff4444',
    high: '#ff8800',
    medium: '#ffcc00',
    low: '#4488ff',
  };

  const color = severityColors[anomaly.severity] || '#888888';

  return (
    <group position={position} onClick={onClick}>
      <Sphere ref={meshRef} args={[0.5, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 1 : 0.5}
          transparent
          opacity={0.8}
        />
      </Sphere>

      {/* Pulsing ring for critical anomalies */}
      {anomaly.severity === 'critical' && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.6, 0.8, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.3} />
        </mesh>
      )}

      <Text
        position={[0, -1, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
      >
        {anomaly.alert_type?.replace('_', ' ')}
      </Text>
    </group>
  );
}

export default function AnomalyDetection3D({ anomalies, selected }) {
  const positions = anomalies.map((_, index) => {
    const angle = (index / anomalies.length) * Math.PI * 2;
    const radius = 4;
    return [
      Math.cos(angle) * radius,
      (Math.random() - 0.5) * 2,
      Math.sin(angle) * radius,
    ];
  });

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden bg-black/20">
      <Canvas camera={{ position: [0, 2, 10], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff4444" />

        {anomalies.map((anomaly, index) => (
          <AnomalyNode
            key={anomaly.id}
            position={positions[index]}
            anomaly={anomaly}
            isSelected={selected?.id === anomaly.id}
            onClick={() => {}}
          />
        ))}

        <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={1} />
      </Canvas>

      {anomalies.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white/60">No anomalies to visualize</p>
        </div>
      )}
    </div>
  );
}