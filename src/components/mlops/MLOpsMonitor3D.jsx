import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Torus } from '@react-three/drei';

function HealthIndicator({ health }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 0.9;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  const color = health > 80 ? '#10b981' : health > 60 ? '#fbbf24' : '#ef4444';

  return (
    <Sphere ref={meshRef} args={[1.5, 64, 64]}>
      <meshStandardMaterial 
        color={color}
        emissive={color}
        emissiveIntensity={0.8}
      />
    </Sphere>
  );
}

export default function MLOpsMonitor3D({ monitor }) {
  const health = monitor?.health_score || 87;
  const drift = monitor?.drift_detection?.data_drift_score || 0.12;

  return (
    <Canvas camera={{ position: [0, 3, 10], fov: 60 }} style={{ height: '600px' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[15, 15, 15]} intensity={1.5} />
      <pointLight position={[-15, 5, -15]} intensity={0.8} color="#10b981" />

      <HealthIndicator health={health} />

      <Torus args={[3, 0.15, 16, 100]} rotation={[Math.PI/2, 0, 0]}>
        <meshStandardMaterial 
          color="#60a5fa" 
          emissive="#60a5fa" 
          emissiveIntensity={0.4}
          transparent
          opacity={0.6}
        />
      </Torus>

      <Text position={[0, 4, 0]} fontSize={0.6} color="white" anchorX="center">
        MLOps Monitor
      </Text>
      <Text position={[0, 3.3, 0]} fontSize={0.3} color="#60a5fa" anchorX="center">
        {monitor?.monitor_name || 'Production Health'}
      </Text>

      <group position={[0, -3, 0]}>
        <Text fontSize={0.5} color={health > 80 ? '#10b981' : '#fbbf24'} anchorX="center">
          Health: {health}%
        </Text>
        <Text position={[0, -0.7, 0]} fontSize={0.3} color="#60a5fa" anchorX="center">
          Drift: {(drift * 100).toFixed(1)}%
        </Text>
        <Text position={[0, -1.3, 0]} fontSize={0.25} color={monitor?.retraining_recommended ? '#fbbf24' : '#10b981'} anchorX="center">
          {monitor?.retraining_recommended ? 'Retraining Recommended' : 'Performing Well'}
        </Text>
      </group>

      <OrbitControls enableZoom={true} minDistance={6} maxDistance={15} />
    </Canvas>
  );
}