import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere } from '@react-three/drei';

function MetricSphere({ metric, position }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      const scale = 0.8 + metric.value / 200;
      meshRef.current.scale.setScalar(scale);
    }
  });

  const getTrendColor = () => {
    switch (metric.trend) {
      case 'increasing': return '#44ff44';
      case 'decreasing': return '#ff8800';
      case 'volatile': return '#ff4444';
      default: return '#00f5ff';
    }
  };

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <Sphere args={[0.2, 16, 16]}>
          <meshStandardMaterial
            color={getTrendColor()}
            emissive={getTrendColor()}
            emissiveIntensity={0.5}
          />
        </Sphere>
      </mesh>
      <Text position={[0, -0.4, 0]} fontSize={0.07} color="white">
        {metric.name}
      </Text>
      <Text position={[0, 0.4, 0]} fontSize={0.08} color={getTrendColor()}>
        {metric.value.toFixed(1)}
      </Text>
    </group>
  );
}

function TimeWindowRing({ window, radius }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.05, 16, 100]} />
      <meshStandardMaterial
        color="#a855f7"
        emissive="#a855f7"
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

export default function MetricsAggregator3D({ aggregator }) {
  const allMetrics = aggregator?.metric_categories?.flatMap(cat => cat.metrics) || [];

  return (
    <div className="w-full h-[600px] bg-black/20 rounded-lg">
      <Canvas camera={{ position: [0, 3, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
        
        {aggregator && (
          <>
            <Text position={[0, 4.5, 0]} fontSize={0.4} color="#00f5ff">
              {aggregator.aggregator_name}
            </Text>
            <Text position={[0, 3.8, 0]} fontSize={0.2} color="#ffffff">
              {aggregator.aggregation_strategy.toUpperCase()}
            </Text>

            {aggregator.time_windows?.map((window, i) => (
              <TimeWindowRing key={i} window={window} radius={1 + i * 0.6} />
            ))}

            {allMetrics.slice(0, 12).map((metric, i) => {
              const angle = (i / Math.min(allMetrics.length, 12)) * Math.PI * 2;
              const radius = 2.5;
              return (
                <MetricSphere
                  key={i}
                  metric={metric}
                  position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}
                />
              );
            })}

            <group position={[0, -3.5, 0]}>
              <Text fontSize={0.15} color="#44ff44">
                {allMetrics.length} Metrics Tracked
              </Text>
              <Text position={[0, -0.4, 0]} fontSize={0.12} color="#a855f7">
                {aggregator.time_windows?.length || 0} Time Windows
              </Text>
            </group>
          </>
        )}
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}