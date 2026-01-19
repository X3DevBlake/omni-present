import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Line } from '@react-three/drei';

function MetricNode({ metric, position, index }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + index) * 0.2;
    }
  });

  const efficiency = metric.efficiency_score || 0;
  const color = efficiency > 80 ? '#00ff88' : efficiency > 50 ? '#ffaa00' : '#ff4444';
  const size = 0.3 + (efficiency / 100) * 0.5;

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[size, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          transparent
          opacity={0.9}
        />
      </Sphere>

      <Text
        position={[0, size + 0.8, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
      >
        {efficiency.toFixed(0)}%
      </Text>

      <Text
        position={[0, -size - 0.8, 0]}
        fontSize={0.12}
        color={color}
        anchorX="center"
      >
        Agent {metric.agent_id?.slice(-4)}
      </Text>
    </group>
  );
}

export default function PerformanceMetrics3D({ metrics = [] }) {
  const positions = metrics.map((_, index) => {
    const angle = (index / metrics.length) * Math.PI * 2;
    const radius = 6;
    return [
      Math.cos(angle) * radius,
      (Math.random() - 0.5) * 3,
      Math.sin(angle) * radius,
    ];
  });

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden bg-black/20">
      <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#00ff88" />

        {/* Central performance hub */}
        <Sphere args={[1.5, 64, 64]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={0.6}
            transparent
            opacity={0.4}
            wireframe
          />
        </Sphere>

        {metrics.map((metric, index) => (
          <React.Fragment key={metric.id}>
            <MetricNode metric={metric} position={positions[index]} index={index} />
            
            <Line
              points={[[0, 0, 0], positions[index]]}
              color="#00ffff"
              lineWidth={1}
              transparent
              opacity={0.3}
            />
          </React.Fragment>
        ))}

        <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.8} />
      </Canvas>

      {metrics.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white/60">No metrics to visualize</p>
        </div>
      )}
    </div>
  );
}