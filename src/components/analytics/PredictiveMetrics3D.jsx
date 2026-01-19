import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

function MetricBar({ metric, position }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
    }
  });
  
  const height = (metric.current_value / (metric.target_value || 100)) * 3;
  const predictedHeight = metric.prediction ? 
    (metric.prediction.next_value / (metric.target_value || 100)) * 3 : height;
  
  // Color based on trend
  const trendColors = {
    up: '#10b981',
    down: '#ef4444',
    stable: '#3b82f6'
  };
  
  const color = trendColors[metric.trend_direction] || '#3b82f6';
  
  return (
    <group position={position}>
      {/* Current value bar */}
      <mesh ref={meshRef} position={[0, height / 2, 0]}>
        <boxGeometry args={[0.5, height, 0.5]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
      
      {/* Prediction ghost bar */}
      {metric.prediction && (
        <mesh position={[0.7, predictedHeight / 2, 0]}>
          <boxGeometry args={[0.5, predictedHeight, 0.5]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={0.4}
            wireframe
          />
        </mesh>
      )}
      
      {/* Metric name */}
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        rotation={[0, 0, 0]}
      >
        {metric.metric_name}
      </Text>
      
      {/* Current value */}
      <Text
        position={[0, height + 0.3, 0]}
        fontSize={0.2}
        color={color}
        anchorX="center"
      >
        {metric.current_value.toFixed(1)}
      </Text>
      
      {/* Prediction */}
      {metric.prediction && (
        <Text
          position={[0.7, predictedHeight + 0.3, 0]}
          fontSize={0.15}
          color="#fbbf24"
          anchorX="center"
        >
          ↗ {metric.prediction.next_value.toFixed(1)}
        </Text>
      )}
      
      {/* Target line */}
      {metric.target_value && (
        <Line
          points={[
            [-0.4, (metric.target_value / 100) * 3, 0],
            [0.4, (metric.target_value / 100) * 3, 0]
          ]}
          color="#fbbf24"
          lineWidth={2}
          dashed
          dashSize={0.1}
          gapSize={0.05}
        />
      )}
    </group>
  );
}

export default function PredictiveMetrics3D({ metrics }) {
  const positions = useMemo(() => {
    if (!metrics || metrics.length === 0) return [];
    
    const spacing = 2;
    return metrics.map((_, idx) => {
      const col = idx % 5;
      const row = Math.floor(idx / 5);
      
      return [
        (col - 2) * spacing,
        0,
        row * spacing - 2
      ];
    });
  }, [metrics]);
  
  if (!metrics || metrics.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white">
        <p>No metrics available</p>
      </div>
    );
  }
  
  return (
    <Canvas camera={{ position: [5, 5, 8], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#00f5ff" />
      
      {/* Grid floor */}
      <gridHelper args={[20, 20, '#334155', '#1e293b']} />
      
      {/* Metric bars */}
      {metrics.map((metric, idx) => (
        <MetricBar
          key={metric.id || idx}
          metric={metric}
          position={positions[idx]}
        />
      ))}
      
      {/* Title */}
      <Text
        position={[0, 5, -5]}
        fontSize={0.5}
        color="white"
        anchorX="center"
      >
        Predictive Analytics
      </Text>
      
      <OrbitControls
        enableZoom={true}
        minDistance={5}
        maxDistance={20}
      />
    </Canvas>
  );
}