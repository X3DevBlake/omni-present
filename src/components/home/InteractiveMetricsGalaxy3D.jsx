import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Trail, Stars } from '@react-three/drei';
import * as THREE from 'three';

function MetricPlanet({ metric, position, index }) {
  const meshRef = useRef();
  const orbitRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current && orbitRef.current) {
      orbitRef.current.rotation.y += 0.002 * (index + 1);
      meshRef.current.rotation.y += 0.01;
      
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.1;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  const size = 0.3 + (metric.value / 100) * 0.4;
  const color = metric.trend === 'up' ? '#44ff44' : metric.trend === 'down' ? '#ff4444' : '#00f5ff';

  return (
    <group ref={orbitRef}>
      <Trail width={2} length={6} color={color} attenuation={(t) => t * t}>
        <mesh ref={meshRef} position={position}>
          <Sphere args={[size, 32, 32]}>
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.6}
              metalness={0.8}
              roughness={0.2}
            />
          </Sphere>
        </mesh>
      </Trail>
      
      <Text
        position={[position[0], position[1] + size + 0.3, position[2]]}
        fontSize={0.15}
        color="white"
        anchorX="center"
      >
        {metric.label}
      </Text>
      <Text
        position={[position[0], position[1] - size - 0.3, position[2]]}
        fontSize={0.2}
        color={color}
        anchorX="center"
      >
        {metric.value}
      </Text>
    </group>
  );
}

function CentralCore() {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.003;
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[0.8, 2]} />
      <meshStandardMaterial
        color="#a855f7"
        emissive="#a855f7"
        emissiveIntensity={0.8}
        wireframe
      />
    </mesh>
  );
}

export default function InteractiveMetricsGalaxy3D({ metrics = [] }) {
  const defaultMetrics = [
    { label: 'Active Agents', value: 42, trend: 'up' },
    { label: 'Models Deployed', value: 18, trend: 'up' },
    { label: 'Collaborations', value: 7, trend: 'stable' },
    { label: 'System Health', value: 98, trend: 'stable' },
    { label: 'Security Score', value: 87, trend: 'up' },
    { label: 'Predictions', value: 156, trend: 'up' }
  ];

  const displayMetrics = metrics.length > 0 ? metrics : defaultMetrics;

  return (
    <div className="w-full h-[600px] bg-black/20 rounded-xl overflow-hidden">
      <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
        <pointLight position={[0, 10, -10]} intensity={0.5} color="#00f5ff" />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        <CentralCore />

        {displayMetrics.map((metric, index) => {
          const angle = (index / displayMetrics.length) * Math.PI * 2;
          const radius = 3 + Math.random() * 2;
          return (
            <MetricPlanet
              key={index}
              metric={metric}
              position={[
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                (Math.random() - 0.5) * 2
              ]}
              index={index}
            />
          );
        })}

        <Text position={[0, 6, 0]} fontSize={0.4} color="#00f5ff">
          Platform Metrics Galaxy
        </Text>
        
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}