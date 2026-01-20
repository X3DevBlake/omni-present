import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere } from '@react-three/drei';

function MetricGauge({ metric, position }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      const targetRotation = -(metric.current_value / metric.threshold) * Math.PI;
      meshRef.current.rotation.z += (targetRotation - meshRef.current.rotation.z) * 0.1;
    }
  });

  const getColor = () => {
    const ratio = metric.current_value / metric.threshold;
    if (ratio < 0.6) return '#44ff44';
    if (ratio < 0.8) return '#ffaa00';
    return '#ff4444';
  };

  return (
    <group position={position}>
      <mesh>
        <torusGeometry args={[0.4, 0.05, 16, 100, Math.PI]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh ref={meshRef}>
        <boxGeometry args={[0.3, 0.02, 0.02]} />
        <meshStandardMaterial color={getColor()} emissive={getColor()} emissiveIntensity={0.5} />
      </mesh>
      <Text position={[0, -0.6, 0]} fontSize={0.1} color="white">
        {metric.metric_name}
      </Text>
      <Text position={[0, -0.8, 0]} fontSize={0.08} color={getColor()}>
        {metric.current_value.toFixed(1)} / {metric.threshold}
      </Text>
    </group>
  );
}

function BottleneckMarker({ bottleneck, position }) {
  const colors = {
    low: '#00f5ff',
    medium: '#ffaa00',
    high: '#ff8800',
    critical: '#ff4444'
  };

  return (
    <group position={position}>
      <Sphere args={[0.15, 16, 16]}>
        <meshStandardMaterial
          color={colors[bottleneck.severity]}
          emissive={colors[bottleneck.severity]}
          emissiveIntensity={0.6}
        />
      </Sphere>
      <Text position={[0, -0.3, 0]} fontSize={0.08} color="white">
        {bottleneck.bottleneck_type}
      </Text>
    </group>
  );
}

export default function PerformanceMonitor3D({ monitor }) {
  return (
    <div className="w-full h-[600px] bg-black/20 rounded-lg">
      <Canvas camera={{ position: [0, 2, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00f5ff" />
        
        {monitor && (
          <>
            <Text position={[0, 4.5, 0]} fontSize={0.4} color="#00f5ff">
              {monitor.monitor_name}
            </Text>
            <Text position={[0, 3.8, 0]} fontSize={0.2} color="#ffffff">
              {monitor.target_system.toUpperCase()} Monitor
            </Text>
            <Text position={[0, 3.3, 0]} fontSize={0.25} color="#44ff44">
              Score: {monitor.performance_score?.toFixed(0)}%
            </Text>

            {monitor.metrics_collected?.slice(0, 4).map((metric, i) => (
              <MetricGauge
                key={i}
                metric={metric}
                position={[i * 2 - 3, 1, 0]}
              />
            ))}

            {monitor.bottlenecks_detected?.slice(0, 3).map((bottleneck, i) => (
              <BottleneckMarker
                key={i}
                bottleneck={bottleneck}
                position={[i * 2 - 2, -2, 0]}
              />
            ))}

            <group position={[0, -3.5, 0]}>
              <Text fontSize={0.12} color="#ffaa00">
                {monitor.bottlenecks_detected?.length || 0} Bottlenecks | {monitor.optimization_suggestions?.length || 0} Suggestions
              </Text>
            </group>
          </>
        )}
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}